/**
 * Previsioni simulate: bot che piazzano previsioni su eventi aperti.
 * Stessa logica dell'API predictions (senza missioni/badge/analytics).
 * Riusabile dal cron per far muovere le quote.
 */

import type { PrismaClient } from "@prisma/client";
import { applyCreditTransaction } from "@/lib/apply-credit-transaction";
import { MAX_PREDICTIONS_PER_RUN } from "./config";

const MIN_CREDITS_DEFAULT = 10;
const MAX_CREDITS_DEFAULT = 150;

export interface CreateSimulatedPredictionParams {
  userId: string;
  eventId: string;
  outcome: "YES" | "NO";
  credits: number;
}

export interface RunSimulatedPredictionsOptions {
  /** Massimo previsioni da creare in una run (default: MAX_PREDICTIONS_PER_RUN) */
  maxPredictions?: number;
  /** Crediti minimi per singola previsione (default: 10) */
  minCredits?: number;
  /** Crediti massimi per singola previsione (default: 150) */
  maxCredits?: number;
}

/**
 * Crea una previsione a nome di un utente (es. bot).
 * Stessa logica di app/api/predictions/route.ts (righe 56–161): verifica evento esistente,
 * non risolto, closesAt > now, utente con crediti sufficienti, nessuna prediction esistente
 * per userId+eventId; poi in transazione: prediction.create, applyCreditTransaction,
 * event.update (totalCredits, yesCredits/noCredits, yesPredictions/noPredictions),
 * ricalcolo e update event.probability.
 * Non chiama missioni, badge o analytics.
 */
export async function createSimulatedPrediction(
  prisma: PrismaClient,
  params: CreateSimulatedPredictionParams
): Promise<{ success: true; predictionId: string } | { success: false; error: string }> {
  const { userId, eventId, outcome, credits } = params;

  if (credits < 1) {
    return { success: false, error: "Crediti devono essere almeno 1" };
  }

  const event = await prisma.event.findUnique({
    where: { id: eventId },
  });

  if (!event) {
    return { success: false, error: "Evento non trovato" };
  }

  if (event.resolved) {
    return { success: false, error: "Evento già risolto" };
  }

  if (new Date(event.closesAt) < new Date()) {
    return { success: false, error: "Previsioni per questo evento sono chiuse" };
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { credits: true },
  });

  if (!user || user.credits < credits) {
    return { success: false, error: "Crediti insufficienti" };
  }

  const existingPrediction = await prisma.prediction.findUnique({
    where: {
      userId_eventId: { userId, eventId: event.id },
    },
  });

  if (existingPrediction) {
    return { success: false, error: "Previsione già esistente per questo evento" };
  }

  try {
    const result = await prisma.$transaction(async (tx) => {
      const prediction = await tx.prediction.create({
        data: {
          userId,
          eventId: event.id,
          outcome,
          credits,
        },
      });

      await applyCreditTransaction(tx, userId, "PREDICTION_BET", -credits, {
        description: `Previsione ${outcome === "YES" ? "SÌ" : "NO"} su "${event.title}"`,
        referenceId: prediction.id,
        referenceType: "prediction",
      });

      const updateData: {
        totalCredits: { increment: number };
        yesCredits?: { increment: number };
        noCredits?: { increment: number };
        yesPredictions?: { increment: number };
        noPredictions?: { increment: number };
      } = {
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

    return { success: true, predictionId: result.id };
  } catch (err: unknown) {
    const code = err && typeof err === "object" && "code" in err ? (err as { code: string }).code : null;
    if (code === "P2002") {
      return { success: false, error: "Previsione già esistente per questo evento" };
    }
    throw err;
  }
}

/**
 * Esegue una run di previsioni simulate: recupera eventi aperti (resolved: false, closesAt > now),
 * per un numero limitato sceglie a caso evento + bot che non ha già previsto; outcome e crediti
 * random (crediti in [minCredits, maxCredits], outcome influenzato da event.probability).
 * Chiama createSimulatedPrediction per ciascuno. Le quote degli eventi si aggiornano come con utenti reali.
 */
export async function runSimulatedPredictions(
  prisma: PrismaClient,
  botUserIds: string[],
  options?: RunSimulatedPredictionsOptions
): Promise<{ created: number; errors: { eventId: string; userId: string; error: string }[] }> {
  const maxPredictions = options?.maxPredictions ?? MAX_PREDICTIONS_PER_RUN;
  const minCredits = options?.minCredits ?? MIN_CREDITS_DEFAULT;
  const maxCredits = options?.maxCredits ?? MAX_CREDITS_DEFAULT;

  if (botUserIds.length === 0) {
    return { created: 0, errors: [] };
  }

  const now = new Date();
  const openEvents = await prisma.event.findMany({
    where: {
      resolved: false,
      closesAt: { gt: now },
    },
    select: { id: true, title: true, probability: true },
  });

  if (openEvents.length === 0) {
    return { created: 0, errors: [] };
  }

  const existingPredictions = await prisma.prediction.findMany({
    where: {
      userId: { in: botUserIds },
      eventId: { in: openEvents.map((e) => e.id) },
    },
    select: { userId: true, eventId: true },
  });

  const predictedKey = new Set(
    existingPredictions.map((p) => `${p.eventId}:${p.userId}`)
  );

  const candidates: { event: (typeof openEvents)[number]; userId: string }[] = [];
  for (const event of openEvents) {
    for (const userId of botUserIds) {
      if (!predictedKey.has(`${event.id}:${userId}`)) {
        candidates.push({ event, userId });
      }
    }
  }

  shuffle(candidates);
  const toCreate = candidates.slice(0, maxPredictions);

  let created = 0;
  const errors: { eventId: string; userId: string; error: string }[] = [];

  for (const { event, userId } of toCreate) {
    const credits = randomInt(minCredits, maxCredits);
    const outcome = Math.random() < event.probability / 100 ? "YES" : "NO";

    const result = await createSimulatedPrediction(prisma, {
      userId,
      eventId: event.id,
      outcome,
      credits,
    });

    if (result.success) {
      created++;
    } else {
      errors.push({ eventId: event.id, userId, error: result.error });
    }
  }

  return { created, errors };
}

function shuffle<T>(arr: T[]): void {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
}

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
