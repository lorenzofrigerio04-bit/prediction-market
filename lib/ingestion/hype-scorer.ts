/**
 * Hype scoring for trend candidates.
 * Score by recency, source authority, and simple engagement signals.
 * Optional feedback weights (from analytics feedback-loop) adjust source score by actual market success.
 */

import type { NewsCandidate } from "@/lib/event-sources/types";
import { isItalySource, ITALY_SOURCE_BOOST } from "./italy-sources";
import { sourceKeyFromUrl } from "@/lib/analytics/feedback-loop";

/** Max age in hours for "very recent" (full recency score). */
const RECENCY_FULL_HOURS = 6;
/** After this many hours, recency score decays to zero. */
const RECENCY_DECAY_HOURS = 168; // 7 days

/**
 * Recency score 0–1: newer = higher.
 */
function recencyScore(publishedAt: string): number {
  const published = new Date(publishedAt).getTime();
  const ageHours = (Date.now() - published) / (60 * 60 * 1000);
  if (ageHours <= RECENCY_FULL_HOURS) return 1;
  if (ageHours >= RECENCY_DECAY_HOURS) return 0;
  return 1 - (ageHours - RECENCY_FULL_HOURS) / (RECENCY_DECAY_HOURS - RECENCY_FULL_HOURS);
}

/**
 * Source authority score 0–1 (Italy + known names get higher).
 * If feedback sourceWeights provided, multiplies by weight for that source (prioritize high-performing sources).
 */
function sourceScore(
  url: string,
  sourceName?: string | null,
  sourceWeights?: Record<string, number>
): number {
  let base = 0.5;
  if (isItalySource(url, sourceName)) base = 1;
  else {
    const name = (sourceName ?? "").toLowerCase();
    if (name.includes("reuters") || name.includes("ap ") || name.includes("afp")) base = 0.8;
    else if (name.includes("bbc") || name.includes("cnn")) base = 0.7;
  }
  if (sourceWeights) {
    const key = sourceKeyFromUrl(url);
    if (key && sourceWeights[key] != null) base *= sourceWeights[key];
  }
  return Math.min(1, base);
}

export type HypeScoreOptions = {
  /** Feedback weights by source hostname (0.5–1): multiplies source component to prioritize high-performing sources. */
  sourceWeights?: Record<string, number>;
  /** Recency weight (default 0.6). */
  recencyWeight?: number;
  /** Source weight (default 0.4). */
  sourceWeight?: number;
};

const DEFAULT_RECENCY_WEIGHT = 0.6;
const DEFAULT_SOURCE_WEIGHT = 0.4;

/**
 * Hype score 0–1 for a candidate (recency + source).
 * Weights: recency 0.6, source 0.4 (overridable via options).
 * When sourceWeights (feedback) provided, source component is adjusted by actual market success.
 */
export function getHypeScore(
  candidate: NewsCandidate,
  options?: HypeScoreOptions
): number {
  const recWeight = options?.recencyWeight ?? DEFAULT_RECENCY_WEIGHT;
  const srcWeight = options?.sourceWeight ?? DEFAULT_SOURCE_WEIGHT;
  const rec = recencyScore(candidate.publishedAt);
  const src = sourceScore(
    candidate.url,
    candidate.sourceName,
    options?.sourceWeights
  );
  return rec * recWeight + src * srcWeight;
}

/**
 * Sort candidates by hype (desc) and optionally boost Italy sources.
 * When sourceWeights (feedback) provided, high-performing sources are prioritized.
 * Returns a new sorted array.
 */
export function rankByHypeAndItaly(
  candidates: NewsCandidate[],
  options?: { boostItaly?: boolean; sourceWeights?: Record<string, number> }
): NewsCandidate[] {
  const boostItaly = options?.boostItaly !== false;
  const hypeOptions: HypeScoreOptions | undefined = options?.sourceWeights
    ? { sourceWeights: options.sourceWeights }
    : undefined;
  return [...candidates].sort((a, b) => {
    let scoreA = getHypeScore(a, hypeOptions);
    let scoreB = getHypeScore(b, hypeOptions);
    if (boostItaly) {
      if (isItalySource(a.url, a.sourceName)) scoreA *= ITALY_SOURCE_BOOST;
      if (isItalySource(b.url, b.sourceName)) scoreB *= ITALY_SOURCE_BOOST;
    }
    return scoreB - scoreA;
  });
}
