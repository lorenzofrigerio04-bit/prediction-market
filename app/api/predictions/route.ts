import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { updateMissionProgress } from "@/lib/missions";
import { checkAndAwardBadges } from "@/lib/badges";
import { rateLimit } from "@/lib/rate-limit";
import { track } from "@/lib/analytics";
import { applyCreditTransaction } from "@/lib/apply-credit-transaction";

const PREDICTIONS_LIMIT = 15; // previsioni per user per minuto

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Devi essere autenticato per fare una previsione" },
        { status: 401 }
      );
    }

    const limited = rateLimit(`predictions:${session.user.id}`, PREDICTIONS_LIMIT);
    if (limited) {
      return NextResponse.json(
        { error: "Troppe previsioni in poco tempo. Riprova tra un minuto." },
        { status: 429 }
      );
    }

    const body = await request.json();
    const { eventId, outcome, credits } = body;

    // Validazione
    if (!eventId || !outcome || !credits) {
      return NextResponse.json(
        { error: "EventId, outcome e credits sono obbligatori" },
        { status: 400 }
      );
    }

    if (outcome !== "YES" && outcome !== "NO") {
      return NextResponse.json(
        { error: "Outcome deve essere YES o NO" },
        { status: 400 }
      );
    }

    if (credits < 1) {
      return NextResponse.json(
        { error: "Devi investire almeno 1 credito" },
        { status: 400 }
      );
    }

    // Verifica che l'evento esista e non sia già risolto
    const event = await prisma.event.findUnique({
      where: { id: eventId },
    });

    if (!event) {
      return NextResponse.json(
        { error: "Evento non trovato" },
        { status: 404 }
      );
    }

    if (event.resolved) {
      return NextResponse.json(
        { error: "Questo evento è già stato risolto" },
        { status: 400 }
      );
    }

    if (new Date(event.closesAt) < new Date()) {
      return NextResponse.json(
        { error: "Le previsioni per questo evento sono chiuse" },
        { status: 400 }
      );
    }

    // Verifica che l'utente abbia abbastanza crediti
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { credits: true },
    });

    if (!user || user.credits < credits) {
      return NextResponse.json(
        { error: "Crediti insufficienti" },
        { status: 400 }
      );
    }

    // Verifica se l'utente ha già fatto una previsione per questo evento
    const existingPrediction = await prisma.prediction.findUnique({
      where: {
        userId_eventId: {
          userId: session.user.id,
          eventId: event.id,
        },
      },
    });

    if (existingPrediction) {
      return NextResponse.json(
        { error: "Hai già fatto una previsione per questo evento" },
        { status: 400 }
      );
    }

    // Crea la previsione e aggiorna i crediti in una transazione
    const result = await prisma.$transaction(async (tx) => {
      // Crea la previsione
      const prediction = await tx.prediction.create({
        data: {
          userId: session.user.id,
          eventId: event.id,
          outcome: outcome as "YES" | "NO",
          credits,
        },
      });

      await applyCreditTransaction(tx, session.user.id, "PREDICTION_BET", -credits, {
        description: `Previsione ${outcome === "YES" ? "SÌ" : "NO"} su "${event.title}"`,
        referenceId: prediction.id,
        referenceType: "prediction",
      });

      // Aggiorna le statistiche dell'evento
      const updateData: any = {
        totalCredits: { increment: credits },
      };

      if (outcome === "YES") {
        updateData.yesCredits = { increment: credits };
        updateData.yesPredictions = { increment: 1 };
      } else {
        updateData.noCredits = { increment: credits };
        updateData.noPredictions = { increment: 1 };
      }

      const updatedEvent = await tx.event.update({
        where: { id: event.id },
        data: updateData,
      });

      // Calcola la nuova probabilità
      const newProbability =
        updatedEvent.totalCredits > 0
          ? (updatedEvent.yesCredits / updatedEvent.totalCredits) * 100
          : 50.0;

      await tx.event.update({
        where: { id: event.id },
        data: { probability: newProbability },
      });

      return prediction;
    });

    // Missioni e badge (fuori dalla transazione per non bloccare la risposta)
    const userId = session.user.id;
    updateMissionProgress(prisma, userId, "MAKE_PREDICTIONS", 1, event.category).catch((e) =>
      console.error("Mission progress update error:", e)
    );
    checkAndAwardBadges(prisma, userId).catch((e) =>
      console.error("Badge check error:", e)
    );

    track(
      "PREDICTION_PLACED",
      {
        userId,
        eventId: event.id,
        amount: credits,
        outcome,
        category: event.category,
      },
      { request }
    );

    return NextResponse.json(
      {
        success: true,
        prediction: result,
        message: "Previsione creata con successo",
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Error creating prediction:", error);
    
    // Gestione errori Prisma specifici
    if (error.code === "P2002") {
      return NextResponse.json(
        { error: "Hai già fatto una previsione per questo evento" },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Errore nella creazione della previsione" },
      { status: 500 }
    );
  }
}
