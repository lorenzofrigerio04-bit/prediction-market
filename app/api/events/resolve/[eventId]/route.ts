import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * Risolve manualmente un singolo evento specificando l'outcome
 * Body: { outcome: "YES" | "NO" }
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { eventId: string } }
) {
  try {
    const { outcome } = await request.json();
    
    if (outcome !== "YES" && outcome !== "NO") {
      return NextResponse.json(
        { error: "Outcome deve essere 'YES' o 'NO'" },
        { status: 400 }
      );
    }

    const event = await prisma.event.findUnique({
      where: { id: params.eventId },
      include: {
        predictions: {
          include: {
            user: true,
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

    const now = new Date();

    // Calcola statistiche
    const yesPredictions = event.predictions.filter((p) => p.outcome === "YES");
    const noPredictions = event.predictions.filter((p) => p.outcome === "NO");
    
    const yesCredits = yesPredictions.reduce((sum, p) => sum + p.credits, 0);
    const noCredits = noPredictions.reduce((sum, p) => sum + p.credits, 0);
    const totalCredits = yesCredits + noCredits;

    // Aggiorna l'evento
    await prisma.event.update({
      where: { id: event.id },
      data: {
        resolved: true,
        resolvedAt: now,
        outcome,
        yesPredictions: yesPredictions.length,
        noPredictions: noPredictions.length,
        totalCredits,
        yesCredits,
        noCredits,
        probability: totalCredits > 0 ? (yesCredits / totalCredits) * 100 : 50.0,
      },
    });

    // Processa previsioni
    const winningPredictions = event.predictions.filter((p) => p.outcome === outcome);
    const losingPredictions = event.predictions.filter((p) => p.outcome !== outcome);

    const winningSideCredits = outcome === "YES" ? yesCredits : noCredits;
    const payoutMultiplier = winningSideCredits > 0 ? totalCredits / winningSideCredits : 1;

    // Aggiorna previsioni vincenti
    for (const prediction of winningPredictions) {
      const payout = Math.floor(prediction.credits * payoutMultiplier);
      
      await prisma.prediction.update({
        where: { id: prediction.id },
        data: {
          resolved: true,
          resolvedAt: now,
          won: true,
          payout,
        },
      });

      // Aggiorna crediti utente
      const user = await prisma.user.findUnique({
        where: { id: prediction.userId },
        select: { credits: true },
      });

      await prisma.user.update({
        where: { id: prediction.userId },
        data: {
          credits: { increment: payout },
          totalEarned: { increment: payout },
        },
      });

      // Recupera crediti aggiornati
      const userAfterUpdate = await prisma.user.findUnique({
        where: { id: prediction.userId },
        select: { credits: true },
      });

      await prisma.transaction.create({
        data: {
          userId: prediction.userId,
          type: "PREDICTION_WIN",
          amount: payout,
          description: `Vincita previsione: ${event.title}`,
          referenceId: prediction.id,
          referenceType: "prediction",
          balanceAfter: userAfterUpdate?.credits || 0,
        },
      });
    }

    // Aggiorna previsioni perdenti
    for (const prediction of losingPredictions) {
      await prisma.prediction.update({
        where: { id: prediction.id },
        data: {
          resolved: true,
          resolvedAt: now,
          won: false,
          payout: 0,
        },
      });

      // Recupera crediti attuali dell'utente
      const userCurrent = await prisma.user.findUnique({
        where: { id: prediction.userId },
        select: { credits: true },
      });

      await prisma.transaction.create({
        data: {
          userId: prediction.userId,
          type: "PREDICTION_LOSS",
          amount: -prediction.credits,
          description: `Perdita previsione: ${event.title}`,
          referenceId: prediction.id,
          referenceType: "prediction",
          balanceAfter: userCurrent?.credits || 0,
        },
      });
    }

    // Aggiorna statistiche accuracy per tutti gli utenti
    for (const prediction of event.predictions) {
      const user = await prisma.user.findUnique({
        where: { id: prediction.userId },
        select: {
          totalPredictions: true,
          correctPredictions: true,
        },
      });

      if (user) {
        const newTotalPredictions = user.totalPredictions + 1;
        const newCorrectPredictions =
          prediction.outcome === outcome
            ? user.correctPredictions + 1
            : user.correctPredictions;
        const newAccuracy =
          newTotalPredictions > 0
            ? (newCorrectPredictions / newTotalPredictions) * 100
            : 0;

        await prisma.user.update({
          where: { id: prediction.userId },
          data: {
            totalPredictions: newTotalPredictions,
            correctPredictions: newCorrectPredictions,
            accuracy: newAccuracy,
          },
        });
      }
    }

    return NextResponse.json({
      message: "Evento risolto con successo",
      eventId: event.id,
      outcome,
      winningPredictions: winningPredictions.length,
      losingPredictions: losingPredictions.length,
    });
  } catch (error) {
    console.error("Errore risolvendo evento:", error);
    return NextResponse.json(
      { error: "Failed to resolve event", details: String(error) },
      { status: 500 }
    );
  }
}
