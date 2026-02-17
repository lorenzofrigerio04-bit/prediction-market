/**
 * Feed candidate generation: 40% trending, 50% personalized, 10% exploration.
 * Trending: volume_6h / age_hours. Personalized: scored by user profile. Exploration: random from low-impression categories.
 */

import type { PrismaClient } from "@prisma/client";
import type { FeedMarket, UserProfileView } from "./scoring";
import { scoreMarketForUser } from "./scoring";
import type { RiskToleranceLevel, PreferredHorizonLevel } from "./user-profile";

const DEFAULT_LIMIT = 20;
const TRENDING_PCT = 0.4;
const PERSONALIZED_PCT = 0.5;
const EXPLORATION_PCT = 0.1;
const SIX_HOURS_MS = 6 * 60 * 60 * 1000;
const MIN_AGE_HOURS = 0.1;

export interface FeedCandidate {
  eventId: string;
  source: "trending" | "personalized" | "exploration";
  score?: number;
}

/**
 * Load user profile for personalization; returns null if no profile (anonymous or new user).
 * If UserProfile table is missing or query fails, returns null (neutral profile used).
 */
async function loadUserProfile(
  _prisma: PrismaClient,
  userId: string | null
): Promise<UserProfileView | null> {
  if (!userId) return null;
  // UserProfile non è nello schema Prisma: personalizzazione disabilitata
  return null;
}

/**
 * Aggregate volume_6h and impressions per event from MarketMetrics (last 6 hours).
 * If MarketMetrics table is missing or query fails (e.g. migration not run in prod), returns empty map.
 */
async function getMetricsLast6h(prisma: PrismaClient): Promise<Map<string, { volume_6h: number; impressions: number }>> {
  try {
    const map = new Map<string, { volume_6h: number; impressions: number }>();
    // marketMetrics non esiste nello schema - rows vuoto
    const rows: any[] = [];
    for (const r of rows) {
      const cur = map.get(r.eventId) ?? { volume_6h: 0, impressions: 0 };
      cur.volume_6h += r.volume ?? 0;
      cur.impressions += r.impressions ?? 0;
      map.set(r.eventId, cur);
    }
    return map;
  } catch {
    return new Map();
  }
}

/**
 * Fetch open events and enrich with volume_6h and impressions.
 */
async function getOpenMarketsWithMetrics(
  prisma: PrismaClient,
  poolSize: number
): Promise<FeedMarket[]> {
  const now = new Date();
  const [events, metricsMap] = await Promise.all([
    prisma.event.findMany({
      where: { resolved: false, closesAt: { gt: now } },
      select: {
        id: true,
        category: true,
        closesAt: true,
        createdAt: true,
        b: true,
      },
      take: poolSize,
      orderBy: { createdAt: "desc" },
    }),
    getMetricsLast6h(prisma),
  ]);

  return events.map((e) => {
    const m = metricsMap.get(e.id);
    return {
      id: e.id,
      category: e.category,
      closesAt: e.closesAt,
      createdAt: e.createdAt,
      totalCredits: 0,
      b: e.b ?? 100,
      volume_6h: m?.volume_6h ?? 0,
      impressions: m?.impressions ?? 0,
    };
  });
}

/**
 * Trending: sort by volume_6h / age_hours (highest first), take up to n.
 */
function selectTrending(markets: FeedMarket[], n: number): FeedMarket[] {
  const now = Date.now();
  const withScore = markets.map((m) => {
    const ageHours = Math.max(
      MIN_AGE_HOURS,
      (now - m.createdAt.getTime()) / (60 * 60 * 1000)
    );
    return { market: m, trendScore: m.volume_6h / ageHours };
  });
  withScore.sort((a, b) => b.trendScore - a.trendScore);
  return withScore.slice(0, n).map((x) => x.market);
}

/**
 * Personalized: score by user profile, take top n not in excludeIds.
 */
function selectPersonalized(
  markets: FeedMarket[],
  profile: UserProfileView,
  n: number,
  excludeIds: Set<string>
): { market: FeedMarket; score: number }[] {
  const maxAgeMs = 30 * 24 * 60 * 60 * 1000;
  const maxVolume = Math.max(1, ...markets.map((m) => m.volume_6h));
  const scored = markets
    .filter((m) => !excludeIds.has(m.id))
    .map((m) => ({
      market: m,
      score: scoreMarketForUser(m, profile, { maxAgeMs, maxVolume }),
    }));
  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, n);
}

/**
 * Exploration: random from categories with low total impressions (bandit-style: low-impression potential).
 */
function selectExploration(
  markets: FeedMarket[],
  n: number,
  excludeIds: Set<string>
): FeedMarket[] {
  const available = markets.filter((m) => !excludeIds.has(m.id));
  if (available.length <= n) return available;

  // Category total impressions (for "low-impression categories")
  const categoryImpressions = new Map<string, number>();
  for (const m of available) {
    categoryImpressions.set(
      m.category,
      (categoryImpressions.get(m.category) ?? 0) + m.impressions
    );
  }
  const avgImp = [...categoryImpressions.values()].reduce((a, b) => a + b, 0) / categoryImpressions.size || 1;
  const lowImpressionCategories = new Set(
    [...categoryImpressions.entries()]
      .filter(([, imp]) => imp <= avgImp)
      .map(([cat]) => cat)
  );

  const fromLowImp = available.filter((m) => lowImpressionCategories.has(m.category));
  const pool = fromLowImp.length >= n ? fromLowImp : available;
  const shuffled = [...pool].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, n);
}

/**
 * Generate feed candidates: 40% trending, 50% personalized, 10% exploration.
 * If userId is null or has no profile, personalized bucket uses recency+volume only (neutral profile).
 *
 * @param prisma - Prisma client
 * @param userId - Optional user id for personalization
 * @param limit - Max candidates (default 20)
 * @returns Ranked list of feed candidates (trending first, then personalized, then exploration)
 */
export async function generateFeedCandidates(
  prisma: PrismaClient,
  userId: string | null,
  limit: number = DEFAULT_LIMIT
): Promise<FeedCandidate[]> {
  const nTrending = Math.round(limit * TRENDING_PCT);
  const nPersonalized = Math.round(limit * PERSONALIZED_PCT);
  const nExploration = Math.round(limit * EXPLORATION_PCT);

  const poolSize = Math.max(limit * 3, 60);
  const markets = await getOpenMarketsWithMetrics(prisma, poolSize);
  if (markets.length === 0) return [];

  const defaultProfile: UserProfileView = {
    preferredCategories: {},
    riskTolerance: "MEDIUM",
    preferredHorizon: "MEDIUM",
  };
  const profile =
    (await loadUserProfile(prisma, userId)) ?? defaultProfile;

  const trending = selectTrending(markets, nTrending);
  const trendingIds = new Set(trending.map((m) => m.id));

  const personalized = selectPersonalized(
    markets,
    profile,
    nPersonalized,
    trendingIds
  );
  const personalizedIds = new Set(personalized.map((p) => p.market.id));
  const allUsed = new Set([...trendingIds, ...personalizedIds]);

  const exploration = selectExploration(markets, nExploration, allUsed);

  const result: FeedCandidate[] = [
    ...trending.map((m) => ({ eventId: m.id, source: "trending" as const })),
    ...personalized.map((p) => ({
      eventId: p.market.id,
      source: "personalized" as const,
      score: p.score,
    })),
    ...exploration.map((m) => ({
      eventId: m.id,
      source: "exploration" as const,
    })),
  ];

  return result.slice(0, limit);
}
