import type { NewsFormat } from "@/lib/news-engine/types";

/** Da questa data parte la “campagna” follower simulati (millisecondi UTC). */
export const NEWS_SIMULATED_FOLLOWERS_EPOCH_MS = Date.UTC(2025, 0, 1);

const MS_PER_MONTH = (1000 * 60 * 60 * 24 * 365.25) / 12;

function hashFormat(format: NewsFormat): number {
  let h = 2166136261;
  const s = format;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

/**
 * Follower simulati per rubrica: stesso valore per tutti gli utenti, stabile tra un refresh e l’altro
 * (a parità di orario), che aumenta gradualmente nel tempo su scala mensile.
 */
export function simulatedFollowerCount(format: NewsFormat, nowMs = Date.now()): number {
  const h = hashFormat(format);
  const base = 820 + (h % 4180);
  const monthlyGrowth = 5 + (h % 22);
  const elapsedMs = nowMs - NEWS_SIMULATED_FOLLOWERS_EPOCH_MS;
  const months = elapsedMs > 0 ? elapsedMs / MS_PER_MONTH : 0;
  const growth = Math.floor(months * monthlyGrowth);
  return base + growth;
}
