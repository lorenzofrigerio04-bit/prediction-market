import type { Timestamp } from "../../value-objects/timestamp.vo.js";
import type { DiscoveryStoryClusterId } from "../value-objects/discovery-story-cluster-id.vo.js";
import type { DiscoverySignalId } from "../value-objects/discovery-signal-id.vo.js";
import type { NormalizedExternalItemId } from "../value-objects/discovery-signal-evidence-ref.vo.js";
import { DiscoveryStoryClusterStatus } from "../enums/discovery-story-cluster-status.enum.js";
export type DiscoveryStoryCluster = Readonly<{
    clusterId: DiscoveryStoryClusterId;
    memberItemIds: readonly NormalizedExternalItemId[];
    memberSignalIds: readonly DiscoverySignalId[];
    status: DiscoveryStoryClusterStatus;
    createdAt: Timestamp;
}>;
export declare const createDiscoveryStoryCluster: (input: DiscoveryStoryCluster) => DiscoveryStoryCluster;
//# sourceMappingURL=discovery-story-cluster.entity.d.ts.map