import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin";
import { updateMissionProgress } from "@/lib/missions";
import { checkAndAwardBadges } from "@/lib/badges";

/**
 * POST /api/admin/events/[id]/resolve
 * Risolve un evento (imposta outcome YES o NO)
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await requireAdmin();

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

    // Calcola il totale dei crediti per ogni outcome
    const yesTotal = event.yesCredits;
    const noTotal = event.noCredits;
    const totalCredits = event.totalCredits;

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

    // Calcola i payout per ogni previsione
    for (const prediction of predictions) {
      const won = prediction.outcome === outcome;
      let payout = 0;

      if (won) {
        // Se ha vinto, calcola il payout basato sulla probabilità inversa
        if (outcome === "YES" && yesTotal > 0) {
          // Payout = (crediti investiti / crediti totali su YES) * crediti totali su NO + crediti investiti
          payout = Math.floor(
            (prediction.credits / yesTotal) * noTotal + prediction.credits
          );
        } else if (outcome === "NO" && noTotal > 0) {
          // Payout = (crediti investiti / crediti totali su NO) * crediti totali su YES + crediti investiti
          payout = Math.floor(
            (prediction.credits / noTotal) * yesTotal + prediction.credits
          );
        } else {
          // Se non ci sono previsioni sull'altro outcome, restituisci solo i crediti investiti
          payout = prediction.credits;
        }
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

      // Aggiorna il wallet dell'utente
      if (won && payout > 0) {
        const user = await prisma.user.findUnique({
          where: { id: prediction.userId },
          select: { credits: true },
        });

        if (user) {
          const newCredits = user.credits + payout;
          const profit = payout - prediction.credits;

          // Aggiorna crediti
          await prisma.user.update({
            where: { id: prediction.userId },
            data: {
              credits: newCredits,
              totalEarned: { increment: payout },
            },
          });

          // Crea transazione
          await prisma.transaction.create({
            data: {
              userId: prediction.userId,
              type: "PREDICTION_WIN",
              amount: payout,
              description: `Vincita previsione: ${event.title}`,
              referenceId: prediction.id,
              referenceType: "prediction",
              balanceAfter: newCredits,
            },
          });

          // Aggiorna statistiche
          await prisma.user.update({
            where: { id: prediction.userId },
            data: {
              correctPredictions: { increment: 1 },
              totalPredictions: { increment: 1 },
            },
          });

          // Missione "Vincita previsione"
          updateMissionProgress(prisma, prediction.userId, "WIN_PREDICTIONS", 1).catch((e) =>
            console.error("Mission progress update error:", e)
          );
        }
      } else {
        // Ha perso - aggiorna solo le statistiche
        await prisma.user.update({
          where: { id: prediction.userId },
          data: {
            totalPredictions: { increment: 1 },
          },
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

    // Crea notifiche per tutti gli utenti che hanno fatto previsioni
    const notificationPromises = predictions.map((prediction) =>
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

    await Promise.all(notificationPromises);

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
