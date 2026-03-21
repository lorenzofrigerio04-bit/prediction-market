/**
 * Trend Detector - Aggregate signals, compute trend_score, rank trends
 */

import type {
  RawSignal,
  AggregatedSignal,
  TrendObject,
  SourceSignal,
  GetTrendsParams,
} from './types';
import { computeTrendScore, computeTimeSensitivity } from './scoring';
import { fetchAllSignals } from './signal-providers/interface';

/** Normalize topic for grouping (lowercase, trim, collapse whitespace) */
function normalizeTopic(topic: string): string {
  return topic
    .toLowerCase()
    .trim()
    .replace(/\s+/g, ' ')
    .slice(0, 200);
}

/**
 * Group signals by normalized topic.
 * Topics that are very similar could be merged later (e.g. via embedding).
 */
export function aggregateSignals(signals: RawSignal[]): Map<string, AggregatedSignal> {
  const map = new Map<string, AggregatedSignal>();

  for (const s of signals) {
    const key = normalizeTopic(s.topic);
    if (!key) continue;

    const existing = map.get(key);
    const providerIds = new Set(
      (existing?.signals ?? []).map((x) => x.providerId)
    );
    providerIds.add(s.providerId);

    const firstSeen = existing
      ? (existing.firstSeen < s.publishedAt ? existing.firstSeen : s.publishedAt)
      : s.publishedAt;
    const lastSeen = existing
      ? (existing.lastSeen > s.publishedAt ? existing.lastSeen : s.publishedAt)
      : s.publishedAt;

    const allEntities = [
      ...(existing?.entities ?? []),
      ...(s.entities ?? []),
    ];
    const uniqueEntities = [...new Set(allEntities)].slice(0, 10);
    const category = existing?.category ?? s.category ?? 'Altro';

    map.set(key, {
      topic: existing?.topic ?? s.topic,
      category,
      entities: uniqueEntities,
      signals: [...(existing?.signals ?? []), s],
      firstSeen,
      lastSeen,
      providerCount: providerIds.size,
    });
  }

  return map;
}

export function rankTrends(trends: TrendObject[]): TrendObject[] {
  return [...trends].sort((a, b) => b.trend_score - a.trend_score);
}

function aggregatedToTrendObject(
  aggregated: AggregatedSignal,
  now: Date
): TrendObject {
  const trend_score = computeTrendScore(aggregated, now);
  const time_sensitivity = computeTimeSensitivity(aggregated, now);

  const source_signals: SourceSignal[] = aggregated.signals.map((s) => ({
    providerId: s.providerId,
    signalId: s.sourceId,
    timestamp: s.publishedAt,
    rawData: s.rawData,
  }));

  return {
    topic: aggregated.topic,
    category: aggregated.category,
    entities: aggregated.entities,
    trend_score,
    time_sensitivity,
    source_signals,
    timestamp: now,
  };
}

export interface GetTrendsResult {
  trends: TrendObject[];
}

export async function getTrendsFromSignals(
  signals: RawSignal[],
  options?: { limit?: number; now?: Date }
): Promise<GetTrendsResult> {
  const now = options?.now ?? new Date();
  const limit = options?.limit ?? 50;

  const aggregatedMap = aggregateSignals(signals);
  const trends: TrendObject[] = [];

  for (const agg of aggregatedMap.values()) {
    if (agg.signals.length < 1) continue;
    trends.push(aggregatedToTrendObject(agg, now));
  }

  const ranked = rankTrends(trends);
  return { trends: ranked.slice(0, limit) };
}
