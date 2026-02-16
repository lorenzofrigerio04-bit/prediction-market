/**
 * Feed reranking: diversity (max N per category in top K) and freshness (boost last 24h).
 */

const TOP_SLOTS = 10;
const MAX_PER_CATEGORY_IN_TOP = 2;
const FRESHNESS_MS = 24 * 60 * 60 * 1000;

export interface RerankableItem {
  eventId: string;
  category: string;
  createdAt: Date;
  [key: string]: unknown;
}

/**
 * Rerank feed items for diversity and freshness.
 * - Diversity: in the first TOP_SLOTS (10), at most MAX_PER_CATEGORY_IN_TOP (2) items per category.
 * - Freshness: items created in the last 24 hours are prioritized (considered first when filling slots).
 *
 * @param items - Ordered list of items (e.g. from candidate generation)
 * @param now - Reference time for "last 24h" (default: Date.now())
 * @returns Reordered list (same length)
 */
export function rerankFeed<T extends RerankableItem>(
  items: T[],
  now: number = Date.now()
): T[] {
  if (items.length === 0) return [];

  const cutoff = now - FRESHNESS_MS;
  const recent: T[] = [];
  const older: T[] = [];
  for (const item of items) {
    const t = item.createdAt instanceof Date ? item.createdAt.getTime() : new Date(item.createdAt).getTime();
    if (t >= cutoff) recent.push(item);
    else older.push(item);
  }

  // Prefer recent when filling slots
  const ordered = [...recent, ...older];
  const categoryCountInTop = new Map<string, number>();
  const top: T[] = [];
  const deferred: T[] = [];

  for (const item of ordered) {
    const count = categoryCountInTop.get(item.category) ?? 0;
    if (top.length < TOP_SLOTS && count < MAX_PER_CATEGORY_IN_TOP) {
      top.push(item);
      categoryCountInTop.set(item.category, count + 1);
    } else {
      deferred.push(item);
    }
  }

  return [...top, ...deferred];
}
