import type { DiscoveryStoryCluster } from "../entities/discovery-story-cluster.entity.js";
import type { DiscoveryStoryClusterSummary } from "../entities/discovery-story-cluster-summary.entity.js";
import type { NormalizedDiscoveryItem } from "../entities/normalized-discovery-item.entity.js";
import type { DiscoverySignal } from "../entities/discovery-signal.entity.js";
import type { DiscoveryTrendSnapshot } from "../entities/discovery-trend-snapshot.entity.js";
import type { DiscoveryTrendHorizon } from "../enums/discovery-trend-horizon.enum.js";
import type { DiscoverySourceUsageRole } from "../enums/discovery-source-usage-role.enum.js";
import type { DiscoveryTrendHorizonWindow } from "../trend/discovery-trend-horizon-config.js";
export type DiscoveryTrendEvaluationContext = Readonly<{
    cluster: DiscoveryStoryCluster;
    summary: DiscoveryStoryClusterSummary;
    itemsById: Map<string, NormalizedDiscoveryItem>;
    signalsById: Map<string, DiscoverySignal>;
    now: Date;
    /** Horizons to evaluate; default all if not set. */
    horizonsNullable?: readonly DiscoveryTrendHorizon[] | null;
    /** Optional: resolve source role for items by source key. */
    getSourceRoleNullable?: (sourceKey: string) => DiscoverySourceUsageRole | null;
    /** Optional: override default window per horizon. */
    windowOverrideNullable?: ((horizon: DiscoveryTrendHorizon) => DiscoveryTrendHorizonWindow) | null;
}>;
export type DiscoveryTrendEvaluateResult = Readonly<{
    snapshots: readonly DiscoveryTrendSnapshot[];
}>;
export interface DiscoveryTrendEvaluator {
    /**
     * Evaluate a cluster over one or more horizons and produce trend snapshots.
     * Deterministic, no ranking, no persistence.
     */
    evaluateCluster(context: DiscoveryTrendEvaluationContext): DiscoveryTrendEvaluateResult;
}
//# sourceMappingURL=discovery-trend-evaluator.d.ts.map