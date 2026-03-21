import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { updateMissionProgress } from "@/lib/missions";
import { handleMissionEvent } from "@/lib/missions/mission-progress-service";
import { checkAndAwardBadges } from "@/lib/badges";
import { rateLimit } from "@/lib/rate-limit";
import { track } from "@/lib/analytics";
import { executeBuyShares, AmmError } from "@/lib/amm/engine";
import { ensureAmmStateForEvent } from "@/lib/amm/ensure-amm-state";
import { executeBuySharesMultiOutcome } from "@/lib/amm/multi-outcome-engine";
import { updateUserProfileFromTrade } from "@/lib/personalization";
import { invalidatePriceCache } from "@/lib/cache/price";
import { invalidateTrendingCache } from "@/lib/cache/trending";
import { invalidateFeedCache } from "@/lib/feed-cache";
import {
  getValidOutcomeKeys,
  isMarketTypeId,
  MULTI_OPTION_MARKET_TYPES,
} from "@/lib/market-types";

const PREDICTIONS_LIMIT = 15; // previsioni per user per minuto
const SCALE = 1_000_000;

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Devi essere autenticato per fare una previsione" },
        { status: 401 }
      );
    }

    const limited = rateLimit(`Prediction:${session.user.id}`, PREDICTIONS_LIMIT);
    if (limited) {
      return NextResponse.json(
        { error: "Troppe previsioni in poco tempo. Riprova tra un minuto." },
        { status: 429 }
      );
    }

    const body = await request.json().catch(() => ({}));
    const eventId =
      typeof body.eventId === "string" ? body.eventId.trim() : null;
    const outcome =
      typeof body.outcome === "string" && body.outcome.trim() !== ""
        ? body.outcome.trim()
        : null;
    const credits = typeof body.credits === "number" ? body.credits : Number(body.credits);
    const maxCostMicrosRaw = body.maxCostMicros != null ? body.maxCostMicros : null;
    const idempotencyKey = typeof body.idempotencyKey === "string" ? body.idempotencyKey.trim() : null;

    if (!eventId || !outcome) {
      return NextResponse.json(
        { error: "EventId e outcome sono obbligatori" },
        { status: 400 }
      );
    }

    const event = await prisma.event.findUnique({
      where: { id: eventId },
      select: {
        id: true,
        title: true,
        category: true,
        probability: true,
        resolved: true,
        closesAt: true,
        tradingMode: true,
        marketType: true,
        outcomes: true,
        b: true,
        q_yes: true,
        q_no: true,
      },
    });

    if (!event) {
      return NextResponse.json(
        { error: "Evento non trovato" },
        { status: 404 }
      );
    }

    if (event.tradingMode !== "AMM") {
      return NextResponse.json(
        { error: "Solo mercati AMM supportati." },
        { status: 400 }
      );
    }

    const marketType = event.marketType ?? "BINARY";
    const isMultiOutcomeMarket =
      isMarketTypeId(marketType) &&
      MULTI_OPTION_MARKET_TYPES.includes(marketType);
    if (isMultiOutcomeMarket) {
      const validOutcomeKeys = getValidOutcomeKeys(event.outcomes);
      if (!validOutcomeKeys.includes(outcome)) {
        return NextResponse.json(
          {
            error: `Outcome non valido. Opzioni ammesse: ${validOutcomeKeys.join(", ")}`,
          },
          { status: 400 }
        );
      }
    } else if (outcome !== "YES" && outcome !== "NO") {
      return NextResponse.json(
        { error: "Per mercati binari l'outcome deve essere YES o NO" },
        { status: 400 }
      );
    }

    if (!isMultiOutcomeMarket) {
      await ensureAmmStateForEvent(prisma, eventId);
    }
    const maxCostMicros =
      maxCostMicrosRaw != null
        ? BigInt(typeof maxCostMicrosRaw === "string" ? maxCostMicrosRaw : Math.floor(maxCostMicrosRaw))
        : (typeof credits === "number" && !Number.isNaN(credits) && credits >= 1 ? BigInt(Math.floor(credits) * SCALE) : null);
    if (!maxCostMicros || maxCostMicros <= 0n) {
      return NextResponse.json(
        { error: "Indica l'importo massimo da spendere (maxCostMicros o credits)" },
        { status: 400 }
      );
    }
    if (!idempotencyKey) {
      return NextResponse.json(
        { error: "idempotencyKey obbligatorio" },
        { status: 400 }
      );
    }

    let tradeResult:
      | Awaited<ReturnType<typeof executeBuyShares>>
      | Awaited<ReturnType<typeof executeBuySharesMultiOutcome>>;
    try {
      tradeResult = await prisma.$transaction((tx) => {
        if (isMultiOutcomeMarket) {
          return executeBuySharesMultiOutcome(tx, {
            eventId,
            userId: session.user.id,
            outcome,
            maxCostMicros,
            idempotencyKey,
          });
        }
        return executeBuyShares(tx, {
          eventId,
          userId: session.user.id,
          outcome: outcome as "YES" | "NO",
          maxCostMicros,
          idempotencyKey,
        });
      });
    } catch (err) {
      if (err instanceof AmmError) {
        const status =
          err.code === "MARKET_CLOSED" || err.code === "MARKET_RESOLVED" || err.code === "INSUFFICIENT_BALANCE"
            ? 400
            : err.code === "USER_NOT_FOUND"
              ? 404
              : 400;
        const userMessage =
          err.code === "INSUFFICIENT_BALANCE"
            ? "Saldo insufficiente"
            : err.code === "MARKET_CLOSED" || err.code === "MARKET_RESOLVED"
              ? "Mercato chiuso o già risolto"
              : err.code === "AMM_STATE_NOT_FOUND"
                ? "Mercato non pronto. Riprova più tardi."
                : err.message;
        return NextResponse.json({ error: userMessage }, { status });
      }
      throw err;
    }

    const userId = session.user.id;
    updateMissionProgress(prisma, userId, "MAKE_PREDICTIONS", 1, event.category).catch((e) =>
      console.error("Mission progress update error:", e)
    );
    handleMissionEvent(prisma, userId, "PLACE_PREDICTION", {
      eventId: event.id,
      category: event.category,
      probability: event.probability ?? undefined,
      outcome,
      amount: Number(tradeResult.actualCostMicros) / SCALE,
    }).catch((e) => console.error("Mission event (place prediction) error:", e));
    checkAndAwardBadges(prisma, userId).catch((e) =>
      console.error("Badge check error:", e)
    );
    updateUserProfileFromTrade(prisma, userId).catch((e) =>
      console.error("User profile update error:", e)
    );
    track(
      "PREDICTION_PLACED",
      {
        userId,
        eventId: event.id,
        amount: Number(tradeResult.actualCostMicros) / SCALE,
        outcome,
        category: event.category,
      },
      { request }
    );
    Promise.all([
      invalidatePriceCache(event.id),
      invalidateTrendingCache(),
      invalidateFeedCache(userId),
    ]).catch((e) => console.error("Cache invalidation error:", e));

    return NextResponse.json(
      {
        success: true,
        trade: {
          id: tradeResult.trade.id,
          side: tradeResult.trade.side,
          outcome: tradeResult.trade.outcome,
          shareMicros: tradeResult.trade.shareMicros.toString(),
          costMicros: tradeResult.trade.costMicros.toString(),
          createdAt: tradeResult.trade.createdAt,
        },
        position:
          "positionByOutcomeMicros" in tradeResult
            ? {
                yesShareMicros: "0",
                noShareMicros: "0",
                outcomeSharesMicros: Object.fromEntries(
                  Object.entries(tradeResult.positionByOutcomeMicros).map(
                    ([k, v]) => [k, v.toString()]
                  )
                ),
              }
            : {
                yesShareMicros: tradeResult.position.yesShareMicros.toString(),
                noShareMicros: tradeResult.position.noShareMicros.toString(),
              },
        actualCostMicros: tradeResult.actualCostMicros.toString(),
        shareMicros: tradeResult.shareMicros.toString(),
      },
      { status: 201 }
    );
  } catch (error: unknown) {
    console.error("Error creating prediction:", error);

    if (typeof error === "object" && error !== null && "code" in error && (error as { code: string }).code === "P2002") {
      return NextResponse.json(
        { error: "Hai già fatto una previsione per questo evento" },
        { status: 400 }
      );
    }

    const message =
      error instanceof Error ? error.message : "Errore nella creazione della previsione";
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}
