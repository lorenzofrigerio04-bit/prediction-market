/**
 * Trend detection cache layer
 * TTL: 15–30 min (configurable via TREND_CACHE_TTL_SEC)
 */

import { cacheGetJson, cacheSetJson } from '@/lib/cache/redis';
import type { TrendObject } from './types';

const CACHE_KEY_PREFIX = 'trend:detection:';
const DEFAULT_TTL_SEC = 15 * 60; // 15 minutes

function getCacheKey(options?: { limit?: number }): string {
  const limit = options?.limit ?? 50;
  return `${CACHE_KEY_PREFIX}v1:limit=${limit}`;
}

function getTtlSec(): number {
  const env = process.env.TREND_CACHE_TTL_SEC;
  if (env) {
    const n = parseInt(env, 10);
    if (!isNaN(n) && n > 0) return n;
  }
  return DEFAULT_TTL_SEC;
}

export async function getCachedTrends(options?: {
  limit?: number;
}): Promise<TrendObject[] | null> {
  const key = getCacheKey(options);
  const cached = await cacheGetJson<TrendObject[]>(key);
  if (!cached || !Array.isArray(cached)) return null;
  return cached.map((t) => ({
    ...t,
    timestamp: new Date(t.timestamp),
    source_signals: (t.source_signals ?? []).map((s) => ({
      ...s,
      timestamp: new Date(s.timestamp),
    })),
  }));
}

export async function setCachedTrends(
  trends: TrendObject[],
  options?: { limit?: number }
): Promise<void> {
  const key = getCacheKey(options);
  await cacheSetJson(key, trends, getTtlSec());
}

export async function invalidateTrendCache(): Promise<void> {
  const { cacheDel } = await import('@/lib/cache/redis');
  await cacheDel(CACHE_KEY_PREFIX + '*');
}
