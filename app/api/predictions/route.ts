import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { updateMissionProgress } from "@/lib/missions";
import { checkAndAwardBadges } from "@/lib/badges";
import { rateLimit } from "@/lib/rate-limit";
import { track } from "@/lib/analytics";
import { executeBuyShares, AmmError } from "@/lib/amm/engine";
import { ensureAmmStateForEvent } from "@/lib/amm/ensure-amm-state";
import { updateUserProfileFromTrade } from "@/lib/personalization";
import { invalidatePriceCache } from "@/lib/cache/price";
import { invalidateTrendingCache } from "@/lib/cache/trending";
import { invalidateFeedCache } from "@/lib/feed-cache";

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
      body.outcome === "YES" || body.outcome === "NO" ? body.outcome : null;
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
        resolved: true,
        closesAt: true,
        tradingMode: true,
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

    const now = new Date();
    const isOpen = !event.resolved && (!event.closesAt || new Date(event.closesAt) > now);

    if (event.tradingMode !== "AMM") {
      if (!isOpen) {
        return NextResponse.json(
          { error: "Questo evento non supporta acquisti. Solo mercati AMM sono attivi." },
          { status: 400 }
        );
      }
      await prisma.$transaction(async (tx) => {
        await tx.event.update({
          where: { id: eventId },
          data: { tradingMode: "AMM" },
        });
        await ensureAmmStateForEvent(tx, eventId);
      });
      (event as { tradingMode: string }).tradingMode = "AMM";
    }

    await ensureAmmStateForEvent(prisma, eventId);
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

    let ammResult: Awaited<ReturnType<typeof executeBuyShares>>;
    try {
      ammResult = await prisma.$transaction((tx) =>
        executeBuyShares(tx, {
          eventId,
          userId: session.user.id,
          outcome: outcome as "YES" | "NO",
          maxCostMicros,
          idempotencyKey,
        })
      );
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
        amount: Number(ammResult.actualCostMicros) / SCALE,
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
          id: ammResult.trade.id,
          side: ammResult.trade.side,
          outcome: ammResult.trade.outcome,
          shareMicros: ammResult.trade.shareMicros.toString(),
          costMicros: ammResult.trade.costMicros.toString(),
          createdAt: ammResult.trade.createdAt,
        },
        position: {
          yesShareMicros: ammResult.position.yesShareMicros.toString(),
          noShareMicros: ammResult.position.noShareMicros.toString(),
        },
        actualCostMicros: ammResult.actualCostMicros.toString(),
        shareMicros: ammResult.shareMicros.toString(),
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
