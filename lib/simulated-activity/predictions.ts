/**
 * Previsioni simulate: bot che piazzano previsioni su eventi aperti.
 * Usa LMSR (executePredictionBuy). I bot scommettono solo su eventi con attività (q_yes + q_no > 0)
 * e scelgono SÌ/NO in proporzione al prezzo attuale per mantenere la proporzione (es. 1/2 → altre scommesse 1:2).
 */

import type { PrismaClient } from "@prisma/client";
import { getPrice } from "@/lib/pricing/lmsr";
import { executePredictionBuy, TradeError } from "@/lib/pricing/trade";
import { MAX_PREDICTIONS_PER_RUN } from "./config";

/** Crediti per scommessa: range da “piccola” a “sostanziale” per sembrare utenti reali */
const MIN_CREDITS_DEFAULT = 50;
const MAX_CREDITS_DEFAULT = 650;

export interface CreateSimulatedPredictionParams {
  userId: string;
  eventId: string;
  outcome: "YES" | "NO";
  credits: number;
}

export interface RunSimulatedPredictionsOptions {
  maxPredictions?: number;
  minCredits?: number;
  maxCredits?: number;
}

/**
 * Crea una previsione a nome di un bot usando LMSR (executePredictionBuy).
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
    select: {
      id: true,
      title: true,
      category: true,
      resolved: true,
      closesAt: true,
      q_yes: true,
      q_no: true,
      b: true,
    },
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

  const qYes = event.q_yes ?? 0;
  const qNo = event.q_no ?? 0;
  if (qYes + qNo <= 0) {
    return { success: false, error: "Evento senza attività LMSR (0/0): i bot non scommettono" };
  }

  try {
    const result = await prisma.$transaction((tx) =>
      executePredictionBuy(tx, {
        event: {
          id: event.id,
          title: event.title,
          category: event.category,
          resolved: event.resolved,
          closesAt: event.closesAt,
          q_yes: event.q_yes,
          q_no: event.q_no,
          b: event.b,
        },
        userId,
        outcome,
        creditsToSpend: credits,
      })
    );
    return { success: true, predictionId: result.prediction.id };
  } catch (err) {
    if (err instanceof TradeError) {
      return { success: false, error: err.message };
    }
    const code = err && typeof err === "object" && "code" in err ? (err as { code: string }).code : null;
    if (code === "P2002") {
      return { success: false, error: "Previsione già esistente per questo evento" };
    }
    throw err;
  }
}

/**
 * Esegue una run di previsioni simulate: solo eventi con q_yes + q_no > 0.
 * Per ogni evento, outcome scelto con probabilità pari al prezzo attuale (SÌ con p_yes, NO con p_no)
 * così le nuove scommesse mantengono la proporzione (es. 1/2 → altre scommesse in media 1:2).
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
    select: {
      id: true,
      title: true,
      q_yes: true,
      q_no: true,
      b: true,
    },
  });

  // Solo eventi con attività LMSR (q_yes + q_no > 0): su 0/0 i bot non scommettono
  const eventsWithActivity = openEvents.filter((e) => {
    const qYes = e.q_yes ?? 0;
    const qNo = e.q_no ?? 0;
    return qYes + qNo > 0;
  });

  if (eventsWithActivity.length === 0) {
    return { created: 0, errors: [] };
  }

  const existingPredictions = await prisma.prediction.findMany({
    where: {
      userId: { in: botUserIds },
      eventId: { in: eventsWithActivity.map((e) => e.id) },
    },
    select: { userId: true, eventId: true },
  });

  const predictedKey = new Set(
    existingPredictions.map((p) => `${p.eventId}:${p.userId}`)
  );

  const candidates: { event: (typeof eventsWithActivity)[number]; userId: string }[] = [];
  for (const event of eventsWithActivity) {
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
    const qYes = event.q_yes ?? 0;
    const qNo = event.q_no ?? 0;
    const b = event.b ?? 100;
    const pYes = getPrice(qYes, qNo, b, "YES");
    const outcome = Math.random() < pYes ? "YES" : "NO";

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
