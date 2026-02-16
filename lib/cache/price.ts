/**
 * Market price cache: key=price:{eventId}, TTL=1s.
 * Used by event detail and price endpoint to avoid repeated DB reads.
 */

import { cacheGetJson, cacheSetJson, cacheDel } from "@/lib/cache/redis";

const PRICE_KEY_PREFIX = "price:";
const PRICE_TTL_SEC = 1;

export type CachedPrice = {
  eventId: string;
  probability: number;
  q_yes: number;
  q_no: number;
  b: number;
};

export async function getCachedPrice(eventId: string): Promise<CachedPrice | null> {
  return cacheGetJson<CachedPrice>(PRICE_KEY_PREFIX + eventId);
}

export async function setCachedPrice(eventId: string, data: CachedPrice): Promise<void> {
  await cacheSetJson(PRICE_KEY_PREFIX + eventId, data, PRICE_TTL_SEC);
}

export async function invalidatePriceCache(eventId: string): Promise<void> {
  await cacheDel(PRICE_KEY_PREFIX + eventId);
}
