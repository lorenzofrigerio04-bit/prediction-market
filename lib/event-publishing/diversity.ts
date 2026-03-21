/**
 * Diversity Engine - Category and duration mix for selection
 *
 * Target distribution:
 * - Category: sports 25%, crypto 20%, politics 15%, tech 15%, economy 15%, culture 10%
 * - Duration: SHORT 50%, MEDIUM 30%, LONG 20%
 */

/** Target bucket for category mix */
export type TargetCategory =
  | 'sports'
  | 'crypto'
  | 'politics'
  | 'tech'
  | 'economy'
  | 'culture'
  | 'other';

/** Duration bucket from closesAt */
export type DurationBucket = 'SHORT' | 'MEDIUM' | 'LONG';

/** Target % per category (of 12 active markets) */
export const CATEGORY_TARGET_PCT: Record<TargetCategory, number> = {
  sports: 0.25,
  crypto: 0.2,
  politics: 0.15,
  tech: 0.15,
  economy: 0.15,
  culture: 0.1,
  other: 0,
};

/** Target % per duration bucket */
export const DURATION_TARGET_PCT: Record<DurationBucket, number> = {
  SHORT: 0.5,
  MEDIUM: 0.3,
  LONG: 0.2,
};

/** Map platform category to target bucket */
const PLATFORM_TO_TARGET: Record<string, TargetCategory> = {
  Calcio: 'sports',
  Tennis: 'sports',
  Pallacanestro: 'sports',
  Pallavolo: 'sports',
  'Formula 1': 'sports',
  MotoGP: 'sports',
  Sport: 'sports',
  Sports: 'sports',
  Crypto: 'crypto',
  Politica: 'politics',
  Politics: 'politics',
  Tecnologia: 'tech',
  Tech: 'tech',
  Economia: 'economy',
  Economy: 'economy',
  Cultura: 'culture',
  Culture: 'culture',
  Intrattenimento: 'other',
  Scienza: 'other',
  Altro: 'other',
};

/**
 * Map platform category string to target bucket
 */
export function getTargetCategory(platformCategory: string): TargetCategory {
  const normalized = platformCategory.trim();
  return PLATFORM_TO_TARGET[normalized] ?? 'other';
}

/**
 * Get duration bucket from closesAt relative to now
 */
export function getDurationBucket(closesAt: Date, now: Date): DurationBucket {
  const days = (closesAt.getTime() - now.getTime()) / (24 * 60 * 60 * 1000);
  if (days <= 7) return 'SHORT';
  if (days <= 28) return 'MEDIUM';
  return 'LONG';
}

/** Counts of events by target category in current active set */
export type CategoryCounts = Map<TargetCategory, number>;

/** Counts of events by duration bucket in current active set */
export type DurationCounts = Map<DurationBucket, number>;

/**
 * Compute category deficit for a candidate (0..1)
 * Higher when the candidate's category is under-represented
 */
export function getCategoryDeficit(
  targetCategory: TargetCategory,
  currentCounts: CategoryCounts,
  totalActive: number
): number {
  if (totalActive === 0) return CATEGORY_TARGET_PCT[targetCategory];
  const targetPct = CATEGORY_TARGET_PCT[targetCategory];
  const currentPct = (currentCounts.get(targetCategory) ?? 0) / totalActive;
  return Math.max(0, targetPct - currentPct);
}

/**
 * Compute duration deficit for a candidate (0..1)
 * Higher when the candidate's duration bucket is under-represented
 */
export function getDurationDeficit(
  bucket: DurationBucket,
  currentCounts: DurationCounts,
  totalActive: number
): number {
  if (totalActive === 0) return DURATION_TARGET_PCT[bucket];
  const targetPct = DURATION_TARGET_PCT[bucket];
  const currentPct = (currentCounts.get(bucket) ?? 0) / totalActive;
  return Math.max(0, targetPct - currentPct);
}

/**
 * Compute diversity bonus for a candidate (0..1)
 * Higher when both category and duration are under-represented
 */
export function computeDiversityBonus(
  targetCategory: TargetCategory,
  bucket: DurationBucket,
  categoryCounts: CategoryCounts,
  durationCounts: DurationCounts,
  totalActive: number
): number {
  const catDeficit = getCategoryDeficit(targetCategory, categoryCounts, totalActive);
  const durDeficit = getDurationDeficit(bucket, durationCounts, totalActive);
  return 0.5 * catDeficit + 0.5 * durDeficit;
}

/**
 * Build category counts from a list of events (by platform category)
 */
export function buildCategoryCounts(
  items: Array<{ category: string }>
): CategoryCounts {
  const counts = new Map<TargetCategory, number>();
  for (const item of items) {
    const target = getTargetCategory(item.category);
    counts.set(target, (counts.get(target) ?? 0) + 1);
  }
  return counts;
}

/**
 * Build duration counts from a list of events
 */
export function buildDurationCounts(
  items: Array<{ closesAt: Date }>,
  now: Date
): DurationCounts {
  const counts = new Map<DurationBucket, number>();
  for (const item of items) {
    const bucket = getDurationBucket(item.closesAt, now);
    counts.set(bucket, (counts.get(bucket) ?? 0) + 1);
  }
  return counts;
}

/**
 * Get category cap per target bucket (for selection).
 * effectiveTarget: quando > 12 (es. modalità no-limit) i cap scalano così da non limitare il numero selezionato.
 * Con target 12: mix per categoria (25% sport, 20% crypto, ...; 'other' almeno 1).
 */
export function getCategoryCap(
  targetCategory: TargetCategory,
  effectiveTarget: number = 12
): number {
  if (effectiveTarget > 12) {
    return effectiveTarget;
  }
  const fromTarget = Math.ceil(12 * CATEGORY_TARGET_PCT[targetCategory]);
  return targetCategory === 'other' ? Math.max(1, fromTarget) : fromTarget;
}
