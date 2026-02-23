import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin";
import { createAuditLog } from "@/lib/audit";
import { updateMissionProgress } from "@/lib/missions";
import { checkAndAwardBadges } from "@/lib/badges";
import { applyCreditTransaction } from "@/lib/apply-credit-transaction";
import { cost } from "@/lib/pricing/lmsr";
import { resolveMarketMarkResolved, payoutMarketInBatches } from "@/lib/amm/resolve";
import { invalidatePriceCache } from "@/lib/cache/price";
import { invalidateTrendingCache } from "@/lib/cache/trending";
import { invalidateAllFeedCaches } from "@/lib/feed-cache";

/**
 * POST /api/admin/events/[id]/resolve
 * Risolve un evento (imposta outcome YES o NO) e applica i payout in modo atomico.
 * AMM: payout da Position (1 share = 1 credit). LEGACY: payout da Prediction (LMSR/proportional).
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const eventId = params.id;
    const body = await request.json().catch(() => ({}));
    const { outcome, auto: isAuto } = body;

    if (!outcome || (outcome !== "YES" && outcome !== "NO")) {
      return NextResponse.json(
        { error: "Outcome deve essere 'YES' o 'NO'" },
        { status: 400 }
      );
    }

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
      const admin = await requireAdmin();
      actorId = admin.id;
    }

    const event = await prisma.event.findUnique({
      where: { id: eventId },
      select: {
        id: true,
        title: true,
        resolved: true,
        tradingMode: true,
        b: true,
        resolutionSourceUrl: true,
        Prediction: {
          where: { resolved: false },
          select: {
            id: true,
            userId: true,
            outcome: true,
            amount: true,
          },
        },
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
    {
      await prisma.$transaction((tx) =>
        resolveMarketMarkResolved(tx, eventId, outcome as "YES" | "NO")
      );
      const { paidUserIds } = await payoutMarketInBatches(prisma, eventId, outcome as "YES" | "NO", 500);

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
                outcome: outcome === "YES" ? "yes" : "no",
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
          outcome,
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
    }

    // Unreachable after AMM-only migration
    const predictions = event.Prediction;
    const finalQYes = 0;
    const finalQNo = 0;
    const b = event.b ?? 100;
    const finalCost = cost(finalQYes, finalQNo, b);

    await prisma.$transaction(async (tx) => {
      await tx.event.update({
        where: { id: eventId },
        data: { resolved: true, outcome, resolvedAt: new Date() },
      });

      for (const prediction of predictions) {
        const won = prediction.outcome === outcome;
        const payout = won && prediction.amount != null ? Math.max(0, Math.floor(finalCost - prediction.amount)) : 0;

        await tx.prediction.update({
          where: { id: prediction.id },
          data: {
            resolved: true,
            won,
            payout: won ? payout : 0,
          },
        });

        if (won && payout > 0) {
          await applyCreditTransaction(tx, prediction.userId, "PREDICTION_WIN", payout, {});
        }
      }
    });

    const usersWithPredictions = await prisma.prediction.findMany({
      where: { eventId },
      select: { userId: true },
      distinct: ["userId"],
    });

    for (const prediction of predictions) {
      if (prediction.outcome === outcome) {
        updateMissionProgress(prisma, prediction.userId, "WIN_PREDICTIONS", 1).catch(
          (e) => console.error("Mission progress update error:", e)
        );
      }
    }

    for (const { userId } of usersWithPredictions) {
      checkAndAwardBadges(prisma, userId).catch((e) =>
        console.error("Badge check error:", e)
      );
    }

    await Promise.all(
      predictions.map((prediction) =>
        prisma.notification.create({
          data: {
            userId: prediction.userId,
            type: "EVENT_RESOLVED",
            data: JSON.stringify({
              eventId: event.id,
              eventTitle: event.title,
              outcome: outcome === "YES" ? "yes" : "no",
            }),
          },
        })
      )
    );

    await createAuditLog(prisma, {
      userId: actorId,
      action: "EVENT_RESOLVE",
      entityType: "event",
      entityId: eventId,
      payload: {
        outcome,
        tradingMode: "LEGACY",
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
