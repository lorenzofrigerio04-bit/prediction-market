import type { DiscoveryStoryClusterId } from "../value-objects/discovery-story-cluster-id.vo.js";
import type { DiscoveryPriorityClass } from "../enums/discovery-priority-class.enum.js";
import type { DiscoveryRankingScoreBreakdown } from "./discovery-ranking-score-breakdown.entity.js";
import type { DiscoveryRankingReason } from "./discovery-ranking-reason.entity.js";
export type DiscoveryRankingEntry = Readonly<{
    clusterId: DiscoveryStoryClusterId;
    priorityClass: DiscoveryPriorityClass;
    breakdown: DiscoveryRankingScoreBreakdown;
    reasons: readonly DiscoveryRankingReason[];
    cautionFlags?: readonly string[];
    /** Optional composite key for stable sort within priority class. */
    orderingBasis?: readonly (string | number)[];
}>;
export declare const createDiscoveryRankingEntry: (input: DiscoveryRankingEntry) => DiscoveryRankingEntry;
//# sourceMappingURL=discovery-ranking-entry.entity.d.ts.map