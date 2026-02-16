/**
 * Feed cache: uses lib/cache/redis (Redis when REDIS_URL is set, else in-memory).
 * TTL 5 minutes. Keys: feed:{userId}. Values: JSON array of feed items (dates as ISO strings).
 */

import { cacheGet, cacheSet, cacheDel } from "@/lib/cache/redis";

const CACHE_KEY_PREFIX = "feed:";
const DEFAULT_TTL_SEC = 5 * 60; // 5 minutes

export type CachedFeedItem = {
  id: string;
  title: string;
  category: string;
  createdAt: Date;
  closesAt: Date;
  [k: string]: unknown;
};

function serialize(items: CachedFeedItem[]): string {
  return JSON.stringify(
    items.map((it) => ({
      ...it,
      createdAt: it.createdAt instanceof Date ? it.createdAt.toISOString() : it.createdAt,
      closesAt: it.closesAt instanceof Date ? it.closesAt.toISOString() : it.closesAt,
    }))
  );
}

function deserialize(raw: string): CachedFeedItem[] {
  const parsed = JSON.parse(raw) as Array<Record<string, unknown>>;
  return parsed.map((it) => ({
    ...it,
    createdAt: new Date(it.createdAt as string),
    closesAt: new Date(it.closesAt as string),
  })) as CachedFeedItem[];
}

/**
 * Get cached feed for user. Returns null on miss or expiry.
 */
export async function getFeedCache(userId: string): Promise<CachedFeedItem[] | null> {
  const raw = await cacheGet(CACHE_KEY_PREFIX + userId);
  if (raw == null) return null;
  try {
    return deserialize(raw);
  } catch {
    return null;
  }
}

/**
 * Set feed cache for user. TTL in seconds (default 5 min).
 */
export async function setFeedCache(
  userId: string,
  data: CachedFeedItem[],
  ttlSec: number = DEFAULT_TTL_SEC
): Promise<void> {
  await cacheSet(CACHE_KEY_PREFIX + userId, serialize(data), ttlSec);
}

/**
 * Invalidate feed cache for a user (e.g. after new prediction so feed can refresh).
 */
export async function invalidateFeedCache(userId: string): Promise<void> {
  await cacheDel(CACHE_KEY_PREFIX + userId);
}

/**
 * Invalidate all feed caches (e.g. after global event resolution). Use sparingly.
 */
export async function invalidateAllFeedCaches(): Promise<void> {
  await cacheDel("feed:*");
}
