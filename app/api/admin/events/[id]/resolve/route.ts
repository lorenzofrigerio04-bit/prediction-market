import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin";
import { createAuditLog } from "@/lib/audit";
import { updateMissionProgress } from "@/lib/missions";
import { checkAndAwardBadges } from "@/lib/badges";
import { applyCreditTransaction } from "@/lib/apply-credit-transaction";
import { cost } from "@/lib/pricing/lmsr";
import { invalidatePriceCache } from "@/lib/cache/price";
import { invalidateTrendingCache } from "@/lib/cache/trending";
import { invalidateAllFeedCaches } from "@/lib/feed-cache";

/**
 * POST /api/admin/events/[id]/resolve
 * Risolve un evento (imposta outcome YES o NO) e applica i payout in modo atomico.
 * L'esito deve essere verificato dalla fonte (resolutionSourceUrl) prima di chiamare questo endpoint.
 * Quando auto=true, l'endpoint accetta Authorization: Bearer CRON_SECRET per risoluzione automatica.
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
      actorId = null; // system/cron
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
        q_yes: true,
        q_no: true,
        b: true,
        resolutionSourceUrl: true,
        predictions: {
          where: { resolved: false },
          select: {
            id: true,
            userId: true,
            outcome: true,
            costBasis: true,
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

    const resolvedAt = new Date();
    const predictions = event.predictions;
    
    // Get final LMSR state (after all trades)
    const finalQYes = event.q_yes ?? 0;
    const finalQNo = event.q_no ?? 0;
    const b = event.b ?? 100; // fallback to default if not set
    
    // Calculate final cost using LMSR cost function
    const finalCost = cost(finalQYes, finalQNo, b);

    await prisma.$transaction(async (tx) => {
      await tx.event.update({
        where: { id: eventId },
        data: {
          resolved: true,
          outcome,
          resolvedAt,
        },
      });

      for (const prediction of predictions) {
        const won = prediction.outcome === outcome;
        let payout = 0;

        if (won) {
          // Winner: payout = cost(final_q_yes, final_q_no, b) - costBasis (LMSR cost difference)
          const costBasis = prediction.costBasis;
          if (costBasis != null) {
            payout = Math.max(0, Math.floor(finalCost - costBasis));
          }
          // Legacy predictions without costBasis: no LMSR payout (avoid over-paying)
        } else {
          // Loser: payout = 0 (costBasis already deducted on creation)
          payout = 0;
        }

        await tx.prediction.update({
          where: { id: prediction.id },
          data: {
            resolved: true,
            won,
            payout: won ? payout : 0,
            resolvedAt,
          },
        });

        if (won && payout > 0) {
          await applyCreditTransaction(
            tx,
            prediction.userId,
            "PREDICTION_WIN",
            payout,
            {
              description: `Vincita previsione: ${event.title}`,
              referenceId: prediction.id,
              referenceType: "prediction",
              applyBoost: true,
            }
          );
          await tx.user.update({
            where: { id: prediction.userId },
            data: {
              correctPredictions: { increment: 1 },
              totalPredictions: { increment: 1 },
            },
          });
        } else {
          // Loser: no additional deduction (costBasis already deducted on creation)
          // Just update total predictions count
          await tx.user.update({
            where: { id: prediction.userId },
            data: { totalPredictions: { increment: 1 } },
          });
        }
      }
    });

    const usersWithPredictions = await prisma.prediction.findMany({
      where: { eventId },
      select: { userId: true },
      distinct: ["userId"],
    });

    for (const { userId } of usersWithPredictions) {
      const totalResolved = await prisma.prediction.count({
        where: { userId, resolved: true },
      });
      const correctCount = await prisma.prediction.count({
        where: { userId, resolved: true, won: true },
      });
      const accuracy =
        totalResolved > 0 ? (correctCount / totalResolved) * 100 : 0;
      await prisma.user.update({
        where: { id: userId },
        data: { accuracy },
      });
    }

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

    const predictorNotifications = predictions.map((prediction) =>
      prisma.notification.create({
        data: {
          userId: prediction.userId,
          type: "EVENT_RESOLVED",
          title: "Evento risolto",
          message: `L'evento "${event.title}" è stato risolto: ${outcome === "YES" ? "SÌ" : "NO"}. ${prediction.outcome === outcome ? "Hai vinto!" : "Hai perso."}`,
          referenceId: eventId,
          referenceType: "event",
        },
      })
    );

    const predictorIds = new Set(predictions.map((p) => p.userId));
    const followers = await prisma.eventFollower.findMany({
      where: { eventId },
      select: { userId: true },
    });
    const followerNotifications = followers
      .filter((f) => !predictorIds.has(f.userId))
      .map((f) =>
        prisma.notification.create({
          data: {
            userId: f.userId,
            type: "EVENT_RESOLVED",
            title: "Evento risolto",
            message: `L'evento "${event.title}" è stato risolto: ${outcome === "YES" ? "SÌ" : "NO"}.`,
            referenceId: eventId,
            referenceType: "event",
          },
        })
      );

    await Promise.all([...predictorNotifications, ...followerNotifications]);

    await createAuditLog(prisma, {
      userId: actorId,
      action: "EVENT_RESOLVE",
      entityType: "event",
      entityId: eventId,
      payload: {
        outcome,
        title: event.title,
        resolutionSourceUrl: event.resolutionSourceUrl ?? undefined,
        ...(isCronAuth && { source: "auto" }),
      },
    });

    Promise.all([
      invalidatePriceCache(eventId),
      invalidateTrendingCache(),
      invalidateAllFeedCaches(),
    ]).catch((e) => console.error("Cache invalidation error:", e));

    return NextResponse.json({
      success: true,
      message: "Evento risolto con successo",
    });
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
