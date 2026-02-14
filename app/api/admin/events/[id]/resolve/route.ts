import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin";
import { createAuditLog } from "@/lib/audit";
import { updateMissionProgress } from "@/lib/missions";
import { checkAndAwardBadges } from "@/lib/badges";
import { applyCreditTransaction } from "@/lib/apply-credit-transaction";

/**
 * POST /api/admin/events/[id]/resolve
 * Risolve un evento (imposta outcome YES o NO)
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

    // Validazione
    if (!outcome || (outcome !== "YES" && outcome !== "NO")) {
      return NextResponse.json(
        { error: "Outcome deve essere 'YES' o 'NO'" },
        { status: 400 }
      );
    }

    // Verifica che l'evento esista e non sia già risolto
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

    // Risolvi l'evento e calcola i payout
    const resolvedAt = new Date();

    // Pool totale = tutti i crediti investiti sull'evento
    const yesTotal = event.yesCredits;
    const noTotal = event.noCredits;
    const totalCredits = event.totalCredits;
    const winningSideTotal = outcome === "YES" ? yesTotal : noTotal;

    // Aggiorna l'evento
    await prisma.event.update({
      where: { id: eventId },
      data: {
        resolved: true,
        outcome,
        resolvedAt,
      },
    });

    // Processa tutte le previsioni
    const predictions = await prisma.prediction.findMany({
      where: {
        eventId,
        resolved: false,
      },
    });

    // Payout proporzionale: (stake_personale / stake_totale_vincente) * pool_totale
    for (const prediction of predictions) {
      const won = prediction.outcome === outcome;
      let payout = 0;

      if (won && winningSideTotal > 0 && totalCredits > 0) {
        payout = Math.floor(
          (prediction.credits / winningSideTotal) * totalCredits
        );
        if (payout < prediction.credits) payout = prediction.credits; // minimo: restituzione stake
      }

      // Aggiorna la previsione
      await prisma.prediction.update({
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
          prisma,
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
        await prisma.user.update({
          where: { id: prediction.userId },
          data: {
            correctPredictions: { increment: 1 },
            totalPredictions: { increment: 1 },
          },
        });
        updateMissionProgress(prisma, prediction.userId, "WIN_PREDICTIONS", 1).catch((e) =>
          console.error("Mission progress update error:", e)
        );
      } else {
        await applyCreditTransaction(
          prisma,
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
        await prisma.user.update({
          where: { id: prediction.userId },
          data: { totalPredictions: { increment: 1 } },
        });
      }
    }

    // Ricalcola accuratezza per tutti gli utenti che hanno fatto previsioni su questo evento
    const usersWithPredictions = await prisma.prediction.findMany({
      where: { eventId },
      select: { userId: true },
      distinct: ["userId"],
    });

    for (const { userId } of usersWithPredictions) {
      const totalResolved = await prisma.prediction.count({
        where: {
          userId,
          resolved: true,
        },
      });

      const correctCount = await prisma.prediction.count({
        where: {
          userId,
          resolved: true,
          won: true,
        },
      });

      const accuracy = totalResolved > 0 ? (correctCount / totalResolved) * 100 : 0;

      await prisma.user.update({
        where: { id: userId },
        data: {
          accuracy,
        },
      });
    }

    // Badge (dopo aggiornamento accuratezza, così i badge "Precisione X%" sono corretti)
    for (const { userId } of usersWithPredictions) {
      checkAndAwardBadges(prisma, userId).catch((e) =>
        console.error("Badge check error:", e)
      );
    }

    // Notifiche per chi ha fatto previsioni
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

    // Notifiche per i follower che non hanno fatto previsione (evitare duplicati)
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
      payload: { outcome, title: event.title },
    });

    return NextResponse.json({
      success: true,
      message: "Evento risolto con successo",
    });
  } catch (error: any) {
    console.error("Error resolving event:", error);
    if (error.message === "Non autenticato" || error.message.includes("Accesso negato")) {
      return NextResponse.json(
        { error: error.message },
        { status: 403 }
      );
    }
    return NextResponse.json(
      { error: "Errore nella risoluzione dell'evento" },
      { status: 500 }
    );
  }
}
