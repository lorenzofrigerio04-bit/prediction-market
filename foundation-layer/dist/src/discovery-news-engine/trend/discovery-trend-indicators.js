/**
 * Pure functions: compute trend indicators from cluster, summary, items, signals, and horizon window.
 */
import { createDiscoveryTrendIndicatorSet } from "../entities/discovery-trend-indicator-set.entity.js";
import { DiscoverySourceUsageRole } from "../enums/discovery-source-usage-role.enum.js";
import { DiscoverySignalFreshnessClass } from "../enums/discovery-signal-freshness-class.enum.js";
function getItemTimestampMs(item) {
    return Date.parse(item.publishedAt);
}
function getSignalTimestampMs(signal) {
    return Date.parse(signal.timeWindow.start);
}
function getSourceKeyFromItem(item) {
    return item.sourceReference.sourceKeyNullable != null
        ? String(item.sourceReference.sourceKeyNullable).trim()
        : String(item.sourceReference.sourceId).trim();
}
/**
 * Compute deterministic indicator set for a cluster over the given time window.
 */
export function computeDiscoveryTrendIndicators(input) {
    const { cluster, summary, itemsById, signalsById, windowStartMs, windowEndMs, getSourceRoleNullable, } = input;
    const itemIds = [...cluster.memberItemIds];
    const signalIds = [...cluster.memberSignalIds];
    const inWindowItems = [];
    const inWindowSignals = [];
    for (const id of itemIds) {
        const item = itemsById.get(id);
        if (!item)
            continue;
        const ms = getItemTimestampMs(item);
        if (ms >= windowStartMs && ms <= windowEndMs)
            inWindowItems.push(item);
    }
    for (const id of signalIds) {
        const sig = signalsById.get(id);
        if (!sig)
            continue;
        const ms = getSignalTimestampMs(sig);
        if (ms >= windowStartMs && ms <= windowEndMs)
            inWindowSignals.push(sig);
    }
    const signalCountInHorizon = inWindowItems.length + inWindowSignals.length;
    const sourceKeys = new Set();
    for (const item of inWindowItems) {
        sourceKeys.add(getSourceKeyFromItem(item));
    }
    for (const sig of inWindowSignals) {
        sourceKeys.add(String(sig.provenanceMetadata.sourceKey).trim());
    }
    const sourceDiversityCount = sourceKeys.size;
    let hasAuthoritativeSource = false;
    let hasEditorialSource = false;
    let hasAttentionSource = false;
    for (const item of inWindowItems) {
        const role = getSourceRoleNullable?.(getSourceKeyFromItem(item)) ?? null;
        if (role === DiscoverySourceUsageRole.AUTHORITATIVE)
            hasAuthoritativeSource = true;
        if (role === DiscoverySourceUsageRole.EDITORIAL)
            hasEditorialSource = true;
        if (role === DiscoverySourceUsageRole.ATTENTION)
            hasAttentionSource = true;
    }
    for (const sig of inWindowSignals) {
        const role = sig.provenanceMetadata.sourceRoleNullable ?? null;
        if (role === DiscoverySourceUsageRole.AUTHORITATIVE)
            hasAuthoritativeSource = true;
        if (role === DiscoverySourceUsageRole.EDITORIAL)
            hasEditorialSource = true;
        if (role === DiscoverySourceUsageRole.ATTENTION)
            hasAttentionSource = true;
    }
    const lookbackHours = (windowEndMs - windowStartMs) / (60 * 60 * 1000);
    const lookbackDays = Math.max(0.01, lookbackHours / 24);
    const recentActivityDensity = signalCountInHorizon / lookbackDays;
    const allTimestamps = [];
    for (const item of inWindowItems)
        allTimestamps.push(getItemTimestampMs(item));
    for (const sig of inWindowSignals)
        allTimestamps.push(getSignalTimestampMs(sig));
    const timeSpanHours = allTimestamps.length === 0
        ? 0
        : (Math.max(...allTimestamps) - Math.min(...allTimestamps)) / (60 * 60 * 1000);
    const freshnessClasses = inWindowSignals.map((s) => s.freshnessClass);
    let freshnessClassConsistency = "mixed";
    if (freshnessClasses.length > 0) {
        const uniq = new Set(freshnessClasses);
        if (uniq.size === 1) {
            const single = freshnessClasses[0];
            if (single === DiscoverySignalFreshnessClass.REALTIME)
                freshnessClassConsistency = "realtime";
            else if (single === DiscoverySignalFreshnessClass.RECENT)
                freshnessClassConsistency = "recent";
            else if (single === DiscoverySignalFreshnessClass.ARCHIVED)
                freshnessClassConsistency = "archived";
        }
    }
    const scheduledSourceRelevance = hasAuthoritativeSource;
    return createDiscoveryTrendIndicatorSet({
        signalCountInHorizon,
        sourceDiversityCount,
        hasAuthoritativeSource,
        hasEditorialSource,
        hasAttentionSource,
        recentActivityDensity,
        timeSpanHours,
        freshnessClassConsistency,
        scheduledSourceRelevance,
    });
}
//# sourceMappingURL=discovery-trend-indicators.js.map