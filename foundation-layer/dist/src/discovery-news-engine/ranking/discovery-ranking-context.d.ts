/**
 * Helpers for building or using ranking context.
 * Context type is defined in interfaces/discovery-ranking-evaluator.ts.
 */
import type { DiscoveryTrendSnapshot } from "../entities/discovery-trend-snapshot.entity.js";
/**
 * Group trend snapshots by cluster id for use in DiscoveryRankingContext.
 */
export declare function groupSnapshotsByClusterId(snapshots: readonly DiscoveryTrendSnapshot[]): Map<string, readonly DiscoveryTrendSnapshot[]>;
//# sourceMappingURL=discovery-ranking-context.d.ts.map