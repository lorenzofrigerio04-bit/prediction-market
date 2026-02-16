/**
 * Score markets for a user profile (personalized feed).
 * Uses: preferredCategories, risk match, horizon match, recency, volume.
 */

import type { RiskToleranceLevel, PreferredHorizonLevel } from "./user-profile";

const MS_PER_DAY = 24 * 60 * 60 * 1000;
const HORIZON_SHORT_DAYS = 7;
const HORIZON_MEDIUM_DAYS = 30;

/** Market risk from totalCredits: low credits = higher risk market */
const RISK_LOW_CREDITS = 2000;
const RISK_HIGH_CREDITS = 500;

/** Weight factors for scoring (sum to 1 or scale as needed) */
const W_CATEGORY = 0.35;
const W_RISK = 0.2;
const W_HORIZON = 0.2;
const W_RECENCY = 0.15;
const W_VOLUME = 0.1;

export interface FeedMarket {
  id: string;
  category: string;
  closesAt: Date;
  createdAt: Date;
  totalCredits: number;
  b: number;
  volume_6h: number;
  impressions: number;
}

export interface UserProfileView {
  preferredCategories: Record<string, number>;
  riskTolerance: RiskToleranceLevel;
  preferredHorizon: PreferredHorizonLevel;
}

/**
 * Derive market horizon from closesAt (days from now).
 */
export function getMarketHorizon(closesAt: Date): PreferredHorizonLevel {
  const now = Date.now();
  const daysUntilClose = Math.max(0, (closesAt.getTime() - now) / MS_PER_DAY);
  if (daysUntilClose < HORIZON_SHORT_DAYS) return "SHORT";
  if (daysUntilClose <= HORIZON_MEDIUM_DAYS) return "MEDIUM";
  return "LONG";
}

/**
 * Derive market "risk" from totalCredits (proxy: low liquidity = higher risk).
 */
export function getMarketRiskLevel(market: { totalCredits: number }): RiskToleranceLevel {
  const c = market.totalCredits;
  if (c >= RISK_LOW_CREDITS) return "LOW";
  if (c <= RISK_HIGH_CREDITS) return "HIGH";
  return "MEDIUM";
}

/**
 * Category score: user preference for this category (0–1).
 */
function categoryScore(category: string, preferredCategories: Record<string, number>): number {
  return preferredCategories[category] ?? 0;
}

/**
 * Risk match: 1 if market risk matches user tolerance, 0.5 if adjacent, 0.2 otherwise.
 */
function riskMatchScore(
  userRisk: RiskToleranceLevel,
  marketRisk: RiskToleranceLevel
): number {
  if (userRisk === marketRisk) return 1;
  const order: RiskToleranceLevel[] = ["LOW", "MEDIUM", "HIGH"];
  const ui = order.indexOf(userRisk);
  const mi = order.indexOf(marketRisk);
  if (Math.abs(ui - mi) === 1) return 0.5;
  return 0.2;
}

/**
 * Horizon match: 1 if same, 0.5 if adjacent, 0.2 otherwise.
 */
function horizonMatchScore(
  userHorizon: PreferredHorizonLevel,
  marketHorizon: PreferredHorizonLevel
): number {
  if (userHorizon === marketHorizon) return 1;
  const order: PreferredHorizonLevel[] = ["SHORT", "MEDIUM", "LONG"];
  const ui = order.indexOf(userHorizon);
  const mi = order.indexOf(marketHorizon);
  if (Math.abs(ui - mi) === 1) return 0.5;
  return 0.2;
}

/**
 * Recency score 0–1: newer createdAt = higher. Normalized by max age in pool (caller can pass maxAgeMs or we use 30 days).
 */
function recencyScore(createdAt: Date, maxAgeMs: number = 30 * MS_PER_DAY): number {
  const age = Date.now() - createdAt.getTime();
  if (age <= 0) return 1;
  if (age >= maxAgeMs) return 0;
  return 1 - age / maxAgeMs;
}

/**
 * Volume score 0–1: relative to a reference (e.g. max volume in pool). Pass maxVolume to normalize.
 */
function volumeScore(volume_6h: number, maxVolume: number): number {
  if (maxVolume <= 0) return 0;
  return Math.min(1, volume_6h / maxVolume);
}

/**
 * Score a single market for a user profile.
 * Uses category preference, risk match, horizon match, recency, and volume.
 * Optional maxAgeMs and maxVolume normalize recency/volume when scoring a pool.
 */
export function scoreMarketForUser(
  market: FeedMarket,
  profile: UserProfileView,
  options?: { maxAgeMs?: number; maxVolume?: number }
): number {
  const maxAgeMs = options?.maxAgeMs ?? 30 * MS_PER_DAY;
  const maxVol = options?.maxVolume ?? Math.max(market.volume_6h, 1);

  const cat = categoryScore(market.category, profile.preferredCategories);
  const marketRisk = getMarketRiskLevel(market);
  const risk = riskMatchScore(profile.riskTolerance, marketRisk);
  const marketHorizon = getMarketHorizon(market.closesAt);
  const horizon = horizonMatchScore(profile.preferredHorizon, marketHorizon);
  const recency = recencyScore(market.createdAt, maxAgeMs);
  const volume = volumeScore(market.volume_6h, maxVol);

  return (
    W_CATEGORY * cat +
    W_RISK * risk +
    W_HORIZON * horizon +
    W_RECENCY * recency +
    W_VOLUME * volume
  );
}
