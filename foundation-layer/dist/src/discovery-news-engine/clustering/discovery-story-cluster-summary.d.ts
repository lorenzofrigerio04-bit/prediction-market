/**
 * Build minimal cluster summary from a cluster and resolved items/signals.
 */
import type { DiscoveryStoryCluster } from "../entities/discovery-story-cluster.entity.js";
import type { DiscoveryStoryClusterSummary } from "../entities/discovery-story-cluster-summary.entity.js";
import type { NormalizedDiscoveryItem } from "../entities/normalized-discovery-item.entity.js";
import type { DiscoverySignal } from "../entities/discovery-signal.entity.js";
/**
 * Build a minimal summary for a story cluster.
 * itemsById: map from normalized item id to item (for memberItemIds).
 * signalsById: optional map from signal id to signal (for memberSignalIds).
 */
export declare function buildDiscoveryStoryClusterSummary(cluster: DiscoveryStoryCluster, itemsById: Map<string, NormalizedDiscoveryItem>, signalsById?: Map<string, DiscoverySignal>): DiscoveryStoryClusterSummary;
//# sourceMappingURL=discovery-story-cluster-summary.d.ts.map