/**
 * Previsioni simulate: bot che comprano quote su eventi AMM aperti.
 * Usa executeBuyShares (AMM). I bot scelgono SÌ/NO in proporzione al prezzo attuale.
 */

import type { PrismaClient } from "@prisma/client";
import { randomUUID } from "crypto";
import { priceYesMicros, SCALE } from "@/lib/amm/fixedPointLmsr";
import { executeBuyShares, AmmError } from "@/lib/amm/engine";
import { MAX_PREDICTIONS_PER_RUN } from "./config";

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
 * Crea un acquisto quote AMM a nome di un bot.
 */
export async function createSimulatedPrediction(
  prisma: PrismaClient,
  params: CreateSimulatedPredictionParams
): Promise<{ success: true; tradeId: string } | { success: false; error: string }> {
  const { userId, eventId, outcome, credits } = params;

  if (credits < 1) {
    return { success: false, error: "Importo deve essere almeno 1 credito" };
  }

  const event = await prisma.event.findUnique({
    where: { id: eventId },
    select: {
      id: true,
      resolved: true,
      closesAt: true,
      tradingMode: true,
    },
  });

  if (!event) {
    return { success: false, error: "Evento non trovato" };
  }

  if (event.tradingMode !== "AMM") {
    return { success: false, error: "Solo mercati AMM supportati" };
  }

  if (event.resolved) {
    return { success: false, error: "Evento già risolto" };
  }

  if (new Date(event.closesAt) < new Date()) {
    return { success: false, error: "Previsioni per questo evento sono chiuse" };
  }

  const maxCostMicros = BigInt(Math.floor(credits * Number(SCALE)));
  const idempotencyKey = `sim-${randomUUID()}`;

  try {
    const result = await prisma.$transaction((tx) =>
      executeBuyShares(tx, {
        eventId,
        userId,
        outcome,
        maxCostMicros,
        idempotencyKey,
      })
    );
    return { success: true, tradeId: result.trade.id };
  } catch (err) {
    if (err instanceof AmmError) {
      return { success: false, error: err.message };
    }
    const code = err && typeof err === "object" && "code" in err ? (err as { code: string }).code : null;
    if (code === "P2002") {
      return { success: false, error: "Idempotency key duplicata" };
    }
    throw err;
  }
}

/**
 * Esegue una run di acquisti simulate su eventi AMM aperti.
 * Per ogni evento, outcome scelto con probabilità pari al prezzo (SÌ con p_yes, NO con p_no).
 */
export async function runSimulatedPredictions(
  prisma: PrismaClient,
  botUserIds: string[],
  options?: RunSimulatedPredictionsOptions
): Promise<{ created: number; errors: { eventId: string; userId: string; error: string }[] }> {
  const maxPredictions = options?.maxPredictions ?? MAX_PREDICTIONS_PER_RUN;
  const minCredits = options?.minCredits ?? 50;
  const maxCredits = options?.maxCredits ?? 650;

  if (botUserIds.length === 0) {
    return { created: 0, errors: [] };
  }

  const now = new Date();
  const openEvents = await prisma.event.findMany({
    where: {
      resolved: false,
      closesAt: { gt: now },
      tradingMode: "AMM",
    },
    select: { id: true },
  });

  if (openEvents.length === 0) {
    return { created: 0, errors: [] };
  }

  const eventIds = openEvents.map((e) => e.id);
  const ammStates = await prisma.ammState.findMany({
    where: { eventId: { in: eventIds } },
    select: { eventId: true, qYesMicros: true, qNoMicros: true, bMicros: true },
  });
  const ammByEvent = new Map(ammStates.map((a) => [a.eventId, a]));

  const existingPositions = await prisma.position.findMany({
    where: {
      userId: { in: botUserIds },
      eventId: { in: eventIds },
    },
    select: { eventId: true, userId: true },
  });
  const hasPositionKey = new Set(
    existingPositions.map((p) => `${p.eventId}:${p.userId}`)
  );

  const candidates: { eventId: string; userId: string }[] = [];
  for (const e of openEvents) {
    const amm = ammByEvent.get(e.id);
    if (!amm) continue;
    for (const userId of botUserIds) {
      if (!hasPositionKey.has(`${e.id}:${userId}`)) {
        candidates.push({ eventId: e.id, userId });
      }
    }
  }

  shuffle(candidates);
  const toCreate = candidates.slice(0, maxPredictions);

  let created = 0;
  const errors: { eventId: string; userId: string; error: string }[] = [];

  for (const { eventId, userId } of toCreate) {
    const amm = ammByEvent.get(eventId);
    if (!amm) continue;

    const yesMicros = priceYesMicros(amm.qYesMicros, amm.qNoMicros, amm.bMicros);
    const pYes = Number((yesMicros * 100n) / SCALE) / 100;
    const outcome = Math.random() < pYes ? "YES" : "NO";
    const credits = randomInt(minCredits, maxCredits);

    const result = await createSimulatedPrediction(prisma, {
      userId,
      eventId,
      outcome,
      credits,
    });

    if (result.success) {
      created++;
    } else {
      errors.push({ eventId, userId, error: result.error });
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
