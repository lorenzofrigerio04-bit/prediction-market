/**
 * Helpers for building or using ranking context.
 * Context type is defined in interfaces/discovery-ranking-evaluator.ts.
 */

import type { DiscoveryTrendSnapshot } from "../entities/discovery-trend-snapshot.entity.js";

/**
 * Group trend snapshots by cluster id for use in DiscoveryRankingContext.
 */
export function groupSnapshotsByClusterId(
  snapshots: readonly DiscoveryTrendSnapshot[],
): Map<string, readonly DiscoveryTrendSnapshot[]> {
  const byCluster = new Map<string, DiscoveryTrendSnapshot[]>();
  for (const s of snapshots) {
    const id = String(s.clusterId);
    const list = byCluster.get(id) ?? [];
    list.push(s);
    byCluster.set(id, list);
  }
  return byCluster;
}
