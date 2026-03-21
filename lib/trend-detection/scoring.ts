/**
 * Trend scoring algorithm
 * trend_score: 0–1 from recency, frequency, cross-source, entity importance
 * time_sensitivity: low | medium | high
 */

import type { AggregatedSignal, TimeSensitivity } from './types';

const RECENCY_FULL_HOURS = 6;
const RECENCY_DECAY_HOURS = 72;
const FREQUENCY_CAP = 10;

/** Known important entities (official sources, major orgs) - placeholder */
const KNOWN_IMPORTANT_ENTITIES = new Set([
  'governo', 'parlamento', 'uefa', 'fifa', 'consob', 'sec', 'bce', 'nasa',
  'apple', 'google', 'meta', 'microsoft', 'amazon', 'tesla',
]);

export function recencyScore(lastSeen: Date, now: Date = new Date()): number {
  const h = (now.getTime() - lastSeen.getTime()) / (1000 * 60 * 60);
  if (h <= RECENCY_FULL_HOURS) return 1;
  if (h >= RECENCY_DECAY_HOURS) return 0;
  return 1 - (h - RECENCY_FULL_HOURS) / (RECENCY_DECAY_HOURS - RECENCY_FULL_HOURS);
}

export function frequencyScore(count: number): number {
  if (count <= 1) return 0;
  return Math.min(1, count / FREQUENCY_CAP);
}

export function crossSourceScore(providerCount: number): number {
  if (providerCount >= 3) return 1;
  if (providerCount === 1) return 0.3;
  return 0.3 + 0.35 * (providerCount - 1);
}

export function entityImportanceScore(entities: string[]): number {
  const hasImportant = entities.some((e) =>
    KNOWN_IMPORTANT_ENTITIES.has(e.toLowerCase().trim())
  );
  if (hasImportant) return 1;
  if (entities.length >= 2) return 0.7;
  if (entities.length === 1) return 0.5;
  return 0.3;
}

const RECENCY_WEIGHT = 0.3;
const FREQUENCY_WEIGHT = 0.3;
const CROSS_SOURCE_WEIGHT = 0.25;
const ENTITY_WEIGHT = 0.15;

export function computeTrendScore(
  aggregated: AggregatedSignal,
  now: Date = new Date()
): number {
  const recency = recencyScore(aggregated.lastSeen, now);
  const frequency = frequencyScore(aggregated.signals.length);
  const crossSrc = crossSourceScore(aggregated.providerCount);
  const entity = entityImportanceScore(aggregated.entities);

  return (
    RECENCY_WEIGHT * recency +
    FREQUENCY_WEIGHT * frequency +
    CROSS_SOURCE_WEIGHT * crossSrc +
    ENTITY_WEIGHT * entity
  );
}

export function computeTimeSensitivity(
  aggregated: AggregatedSignal,
  now: Date = new Date()
): TimeSensitivity {
  const recency = recencyScore(aggregated.lastSeen, now);
  const frequency = frequencyScore(aggregated.signals.length);

  if (recency >= 0.8 && frequency >= 0.6) return 'high';
  if (recency >= 0.5 || frequency >= 0.4) return 'medium';
  return 'low';
}
