import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin";

/**
 * Processa tutti gli eventi chiusi che non sono ancora stati risolti
 * Calcola i payout, aggiorna crediti e statistiche
 * Autorizzato: admin (sessione) oppure cron con Authorization: Bearer CRON_SECRET
 */
export async function POST(request: NextRequest) {
  try {
    // Autorizzazione: Bearer CRON_SECRET oppure admin
    const authHeader = request.headers.get("authorization");
    const cronSecret = process.env.CRON_SECRET;
    const isCronAuth =
      cronSecret && authHeader === `Bearer ${cronSecret}`;

    if (!isCronAuth) {
      try {
        await requireAdmin();
      } catch {
        return NextResponse.json(
          { error: "Non autenticato o accesso negato. Richiesti privilegi admin o CRON_SECRET." },
          { status: 401 }
        );
      }
    }

    const now = new Date();
    
    // Trova tutti gli eventi chiusi ma non ancora risolti
    const closedEvents = await prisma.event.findMany({
      where: {
        closesAt: {
          lte: now, // chiusi
        },
        resolved: false, // non ancora risolti
      },
      include: {
        predictions: {
          include: {
            user: true,
          },
        },
      },
    });

    if (closedEvents.length === 0) {
      return NextResponse.json({
        message: "Nessun evento chiuso da processare",
        processed: 0,
      });
    }

    const results = [];

    for (const event of closedEvents) {
      try {
        // Calcola le statistiche aggregate dalle previsioni
        const yesPredictions = event.predictions.filter((p) => p.outcome === "YES");
        const noPredictions = event.predictions.filter((p) => p.outcome === "NO");
        
        const yesCredits = yesPredictions.reduce((sum, p) => sum + p.credits, 0);
        const noCredits = noPredictions.reduce((sum, p) => sum + p.credits, 0);
        const totalCredits = yesCredits + noCredits;
        
        // Determina l'outcome dell'evento basato sulla maggioranza dei crediti investiti
        // In produzione, questo dovrebbe essere impostato manualmente da un admin
        // Per ora usiamo la logica: se yesCredits > noCredits allora YES, altrimenti NO
        const eventOutcome = yesCredits > noCredits ? "YES" : "NO";
        
        // Aggiorna l'evento come risolto
        await prisma.event.update({
          where: { id: event.id },
          data: {
            resolved: true,
            resolvedAt: now,
            outcome: eventOutcome,
            yesPredictions: yesPredictions.length,
            noPredictions: noPredictions.length,
            totalCredits,
            yesCredits,
            noCredits,
            probability: totalCredits > 0 ? (yesCredits / totalCredits) * 100 : 50.0,
          },
        });

        // Processa ogni previsione
        const winningPredictions = event.predictions.filter(
          (p) => p.outcome === eventOutcome
        );
        const losingPredictions = event.predictions.filter(
          (p) => p.outcome !== eventOutcome
        );

        // Calcola i payout per le previsioni vincenti
        // Formula: payout = credits_investiti * (totalCredits / credits_sul_lato_vincente)
        const winningSideCredits =
          eventOutcome === "YES" ? yesCredits : noCredits;
        const payoutMultiplier =
          winningSideCredits > 0 ? totalCredits / winningSideCredits : 1;

        // Aggiorna previsioni vincenti e calcola payout
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
          await prisma.user.update({
            where: { id: prediction.userId },
            data: {
              credits: {
                increment: payout, // aggiungi il payout
              },
              totalEarned: {
                increment: payout,
              },
            },
          });

          // Recupera crediti aggiornati dopo l'incremento
          const userAfterUpdate = await prisma.user.findUnique({
            where: { id: prediction.userId },
            select: { credits: true },
          });

          // Crea transazione per il guadagno
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

          // Crea transazione per la perdita
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

        // Aggiorna statistiche utenti (accuracy, correctPredictions, etc.)
        // Raggruppa per utente per evitare query multiple
        const userStats = new Map<string, { total: number; correct: number }>();
        
        for (const prediction of event.predictions) {
          const won = prediction.outcome === eventOutcome;
          const current = userStats.get(prediction.userId) || { total: 0, correct: 0 };
          userStats.set(prediction.userId, {
            total: current.total + 1,
            correct: current.correct + (won ? 1 : 0),
          });
        }

        // Aggiorna statistiche per ogni utente
        for (const [userId, stats] of userStats.entries()) {
          const user = await prisma.user.findUnique({
            where: { id: userId },
            select: {
              totalPredictions: true,
              correctPredictions: true,
            },
          });

          if (user) {
            const newTotalPredictions = user.totalPredictions + stats.total;
            const newCorrectPredictions = user.correctPredictions + stats.correct;
            const newAccuracy =
              newTotalPredictions > 0
                ? (newCorrectPredictions / newTotalPredictions) * 100
                : 0;

            await prisma.user.update({
              where: { id: userId },
              data: {
                totalPredictions: newTotalPredictions,
                correctPredictions: newCorrectPredictions,
                accuracy: newAccuracy,
              },
            });
          }
        }

        results.push({
          eventId: event.id,
          title: event.title,
          outcome: eventOutcome,
          winningPredictions: winningPredictions.length,
          losingPredictions: losingPredictions.length,
          totalPayout: winningPredictions.reduce(
            (sum, p) => sum + Math.floor(p.credits * payoutMultiplier),
            0
          ),
        });
      } catch (error) {
        console.error(`Errore processando evento ${event.id}:`, error);
        results.push({
          eventId: event.id,
          title: event.title,
          error: String(error),
        });
      }
    }

    return NextResponse.json({
      message: `Processati ${results.length} eventi`,
      processed: results.length,
      results,
    });
  } catch (error) {
    console.error("Errore processando eventi chiusi:", error);
    return NextResponse.json(
      { error: "Failed to process closed events", details: String(error) },
      { status: 500 }
    );
  }
}
