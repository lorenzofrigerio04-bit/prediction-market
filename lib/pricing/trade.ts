/**
 * Trade execution wrapper for LMSR prediction markets.
 * Encapsulates: validation (credits, market open), buyShares(), and atomic DB updates.
 */

import type { PrismaClient } from "@prisma/client";
import { buyShares, getPrice } from "./lmsr";
import { applyCreditTransaction } from "@/lib/apply-credit-transaction";

type PrismaTx = Pick<
  PrismaClient,
  "user" | "transaction" | "event" | "prediction"
>;

export class TradeError extends Error {
  constructor(
    message: string,
    public readonly code:
      | "MARKET_CLOSED"
      | "MARKET_RESOLVED"
      | "INSUFFICIENT_CREDITS"
      | "ALREADY_PREDICTED"
      | "USER_NOT_FOUND"
  ) {
    super(message);
    this.name = "TradeError";
  }
}

export interface EventForTrade {
  id: string;
  title: string;
  category: string;
  resolved: boolean;
  closesAt: Date;
  q_yes: number | null;
  q_no: number | null;
  b: number | null;
}

export interface ExecutePredictionBuyParams {
  event: EventForTrade;
  userId: string;
  outcome: "YES" | "NO";
  creditsToSpend: number;
}

export interface ExecutePredictionBuyResult {
  prediction: {
    id: string;
    userId: string;
    eventId: string;
    outcome: string;
    credits: number;
    sharesYes: number | null;
    sharesNo: number | null;
    costBasis: number | null;
    createdAt: Date;
  };
  actualCostPaid: number;
}

/**
 * Validates that the market is open for trading (not resolved, closesAt > now).
 */
export function validateMarketOpen(event: EventForTrade): void {
  if (event.resolved) {
    throw new TradeError("Questo evento è già stato risolto", "MARKET_RESOLVED");
  }
  if (new Date(event.closesAt) < new Date()) {
    throw new TradeError(
      "Le previsioni per questo evento sono chiuse",
      "MARKET_CLOSED"
    );
  }
}

/**
 * Execute a prediction buy (LMSR) inside a Prisma transaction.
 * Validates: market open, user credits, no duplicate prediction.
 * Creates Prediction, updates Event q_yes/q_no and probability, deducts credits.
 * Caller must run this inside prisma.$transaction() for atomicity.
 */
export async function executePredictionBuy(
  tx: PrismaTx,
  params: ExecutePredictionBuyParams
): Promise<ExecutePredictionBuyResult> {
  const { event, userId, outcome, creditsToSpend } = params;

  validateMarketOpen(event);

  const qYes = event.q_yes ?? 0;
  const qNo = event.q_no ?? 0;
  const b = event.b ?? 100;

  const { sharesBought, actualCostPaid } = buyShares(
    qYes,
    qNo,
    b,
    outcome,
    creditsToSpend
  );

  const [user, existingPrediction] = await Promise.all([
    tx.user.findUnique({
      where: { id: userId },
      select: { credits: true },
    }),
    tx.prediction.findUnique({
      where: {
        userId_eventId: { userId, eventId: event.id },
      },
    }),
  ]);

  if (!user) {
    throw new TradeError("Utente non trovato", "USER_NOT_FOUND");
  }
  if (user.credits < actualCostPaid) {
    throw new TradeError("Crediti insufficienti", "INSUFFICIENT_CREDITS");
  }
  if (existingPrediction) {
    throw new TradeError(
      "Hai già fatto una previsione per questo evento",
      "ALREADY_PREDICTED"
    );
  }

  const newQYes = outcome === "YES" ? qYes + sharesBought : qYes;
  const newQNo = outcome === "NO" ? qNo + sharesBought : qNo;
  const newProbability = getPrice(newQYes, newQNo, b, "YES") * 100;

  const prediction = await tx.prediction.create({
    data: {
      userId,
      eventId: event.id,
      outcome,
      credits: creditsToSpend,
      sharesYes: outcome === "YES" ? sharesBought : null,
      sharesNo: outcome === "NO" ? sharesBought : null,
      costBasis: actualCostPaid,
    },
  });

  await applyCreditTransaction(tx, userId, "PREDICTION_BET", -actualCostPaid, {
    description: `Previsione ${outcome === "YES" ? "SÌ" : "NO"} su "${event.title}"`,
    referenceId: prediction.id,
    referenceType: "prediction",
  });

  await tx.event.update({
    where: { id: event.id },
    data: {
      q_yes: newQYes,
      q_no: newQNo,
      probability: newProbability,
      yesPredictions: outcome === "YES" ? { increment: 1 } : undefined,
      noPredictions: outcome === "NO" ? { increment: 1 } : undefined,
    },
  });

  return {
    prediction: {
      id: prediction.id,
      userId: prediction.userId,
      eventId: prediction.eventId,
      outcome: prediction.outcome,
      credits: prediction.credits,
      sharesYes: prediction.sharesYes,
      sharesNo: prediction.sharesNo,
      costBasis: prediction.costBasis,
      createdAt: prediction.createdAt,
    },
    actualCostPaid,
  };
}
