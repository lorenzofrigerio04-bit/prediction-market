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
export declare const createDiscoveryTrendEvaluationDecision: (input: DiscoveryTrendEvaluationDecision) => DiscoveryTrendEvaluationDecision;
//# sourceMappingURL=discovery-trend-evaluation-decision.entity.d.ts.map