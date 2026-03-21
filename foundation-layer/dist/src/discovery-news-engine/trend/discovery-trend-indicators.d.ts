/**
 * Pure functions: compute trend indicators from cluster, summary, items, signals, and horizon window.
 */
import type { DiscoveryStoryCluster } from "../entities/discovery-story-cluster.entity.js";
import type { DiscoveryStoryClusterSummary } from "../entities/discovery-story-cluster-summary.entity.js";
import type { NormalizedDiscoveryItem } from "../entities/normalized-discovery-item.entity.js";
import type { DiscoverySignal } from "../entities/discovery-signal.entity.js";
import type { DiscoveryTrendIndicatorSet } from "../entities/discovery-trend-indicator-set.entity.js";
import { DiscoverySourceUsageRole } from "../enums/discovery-source-usage-role.enum.js";
export type DiscoveryTrendIndicatorInput = Readonly<{
    cluster: DiscoveryStoryCluster;
    summary: DiscoveryStoryClusterSummary;
    itemsById: Map<string, NormalizedDiscoveryItem>;
    signalsById: Map<string, DiscoverySignal>;
    windowStartMs: number;
    windowEndMs: number;
    /** Optional: resolve source role for items (items do not carry role on entity). */
    getSourceRoleNullable?: (sourceKey: string) => DiscoverySourceUsageRole | null;
}>;
/**
 * Compute deterministic indicator set for a cluster over the given time window.
 */
export declare function computeDiscoveryTrendIndicators(input: DiscoveryTrendIndicatorInput): DiscoveryTrendIndicatorSet;
//# sourceMappingURL=discovery-trend-indicators.d.ts.map