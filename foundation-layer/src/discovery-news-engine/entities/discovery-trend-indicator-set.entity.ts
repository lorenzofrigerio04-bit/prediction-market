import { deepFreeze } from "../../common/utils/deep-freeze.js";

/** Deterministic indicator values for trend evaluation (counts, booleans, time span). */
export type DiscoveryTrendIndicatorSet = Readonly<{
  signalCountInHorizon: number;
  sourceDiversityCount: number;
  hasAuthoritativeSource: boolean;
  hasEditorialSource: boolean;
  hasAttentionSource: boolean;
  recentActivityDensity: number;
  timeSpanHours: number;
  freshnessClassConsistency: "realtime" | "recent" | "archived" | "mixed";
  scheduledSourceRelevance: boolean;
}>;

export const createDiscoveryTrendIndicatorSet = (
  input: DiscoveryTrendIndicatorSet,
): DiscoveryTrendIndicatorSet => deepFreeze({ ...input });
