import type { NormalizedDiscoveryItem } from "../entities/normalized-discovery-item.entity.js";
import type { DiscoverySignal } from "../entities/discovery-signal.entity.js";
import type { DiscoveryStoryCluster } from "../entities/discovery-story-cluster.entity.js";
import type { DiscoveryStoryMembershipDecision } from "../entities/discovery-story-membership-decision.entity.js";

export type DiscoveryStoryClusterContext = Readonly<{
  existingClusters?: readonly DiscoveryStoryCluster[];
  getItemForNormalizedId?: (id: string) => NormalizedDiscoveryItem | null;
}>;

export type DiscoveryStoryClusterAssignInput = Readonly<{
  items?: readonly NormalizedDiscoveryItem[];
  signals?: readonly DiscoverySignal[];
}>;

export type DiscoveryStoryClusterAssignResult = Readonly<{
  clusters: readonly DiscoveryStoryCluster[];
  decisions: readonly DiscoveryStoryMembershipDecision[];
}>;

export interface DiscoveryStoryClusterEvaluator {
  /**
   * Assign items and/or signals to story clusters using deterministic rules.
   * Returns updated clusters (existing + new) and one membership decision per input item/signal.
   */
  assignToClusters(
    input: DiscoveryStoryClusterAssignInput,
    context: DiscoveryStoryClusterContext,
  ): DiscoveryStoryClusterAssignResult;
}
