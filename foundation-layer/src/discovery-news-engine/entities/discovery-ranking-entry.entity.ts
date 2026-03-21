import { deepFreeze } from "../../common/utils/deep-freeze.js";
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

export const createDiscoveryRankingEntry = (
  input: DiscoveryRankingEntry,
): DiscoveryRankingEntry => {
  const { cautionFlags, orderingBasis, ...rest } = input;
  return deepFreeze({
    ...rest,
    reasons: [...input.reasons],
    ...(cautionFlags != null && cautionFlags.length > 0
      ? { cautionFlags: [...cautionFlags] }
      : {}),
    ...(orderingBasis != null && orderingBasis.length > 0
      ? { orderingBasis: [...orderingBasis] }
      : {}),
  });
};
