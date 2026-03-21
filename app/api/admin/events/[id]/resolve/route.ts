import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminCapability } from "@/lib/admin";
import { createAuditLog } from "@/lib/audit";
import { updateMissionProgress } from "@/lib/missions";
import { handleMissionEvent } from "@/lib/missions/mission-progress-service";
import { checkAndAwardBadges } from "@/lib/badges";
import { resolveMarketMarkResolved, payoutMarketInBatches } from "@/lib/amm/resolve";
import { invalidatePriceCache } from "@/lib/cache/price";
import { invalidateTrendingCache } from "@/lib/cache/trending";
import { invalidateAllFeedCaches } from "@/lib/feed-cache";
import {
  BINARY_OUTCOME_MARKET_TYPES,
  getValidOutcomeKeys,
  isMarketTypeId,
  MULTI_OPTION_MARKET_TYPES,
} from "@/lib/market-types";

/**
 * POST /api/admin/events/[id]/resolve
 * Risolve un evento.
 * - BINARY / THRESHOLD: outcome = "YES" | "NO" → salva esito e applica payout AMM.
 * - MULTIPLE_CHOICE, RANGE, TIME_TO_EVENT, COUNT_VOLUME, RANKING: outcome = chiave opzione vincente → salva esito e payout quote AMM vincenti.
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: eventId } = await params;
    const body = await request.json().catch(() => ({}));
    const { outcome, auto: isAuto } = body;

    if (outcome == null || typeof outcome !== "string" || outcome.trim() === "") {
      return NextResponse.json(
        { error: "Outcome obbligatorio: 'YES' | 'NO' oppure chiave opzione (per mercati multi-opzione)" },
        { status: 400 }
      );
    }

    const outcomeTrimmed = outcome.trim();

    const cronSecret = process.env.CRON_SECRET?.trim();
    const authHeader = request.headers.get("authorization");
    const isCronAuth =
      isAuto === true &&
      cronSecret &&
      (authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null) === cronSecret;

    let actorId: string | null = null;
    if (isCronAuth) {
      actorId = null;
    } else {
      const admin = await requireAdminCapability("events:resolve");
      actorId = admin.id;
    }

    const event = await prisma.event.findUnique({
      where: { id: eventId },
      select: {
        id: true,
        title: true,
        resolved: true,
        tradingMode: true,
        resolutionSourceUrl: true,
        marketType: true,
        outcomes: true,
      },
    });

    if (!event) {
      return NextResponse.json(
        { error: "Evento non trovato" },
        { status: 404 }
      );
    }

    if (event.resolved) {
      return NextResponse.json(
        { error: "Evento già risolto" },
        { status: 400 }
      );
    }

    if (event.tradingMode !== "AMM") {
      return NextResponse.json(
        { error: "Solo mercati AMM supportati. Risolvi tramite payout Position." },
        { status: 400 }
      );
    }

    const marketType = (event.marketType ?? "BINARY") as string;
    const isBinaryOutcome = isMarketTypeId(marketType) && BINARY_OUTCOME_MARKET_TYPES.includes(marketType);

    if (isBinaryOutcome) {
      if (outcomeTrimmed !== "YES" && outcomeTrimmed !== "NO") {
        return NextResponse.json(
          { error: "Per mercati binari o a soglia l'outcome deve essere 'YES' o 'NO'" },
          { status: 400 }
        );
      }
    } else {
      if (isMarketTypeId(marketType) && MULTI_OPTION_MARKET_TYPES.includes(marketType)) {
        const validKeys = getValidOutcomeKeys(event.outcomes);
        if (validKeys.length === 0) {
          return NextResponse.json(
            { error: "Mercato multi-opzione senza opzioni definite (outcomes vuoto o non valido)" },
            { status: 400 }
          );
        }
        if (!validKeys.includes(outcomeTrimmed)) {
          return NextResponse.json(
            {
              error: `Outcome non valido. Opzioni ammesse: ${validKeys.join(", ")}`,
              validOutcomes: validKeys,
            },
            { status: 400 }
          );
        }
      }
    }

    await prisma.$transaction((tx) =>
      resolveMarketMarkResolved(tx, eventId, outcomeTrimmed)
    );

    const payoutResult = await payoutMarketInBatches(
      prisma,
      eventId,
      outcomeTrimmed,
      500
    );
    const paidUserIds = payoutResult.paidUserIds;

    const allPredictions = await prisma.prediction.findMany({
      where: { eventId, resolved: true },
      select: { userId: true, won: true },
    });
    for (const p of allPredictions) {
      handleMissionEvent(prisma, p.userId, p.won ? "WIN_PREDICTION" : "LOSE_PREDICTION", {
        eventId,
        outcome: outcomeTrimmed,
        won: p.won ?? false,
      }).catch((e) => console.error("Mission event (win/lose) error:", e));
    }

    for (const userId of paidUserIds) {
      updateMissionProgress(prisma, userId, "WIN_PREDICTIONS", 1).catch((e) =>
        console.error("Mission progress update error:", e)
      );
      checkAndAwardBadges(prisma, userId).catch((e) =>
        console.error("Badge check error:", e)
      );
      prisma.notification
        .create({
          data: {
            userId,
            type: "EVENT_RESOLVED",
            data: JSON.stringify({
              eventId: event.id,
              eventTitle: event.title,
              outcome: outcomeTrimmed === "YES" ? "yes" : outcomeTrimmed === "NO" ? "no" : outcomeTrimmed,
            }),
          },
        })
        .catch((e) => console.error("Notification create error:", e));
    }

    await createAuditLog(prisma, {
      userId: actorId,
      action: "EVENT_RESOLVE",
      entityType: "event",
      entityId: eventId,
      payload: {
        outcome: outcomeTrimmed,
        marketType,
        tradingMode: "AMM",
        resolutionSourceUrl: event.resolutionSourceUrl ?? undefined,
        ...(isCronAuth && { source: "auto" }),
      },
    });

    Promise.all([
      invalidatePriceCache(eventId),
      invalidateTrendingCache(),
      invalidateAllFeedCaches(),
    ]).catch((e) => console.error("Cache invalidation error:", e));

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    console.error("Error resolving event:", error);
    const msg = error instanceof Error ? error.message : String(error);
    if (msg === "Non autenticato" || msg.includes("Accesso negato")) {
      return NextResponse.json({ error: msg }, { status: 403 });
    }
    return NextResponse.json(
      { error: "Errore nella risoluzione dell'evento" },
      { status: 500 }
    );
  }
}
