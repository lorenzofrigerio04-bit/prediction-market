import { deepFreeze } from "../../common/utils/deep-freeze.js";
import type { DiscoveryTrendHorizon } from "../enums/discovery-trend-horizon.enum.js";
import type { DiscoveryTrendStatus } from "../enums/discovery-trend-status.enum.js";
import type { DiscoveryTrendIndicatorSet } from "./discovery-trend-indicator-set.entity.js";

/** Result of evaluating one cluster for one horizon: status, indicators, explanation. */
export type DiscoveryTrendEvaluationDecision = Readonly<{
  horizon: DiscoveryTrendHorizon;
  status: DiscoveryTrendStatus;
  indicatorSet: DiscoveryTrendIndicatorSet;
  explanation: string;
  ruleIdNullable: string | null;
}>;

export const createDiscoveryTrendEvaluationDecision = (
  input: DiscoveryTrendEvaluationDecision,
): DiscoveryTrendEvaluationDecision =>
  deepFreeze({
    ...input,
    ruleIdNullable: input.ruleIdNullable ?? null,
  });
