/**
 * Central cache layer: Redis when REDIS_URL is set, else in-memory fallback.
 * Use for feed, market prices, and trending with appropriate TTLs.
 */

let redisClient: import("ioredis").Redis | null = null;

export function getRedisClient(): import("ioredis").Redis | null {
  const url = process.env.REDIS_URL;
  if (!url?.trim()) return null;
  if (redisClient) return redisClient;
  try {
    const Redis = (require("ioredis").default ?? require("ioredis")) as new (
      url: string,
      opts?: object
    ) => import("ioredis").Redis;
    redisClient = new Redis(url, { maxRetriesPerRequest: 2 });
    return redisClient;
  } catch {
    return null;
  }
}

/** In-memory store: key -> { value, expiresAt } */
const memoryStore = new Map<string, { value: string; expiresAt: number }>();

/**
 * Get a string value by key. Returns null on miss or expiry.
 */
export async function cacheGet(key: string): Promise<string | null> {
  const redis = getRedisClient();
  if (redis) {
    try {
      return await redis.get(key);
    } catch {
      return memoryGet(key);
    }
  }
  return memoryGet(key);
}

function memoryGet(key: string): string | null {
  const entry = memoryStore.get(key);
  if (!entry || Date.now() > entry.expiresAt) {
    if (entry) memoryStore.delete(key);
    return null;
  }
  return entry.value;
}

/**
 * Set a string value with TTL in seconds.
 */
export async function cacheSet(
  key: string,
  value: string,
  ttlSec: number
): Promise<void> {
  const redis = getRedisClient();
  if (redis) {
    try {
      await redis.setex(key, ttlSec, value);
      return;
    } catch {
      // fallback to memory
    }
  }
  const ttlMs = Math.min(ttlSec * 1000, 24 * 60 * 60 * 1000); // cap at 24h
  memoryStore.set(key, { value, expiresAt: Date.now() + ttlMs });
}

/**
 * Delete one or more keys. Supports patterns for Redis (e.g. "trending:*") by
 * doing a SCAN + DEL; for memory we only support exact key match.
 */
export async function cacheDel(keyOrPattern: string): Promise<void> {
  const redis = getRedisClient();
  if (redis) {
    try {
      if (keyOrPattern.includes("*")) {
        const keys: string[] = [];
        let cursor = "0";
        do {
          const [next, found] = await redis.scan(
            cursor,
            "MATCH",
            keyOrPattern,
            "COUNT",
            100
          );
          cursor = next;
          if (found?.length) keys.push(...found);
        } while (cursor !== "0");
        if (keys.length) await redis.del(...keys);
      } else {
        await redis.del(keyOrPattern);
      }
      return;
    } catch {
      // fallback: only exact key in memory
    }
  }
  if (!keyOrPattern.includes("*")) {
    memoryStore.delete(keyOrPattern);
  } else {
    const prefix = keyOrPattern.replace(/\*$/, "");
    for (const key of memoryStore.keys()) {
      if (key.startsWith(prefix)) memoryStore.delete(key);
    }
  }
}

/**
 * Get JSON value; returns null on miss or parse error.
 */
export async function cacheGetJson<T>(key: string): Promise<T | null> {
  const raw = await cacheGet(key);
  if (raw == null) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

/**
 * Set JSON value with TTL in seconds.
 */
export async function cacheSetJson<T>(
  key: string,
  value: T,
  ttlSec: number
): Promise<void> {
  await cacheSet(key, JSON.stringify(value), ttlSec);
}

/** Whether Redis is in use (for logging or feature flags). */
export function isRedisAvailable(): boolean {
  return getRedisClient() != null;
}
