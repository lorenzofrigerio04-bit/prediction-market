import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin";
import { createAuditLog } from "@/lib/audit";
import { updateMissionProgress } from "@/lib/missions";
import { checkAndAwardBadges } from "@/lib/badges";
import { applyCreditTransaction } from "@/lib/apply-credit-transaction";

/**
 * POST /api/admin/events/[id]/resolve
 * Risolve un evento (imposta outcome YES o NO) e applica i payout in modo atomico.
 * L'esito deve essere verificato dalla fonte (resolutionSourceUrl) prima di chiamare questo endpoint.
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const admin = await requireAdmin();
    const eventId = params.id;
    const body = await request.json();
    const { outcome } = body;

    if (!outcome || (outcome !== "YES" && outcome !== "NO")) {
      return NextResponse.json(
        { error: "Outcome deve essere 'YES' o 'NO'" },
        { status: 400 }
      );
    }

    const event = await prisma.event.findUnique({
      where: { id: eventId },
      include: {
        predictions: {
          where: { resolved: false },
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
    const yesTotal = event.yesCredits;
    const noTotal = event.noCredits;
    const totalCredits = event.totalCredits;
    const winningSideTotal = outcome === "YES" ? yesTotal : noTotal;
    const predictions = event.predictions;

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

        if (won && winningSideTotal > 0 && totalCredits > 0) {
          payout = Math.floor(
            (prediction.credits / winningSideTotal) * totalCredits
          );
          if (payout < prediction.credits) payout = prediction.credits;
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
          await applyCreditTransaction(
            tx,
            prediction.userId,
            "PREDICTION_LOSS",
            -prediction.credits,
            {
              description: `Perdita previsione: ${event.title}`,
              referenceId: prediction.id,
              referenceType: "prediction",
              skipUserUpdate: true,
            }
          );
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
      userId: admin.id,
      action: "EVENT_RESOLVE",
      entityType: "event",
      entityId: eventId,
      payload: {
        outcome,
        title: event.title,
        resolutionSourceUrl: event.resolutionSourceUrl ?? undefined,
      },
    });

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
