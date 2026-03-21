import type { DiscoveryTrendSnapshotId } from "../value-objects/discovery-trend-snapshot-id.vo.js";
import type { DiscoveryStoryClusterId } from "../value-objects/discovery-story-cluster-id.vo.js";
import type { DiscoveryTrendHorizon } from "../enums/discovery-trend-horizon.enum.js";
import type { DiscoveryTrendStatus } from "../enums/discovery-trend-status.enum.js";
import type { DiscoveryTrendIndicatorSet } from "./discovery-trend-indicator-set.entity.js";
/** Minimal trend snapshot: id, cluster, horizon, status, indicators, explanation. */
export type DiscoveryTrendSnapshot = Readonly<{
    snapshotId: DiscoveryTrendSnapshotId;
    clusterId: DiscoveryStoryClusterId;
    horizon: DiscoveryTrendHorizon;
    trendStatus: DiscoveryTrendStatus;
    indicatorSet: DiscoveryTrendIndicatorSet;
    explanation: string;
}>;
export declare const createDiscoveryTrendSnapshot: (input: DiscoveryTrendSnapshot) => DiscoveryTrendSnapshot;
//# sourceMappingURL=discovery-trend-snapshot.entity.d.ts.map