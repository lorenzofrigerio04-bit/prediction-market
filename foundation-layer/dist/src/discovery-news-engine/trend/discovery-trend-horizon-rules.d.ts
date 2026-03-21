/**
 * Horizon-specific conservative rules: predicate + explanation.
 * No hype score; deterministic and explainable.
 */
import { DiscoveryTrendHorizon } from "../enums/discovery-trend-horizon.enum.js";
import { DiscoveryTrendStatus } from "../enums/discovery-trend-status.enum.js";
import type { DiscoveryTrendIndicatorSet } from "../entities/discovery-trend-indicator-set.entity.js";
export type DiscoveryTrendRuleResult = Readonly<{
    status: DiscoveryTrendStatus;
    explanation: string;
    ruleId: string;
}>;
export declare function evaluateFastPulseRule(indicators: DiscoveryTrendIndicatorSet): DiscoveryTrendRuleResult;
export declare function evaluateShortCycleRule(indicators: DiscoveryTrendIndicatorSet): DiscoveryTrendRuleResult;
export declare function evaluateMediumCycleRule(indicators: DiscoveryTrendIndicatorSet): DiscoveryTrendRuleResult;
export declare function evaluateScheduledMonitorRule(indicators: DiscoveryTrendIndicatorSet): DiscoveryTrendRuleResult;
export declare function evaluateHorizonRule(horizon: DiscoveryTrendHorizon, indicators: DiscoveryTrendIndicatorSet): DiscoveryTrendRuleResult;
//# sourceMappingURL=discovery-trend-horizon-rules.d.ts.map