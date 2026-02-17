import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { applyCreditTransaction } from "@/lib/apply-credit-transaction";
import { invalidatePriceCache } from "@/lib/cache/price";
import { invalidateTrendingCache } from "@/lib/cache/trending";
import { invalidateAllFeedCaches } from "@/lib/feed-cache";

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
        Prediction: {
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
    const yesPredictions = event.Prediction.filter((p) => p.outcome === "YES");
    const noPredictions = event.Prediction.filter((p) => p.outcome === "NO");
    
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
      },
    });

    // Processa previsioni
    const winningPredictions = event.Prediction.filter((p) => p.outcome === outcome);
    const losingPredictions = event.Prediction.filter((p) => p.outcome !== outcome);

    const winningSideCredits = outcome === "YES" ? yesCredits : noCredits;
    const payoutMultiplier = winningSideCredits > 0 ? totalCredits / winningSideCredits : 1;

    // Aggiorna previsioni vincenti
    for (const prediction of winningPredictions) {
      const payout = Math.floor(prediction.credits * payoutMultiplier);
      
      await prisma.prediction.update({
        where: { id: prediction.id },
        data: {
          resolved: true,
          won: true,
          payout,
        },
      });

      await applyCreditTransaction(
        prisma,
        prediction.userId,
        "PREDICTION_WIN",
        payout,
        {
          description: `Vincita previsione: ${event.title}`,
        }
      );
    }

    // Aggiorna previsioni perdenti
    for (const prediction of losingPredictions) {
      await prisma.prediction.update({
        where: { id: prediction.id },
        data: {
          resolved: true,
          won: false,
          payout: 0,
        },
      });

      await applyCreditTransaction(
        prisma,
        prediction.userId,
        "PREDICTION_LOSS",
        -prediction.credits,
        {
          description: `Perdita previsione: ${event.title}`,
          skipUserUpdate: true,
        }
      );
    }

    // Note: User accuracy statistics are not stored in the database

    Promise.all([
      invalidatePriceCache(event.id),
      invalidateTrendingCache(),
      invalidateAllFeedCaches(),
    ]).catch((e) => console.error("Cache invalidation error:", e));

    return NextResponse.json({
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
