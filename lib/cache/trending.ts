/**
 * Trending markets cache: key=trending:{category}, TTL=10min.
 * Invalidate when events/markets change (e.g. new prediction, resolution).
 */

import { cacheDel } from "@/lib/cache/redis";

const TRENDING_KEY_PREFIX = "trending:";

/**
 * Invalidate all trending caches (all categories). Call after resolution or trades.
 */
export async function invalidateTrendingCache(): Promise<void> {
  await cacheDel(TRENDING_KEY_PREFIX + "*");
}

/**
 * Invalidate trending cache for one category (or "all").
 */
export async function invalidateTrendingCacheForCategory(category: string): Promise<void> {
  await cacheDel(TRENDING_KEY_PREFIX + (category || "all"));
}
