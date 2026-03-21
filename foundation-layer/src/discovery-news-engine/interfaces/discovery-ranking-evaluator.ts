import type { DiscoveryStoryCluster } from "../entities/discovery-story-cluster.entity.js";
import type { DiscoveryStoryClusterSummary } from "../entities/discovery-story-cluster-summary.entity.js";
import type { DiscoveryTrendSnapshot } from "../entities/discovery-trend-snapshot.entity.js";
import type { NormalizedDiscoveryItem } from "../entities/normalized-discovery-item.entity.js";
import type { DiscoverySignal } from "../entities/discovery-signal.entity.js";
import type { DiscoveryRankingEntry } from "../entities/discovery-ranking-entry.entity.js";
import type { DiscoverySourceUsageRole } from "../enums/discovery-source-usage-role.enum.js";

/**
 * Input for the ranking engine: clusters, their summaries, and trend snapshots.
 * Optional items/signals and Italian/role resolution for factor computation.
 */
export type DiscoveryRankingContext = Readonly<{
  /** Clusters to rank. */
  clusters: readonly DiscoveryStoryCluster[];
  /** Summary per cluster (keyed by clusterId). */
  summariesByClusterId: ReadonlyMap<string, DiscoveryStoryClusterSummary>;
  /** Trend snapshots per cluster (keyed by clusterId). */
  snapshotsByClusterId: ReadonlyMap<string, readonly DiscoveryTrendSnapshot[]>;
  /** Optional: resolve item by id for Italian/source diversity. */
  itemsById?: ReadonlyMap<string, NormalizedDiscoveryItem>;
  /** Optional: resolve signal by id for Italian/source diversity. */
  signalsById?: ReadonlyMap<string, DiscoverySignal>;
  /** Optional: true if source key is Italian (e.g. from registry getByGeoScope(IT)). */
  isItalianSourceKey?: (sourceKey: string) => boolean;
  /** Optional: resolve source role by key for items (items do not carry role). */
  getSourceRoleNullable?: (sourceKey: string) => DiscoverySourceUsageRole | null;
}>;

export type DiscoveryRankingResult = Readonly<{
  entries: readonly DiscoveryRankingEntry[];
}>;

/**
 * Deterministic, explainable ranking of discovery clusters.
 * Consumes trend snapshots and summaries; does not create EventLead or SourceObservation.
 */
export interface DiscoveryRankingEvaluator {
  rank(context: DiscoveryRankingContext): DiscoveryRankingResult;
}
