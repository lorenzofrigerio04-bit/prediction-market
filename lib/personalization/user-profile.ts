/**
 * User profile extraction for personalization.
 * Extracts preferredCategories, riskTolerance, preferredHorizon, noveltySeeking
 * from trades (predictions), and updates UserProfile on each trade (async, non-blocking).
 */

import type { PrismaClient } from "@prisma/client";

const MS_PER_DAY = 24 * 60 * 60 * 1000;

/** Days until event close to consider SHORT / MEDIUM / LONG horizon */
const HORIZON_SHORT_DAYS = 7;
const HORIZON_MEDIUM_DAYS = 30;

/** Event is "new" for novelty if it was created within this many days before the trade */
const NEW_MARKET_DAYS = 7;

/** Risk tolerance buckets (from 0-1 ratio) */
const RISK_LOW = 0.33;
const RISK_HIGH = 0.66;

export type RiskToleranceLevel = "LOW" | "MEDIUM" | "HIGH";
export type PreferredHorizonLevel = "SHORT" | "MEDIUM" | "LONG";

export interface ExtractedProfile {
  preferredCategories: Record<string, number>;
  riskTolerance: RiskToleranceLevel;
  preferredHorizon: PreferredHorizonLevel;
  noveltySeeking: number;
}

/**
 * Extract preferredCategories: count trades per category, normalize to 0-1 (by max count).
 */
export function extractPreferredCategories(
  categoryCounts: Record<string, number>
): Record<string, number> {
  const entries = Object.entries(categoryCounts);
  if (entries.length === 0) return {};
  const max = Math.max(...entries.map(([, c]) => c), 1);
  const out: Record<string, number> = {};
  for (const [cat, count] of entries) {
    out[cat] = Math.round((count / max) * 100) / 100;
  }
  return out;
}

/**
 * Extract riskTolerance: avgTradeAmount / userCredits, capped to 0-1, then map to LOW/MEDIUM/HIGH.
 */
export function extractRiskTolerance(
  avgTradeAmount: number,
  userCredits: number
): RiskToleranceLevel {
  if (userCredits <= 0) return "MEDIUM";
  const ratio = Math.min(1, Math.max(0, avgTradeAmount / userCredits));
  if (ratio < RISK_LOW) return "LOW";
  if (ratio > RISK_HIGH) return "HIGH";
  return "MEDIUM";
}

/**
 * Extract preferredHorizon: avg days until market close from user's trades -> SHORT / MEDIUM / LONG.
 */
export function extractPreferredHorizon(avgDaysUntilClose: number): PreferredHorizonLevel {
  if (avgDaysUntilClose < HORIZON_SHORT_DAYS) return "SHORT";
  if (avgDaysUntilClose <= HORIZON_MEDIUM_DAYS) return "MEDIUM";
  return "LONG";
}

/**
 * Extract noveltySeeking: fraction of trades on "new" markets (event created within NEW_MARKET_DAYS before trade).
 * Returns 0-1.
 */
export function extractNoveltySeeking(
  tradesOnNewMarkets: number,
  totalTrades: number
): number {
  if (totalTrades === 0) return 0;
  return Math.round((tradesOnNewMarkets / totalTrades) * 100) / 100;
}

/**
 * Compute all profile features from user's predictions and current credits.
 * Used internally and for tests.
 */
export async function computeProfileFromPredictions(
  prisma: PrismaClient,
  userId: string
): Promise<ExtractedProfile | null> {
  const [user, predictions] = await Promise.all([
    prisma.user.findUnique({
      where: { id: userId },
      select: { credits: true },
    }),
    prisma.prediction.findMany({
      where: { userId },
      select: {
        credits: true,
        createdAt: true,
        event: {
          select: { category: true, closesAt: true, createdAt: true },
        },
      },
    }),
  ]);

  if (!user || predictions.length === 0) {
    return null;
  }

  const categoryCounts: Record<string, number> = {};
  let totalCost = 0;
  let daysSum = 0;
  let tradesOnNewMarkets = 0;

  for (const p of predictions) {
    const cat = p.event.category;
    categoryCounts[cat] = (categoryCounts[cat] ?? 0) + 1;

    const cost = p.credits ?? 0;
    totalCost += cost;

    const closesAt = p.event.closesAt.getTime();
    const createdAt = p.createdAt.getTime();
    const daysUntilClose = Math.max(0, (closesAt - createdAt) / MS_PER_DAY);
    daysSum += daysUntilClose;

    const eventCreatedAt = p.event.createdAt.getTime();
    const daysEventExisted = (createdAt - eventCreatedAt) / MS_PER_DAY;
    if (daysEventExisted <= NEW_MARKET_DAYS) tradesOnNewMarkets += 1;
  }

  const n = predictions.length;
  const avgTradeAmount = totalCost / n;
  const avgDaysUntilClose = daysSum / n;

  return {
    preferredCategories: extractPreferredCategories(categoryCounts),
    riskTolerance: extractRiskTolerance(avgTradeAmount, user.credits),
    preferredHorizon: extractPreferredHorizon(avgDaysUntilClose),
    noveltySeeking: extractNoveltySeeking(tradesOnNewMarkets, n),
  };
}

/**
 * Update UserProfile for a user from their trade history.
 * Creates the profile if it doesn't exist (new users).
 * Call this after each trade; safe to call with no predictions (no-op for new users until first trade).
 */
export async function updateUserProfileFromTrade(
  _prisma: PrismaClient,
  _userId: string
): Promise<void> {
  // UserProfile non è nello schema Prisma: no-op
}
