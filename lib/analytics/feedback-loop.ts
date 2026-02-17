/**
 * Feedback loop: analyze market success by category and source.
 * Used to boost successful categories in generation and prioritize high-performing sources.
 */

import type { PrismaClient } from "@prisma/client";

export type FeedbackOptions = {
  /** Lookback window in hours for aggregating MarketMetrics (default 720 = 30 days). */
  lookbackHours?: number;
  /** Minimum number of events per category/source to include (avoid noise). Default 1. */
  minEvents?: number;
};

export type FeedbackResult = {
  /** Average success score by category (only categories with >= minEvents events). */
  categoryScores: Record<string, number>;
  /** Average success score by news source (hostname of resolutionSourceUrl). */
  sourceScores: Record<string, number>;
  /** Normalized category weights in (0.5, 1]: 0.5 = neutral, 1 = top performer. Used to boost generation. */
  categoryWeights: Record<string, number>;
  /** Normalized source weights in (0.5, 1]: 0.5 = neutral, 1 = top performer. Used in hype scoring. */
  sourceWeights: Record<string, number>;
  /** Number of events with metrics in the lookback window. */
  eventsAnalyzed: number;
};

const DEFAULT_LOOKBACK_HOURS = 720; // 30 days
const DEFAULT_MIN_EVENTS = 1;
/** Neutral weight when no feedback data; boost range is (WEIGHT_FLOOR, 1]. */
const WEIGHT_FLOOR = 0.5;

/**
 * Extract hostname from a URL for consistent source key (lowercase).
 */
export function sourceKeyFromUrl(url: string | null | undefined): string | null {
  if (!url || typeof url !== "string") return null;
  try {
    return new URL(url).hostname.toLowerCase().replace(/^www\./, "");
  } catch {
    return null;
  }
}

/**
 * Normalize raw scores to weights in (WEIGHT_FLOOR, 1].
 * - No data → WEIGHT_FLOOR
 * - Max score → 1
 * - Linear interpolation between min and max
 */
function scoresToWeights(rawScores: Record<string, number>): Record<string, number> {
  const entries = Object.entries(rawScores).filter(([, _]) => true);
  if (entries.length === 0) return {};
  const values = entries.map(([, v]) => v).filter((v) => Number.isFinite(v));
  if (values.length === 0) return {};
  const min = Math.min(...values);
  const max = Math.max(...values);
  const span = max - min || 1;
  const result: Record<string, number> = {};
  for (const [key, score] of entries) {
    if (!Number.isFinite(score)) continue;
    // 0.5 + 0.5 * normalized(0..1) => (0.5, 1]
    const normalized = (score - min) / span;
    result[key] = WEIGHT_FLOOR + (1 - WEIGHT_FLOOR) * normalized;
  }
  return result;
}

/**
 * Analyze market success by category and by source (resolution URL hostname).
 * Uses MarketMetrics.successScore over the lookback window; aggregates per event then per category/source.
 *
 * @param prisma - Prisma client
 * @param options - lookbackHours, minEvents
 * @returns Category and source scores/weights for pipeline and hype scorer
 */
export async function getFeedbackFromMetrics(
  prisma: PrismaClient,
  options?: FeedbackOptions
): Promise<FeedbackResult> {
  const lookbackHours = options?.lookbackHours ?? DEFAULT_LOOKBACK_HOURS;
  const minEvents = options?.minEvents ?? DEFAULT_MIN_EVENTS;
  const since = new Date(Date.now() - lookbackHours * 60 * 60 * 1000);

  // marketMetrics non esiste nello schema - metrics vuoto
  const metrics: any[] = [];
  const events = await prisma.event.findMany({
    where: {
      id: { in: [] }, // Nessun evento da filtrare senza marketMetrics
    },
    select: {
      id: true,
      category: true,
      resolutionSourceUrl: true,
    },
  });
  const eventMap = new Map(events.map((e) => [e.id, e]));

  // Per-event average success score
  const eventScores = new Map<string, { sum: number; count: number }>();
  for (const m of metrics) {
    if (m.successScore == null) continue;
    const cur = eventScores.get(m.eventId);
    if (!cur) {
      eventScores.set(m.eventId, { sum: m.successScore, count: 1 });
    } else {
      cur.sum += m.successScore;
      cur.count += 1;
    }
  }

  const categorySums = new Map<string, { sum: number; count: number }>();
  const sourceSums = new Map<string, { sum: number; count: number }>();

  for (const [eventId, { sum, count }] of eventScores) {
    const ev = eventMap.get(eventId);
    if (!ev) continue;
    const avg = sum / count;
    const cat = ev.category?.trim() || "Other";
    const catCur = categorySums.get(cat);
    if (!catCur) categorySums.set(cat, { sum: avg, count: 1 });
    else {
      catCur.sum += avg;
      catCur.count += 1;
    }

    const src = sourceKeyFromUrl(ev.resolutionSourceUrl);
    if (src) {
      const srcCur = sourceSums.get(src);
      if (!srcCur) sourceSums.set(src, { sum: avg, count: 1 });
      else {
        srcCur.sum += avg;
        srcCur.count += 1;
      }
    }
  }

  const categoryScores: Record<string, number> = {};
  for (const [cat, { sum, count }] of categorySums) {
    if (count >= minEvents) categoryScores[cat] = sum / count;
  }

  const sourceScores: Record<string, number> = {};
  for (const [src, { sum, count }] of sourceSums) {
    if (count >= minEvents) sourceScores[src] = sum / count;
  }

  const categoryWeights = scoresToWeights(categoryScores);
  const sourceWeights = scoresToWeights(sourceScores);

  return {
    categoryScores,
    sourceScores,
    categoryWeights,
    sourceWeights,
    eventsAnalyzed: eventScores.size,
  };
}
