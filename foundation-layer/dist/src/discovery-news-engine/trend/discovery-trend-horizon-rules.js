/**
 * Horizon-specific conservative rules: predicate + explanation.
 * No hype score; deterministic and explainable.
 */
import { DiscoveryTrendHorizon } from "../enums/discovery-trend-horizon.enum.js";
import { DiscoveryTrendStatus } from "../enums/discovery-trend-status.enum.js";
const MIN_SIGNALS_FAST_PULSE = 2;
const MIN_SIGNALS_SHORT_CYCLE = 2;
const MIN_SIGNALS_MEDIUM_CYCLE = 2;
const MIN_SIGNALS_SCHEDULED = 1;
const MAX_TIME_SPAN_FAST_PULSE_HOURS = 18;
const MIN_SOURCE_DIVERSITY_SHORT = 1;
const MIN_ACTIVITY_DENSITY = 0.5; // signals per day
export function evaluateFastPulseRule(indicators) {
    if (indicators.signalCountInHorizon < MIN_SIGNALS_FAST_PULSE) {
        return {
            status: DiscoveryTrendStatus.INSUFFICIENT_EVIDENCE,
            explanation: `fast_pulse: insufficient signals (${indicators.signalCountInHorizon} < ${MIN_SIGNALS_FAST_PULSE})`,
            ruleId: "fast_pulse_burst",
        };
    }
    if (indicators.timeSpanHours > MAX_TIME_SPAN_FAST_PULSE_HOURS) {
        return {
            status: DiscoveryTrendStatus.NOT_TRENDING,
            explanation: `fast_pulse: time span too wide (${indicators.timeSpanHours.toFixed(1)}h > ${MAX_TIME_SPAN_FAST_PULSE_HOURS}h)`,
            ruleId: "fast_pulse_burst",
        };
    }
    const hasAttentionOrEditorial = indicators.hasEditorialSource || indicators.hasAttentionSource;
    if (!hasAttentionOrEditorial) {
        return {
            status: DiscoveryTrendStatus.NOT_TRENDING,
            explanation: "fast_pulse: no editorial or attention source presence",
            ruleId: "fast_pulse_burst",
        };
    }
    return {
        status: DiscoveryTrendStatus.TRENDING,
        explanation: `fast_pulse: recent burst, narrow span (${indicators.timeSpanHours.toFixed(1)}h), editorial/attention present`,
        ruleId: "fast_pulse_burst",
    };
}
export function evaluateShortCycleRule(indicators) {
    if (indicators.signalCountInHorizon < MIN_SIGNALS_SHORT_CYCLE) {
        return {
            status: DiscoveryTrendStatus.INSUFFICIENT_EVIDENCE,
            explanation: `short_cycle: insufficient signals (${indicators.signalCountInHorizon} < ${MIN_SIGNALS_SHORT_CYCLE})`,
            ruleId: "short_cycle_growth",
        };
    }
    if (indicators.sourceDiversityCount < MIN_SOURCE_DIVERSITY_SHORT) {
        return {
            status: DiscoveryTrendStatus.NOT_TRENDING,
            explanation: `short_cycle: no source diversity (${indicators.sourceDiversityCount})`,
            ruleId: "short_cycle_growth",
        };
    }
    if (indicators.recentActivityDensity < MIN_ACTIVITY_DENSITY) {
        return {
            status: DiscoveryTrendStatus.NOT_TRENDING,
            explanation: `short_cycle: low activity density (${indicators.recentActivityDensity.toFixed(2)}/day)`,
            ruleId: "short_cycle_growth",
        };
    }
    return {
        status: DiscoveryTrendStatus.TRENDING,
        explanation: `short_cycle: growth over window, ${indicators.sourceDiversityCount} sources, density ${indicators.recentActivityDensity.toFixed(2)}/day`,
        ruleId: "short_cycle_growth",
    };
}
const MIN_TIME_SPAN_MEDIUM_HOURS = 24 * 2; // at least 2 days of span
export function evaluateMediumCycleRule(indicators) {
    if (indicators.signalCountInHorizon < MIN_SIGNALS_MEDIUM_CYCLE) {
        return {
            status: DiscoveryTrendStatus.INSUFFICIENT_EVIDENCE,
            explanation: `medium_cycle: insufficient signals (${indicators.signalCountInHorizon} < ${MIN_SIGNALS_MEDIUM_CYCLE})`,
            ruleId: "medium_cycle_persistence",
        };
    }
    if (indicators.timeSpanHours < MIN_TIME_SPAN_MEDIUM_HOURS) {
        return {
            status: DiscoveryTrendStatus.NOT_TRENDING,
            explanation: `medium_cycle: time span too narrow (${indicators.timeSpanHours.toFixed(1)}h < ${MIN_TIME_SPAN_MEDIUM_HOURS}h)`,
            ruleId: "medium_cycle_persistence",
        };
    }
    return {
        status: DiscoveryTrendStatus.TRENDING,
        explanation: `medium_cycle: persistence over ${(indicators.timeSpanHours / 24).toFixed(1)} days, ${indicators.signalCountInHorizon} signals`,
        ruleId: "medium_cycle_persistence",
    };
}
export function evaluateScheduledMonitorRule(indicators) {
    if (indicators.signalCountInHorizon < MIN_SIGNALS_SCHEDULED) {
        return {
            status: DiscoveryTrendStatus.INSUFFICIENT_EVIDENCE,
            explanation: `scheduled_monitor: no signals in horizon (${indicators.signalCountInHorizon})`,
            ruleId: "scheduled_monitor_authoritative",
        };
    }
    if (!indicators.scheduledSourceRelevance && !indicators.hasAuthoritativeSource) {
        return {
            status: DiscoveryTrendStatus.NOT_TRENDING,
            explanation: "scheduled_monitor: no authoritative/scheduled source",
            ruleId: "scheduled_monitor_authoritative",
        };
    }
    return {
        status: DiscoveryTrendStatus.TRENDING,
        explanation: `scheduled_monitor: authoritative/scheduled source present, ${indicators.signalCountInHorizon} signals`,
        ruleId: "scheduled_monitor_authoritative",
    };
}
const RULE_EVALUATORS = {
    [DiscoveryTrendHorizon.FAST_PULSE]: evaluateFastPulseRule,
    [DiscoveryTrendHorizon.SHORT_CYCLE]: evaluateShortCycleRule,
    [DiscoveryTrendHorizon.MEDIUM_CYCLE]: evaluateMediumCycleRule,
    [DiscoveryTrendHorizon.SCHEDULED_MONITOR]: evaluateScheduledMonitorRule,
};
export function evaluateHorizonRule(horizon, indicators) {
    return RULE_EVALUATORS[horizon](indicators);
}
//# sourceMappingURL=discovery-trend-horizon-rules.js.map