import { deepFreeze } from "../../common/utils/deep-freeze.js";

export type DiscoveryRankingReasonImpact =
  | "positive"
  | "negative"
  | "neutral";

export type DiscoveryRankingReason = Readonly<{
  code: string;
  label: string;
  impact: DiscoveryRankingReasonImpact;
}>;

export const createDiscoveryRankingReason = (
  input: DiscoveryRankingReason,
): DiscoveryRankingReason => deepFreeze({ ...input });
