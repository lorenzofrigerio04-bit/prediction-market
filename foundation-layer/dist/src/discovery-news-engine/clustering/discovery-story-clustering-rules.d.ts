/**
 * Conservative deterministic rules for story clustering v1.
 * Order: canonical URL → source identity → structured locator → title + temporal.
 * Geo/topic are supporting only (no join solely on geo/topic).
 */
import type { NormalizedDiscoveryItem } from "../entities/normalized-discovery-item.entity.js";
import type { DiscoveryStoryCluster } from "../entities/discovery-story-cluster.entity.js";
import type { DiscoveryStoryClusterId } from "../value-objects/discovery-story-cluster-id.vo.js";
import { DiscoveryStoryMembershipReason } from "../enums/discovery-story-membership-reason.enum.js";
import { DiscoveryDedupeEvidenceStrength } from "../enums/discovery-dedupe-evidence-strength.enum.js";
export type StoryClusterMatchResult = Readonly<{
    match: true;
    clusterId: DiscoveryStoryClusterId;
    reason: DiscoveryStoryMembershipReason;
    matchedMemberId: string;
    evidenceStrength: DiscoveryDedupeEvidenceStrength;
}>;
export type StoryClusterNoMatch = Readonly<{
    match: false;
}>;
export type StoryClusterRuleResult = StoryClusterMatchResult | StoryClusterNoMatch;
/**
 * Run rule set v1 in order. Returns first match or no match.
 * Candidate must be the normalized item (for signals, resolve via getItemForNormalizedId first).
 */
export declare function evaluateStoryClusterRules(candidate: NormalizedDiscoveryItem, candidateItemId: string, existingClusters: readonly DiscoveryStoryCluster[], getItemForNormalizedId: (id: string) => NormalizedDiscoveryItem | null): StoryClusterRuleResult;
//# sourceMappingURL=discovery-story-clustering-rules.d.ts.map