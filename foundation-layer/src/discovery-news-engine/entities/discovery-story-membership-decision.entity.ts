import { deepFreeze } from "../../common/utils/deep-freeze.js";
import type { DiscoveryStoryClusterId } from "../value-objects/discovery-story-cluster-id.vo.js";
import { DiscoveryStoryMembershipReason } from "../enums/discovery-story-membership-reason.enum.js";
import type { DiscoveryDedupeEvidenceStrength } from "../enums/discovery-dedupe-evidence-strength.enum.js";

export type DiscoveryStoryMembershipDecision = Readonly<{
  clusterId: DiscoveryStoryClusterId;
  joinedExisting: boolean;
  reason: DiscoveryStoryMembershipReason;
  matchedMemberIdNullable: string | null;
  evidenceStrength: DiscoveryDedupeEvidenceStrength;
  createdNewCluster: boolean;
}>;

export const createDiscoveryStoryMembershipDecision = (
  input: DiscoveryStoryMembershipDecision,
): DiscoveryStoryMembershipDecision =>
  deepFreeze({
    ...input,
    matchedMemberIdNullable: input.matchedMemberIdNullable ?? null,
  });
