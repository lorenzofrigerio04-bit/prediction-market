/**
 * Pure factor computation for discovery ranking.
 * Deterministic, no single opaque score; produces breakdown and reasons.
 */
import { createDiscoveryTrendIndicatorSet } from "../entities/discovery-trend-indicator-set.entity.js";
import { createDiscoveryRankingScoreBreakdown } from "../entities/discovery-ranking-score-breakdown.entity.js";
import { createDiscoveryRankingReason } from "../entities/discovery-ranking-reason.entity.js";
import { DiscoveryTrendStatus } from "../enums/discovery-trend-status.enum.js";
import { DiscoveryTrendHorizon } from "../enums/discovery-trend-horizon.enum.js";
import { DiscoveryGeoScope } from "../enums/discovery-geo-scope.enum.js";
import { DiscoverySourceUsageRole } from "../enums/discovery-source-usage-role.enum.js";
const SIGNAL_DENSITY_HIGH = 5;
const SIGNAL_DENSITY_MEDIUM = 2;
const SOURCE_DIVERSITY_HIGH = 3;
const SOURCE_DIVERSITY_MEDIUM = 2;
const CLUSTER_AGE_NEW_HOURS = 24;
/** Pick a representative indicator set from snapshots (prefer TRENDING, then by signal count). */
function getRepresentativeIndicatorSet(snapshots) {
    if (snapshots.length === 0)
        return null;
    const trending = snapshots.filter((s) => s.trendStatus === DiscoveryTrendStatus.TRENDING);
    const candidates = trending.length > 0 ? trending : snapshots;
    let best = candidates[0];
    for (const s of candidates) {
        if (s.indicatorSet.signalCountInHorizon > best.indicatorSet.signalCountInHorizon)
            best = s;
    }
    return best.indicatorSet;
}
function getSourceKeyFromItem(item) {
    return item.sourceReference.sourceKeyNullable != null
        ? String(item.sourceReference.sourceKeyNullable).trim()
        : String(item.sourceReference.sourceId).trim();
}
/** Compute share of items/signals from Italian sources (0..1). */
function computeItalianShare(cluster, itemsById, signalsById, isItalianSourceKey) {
    if (!isItalianSourceKey)
        return null;
    let italian = 0;
    let total = 0;
    for (const id of cluster.memberItemIds) {
        const item = itemsById?.get(id);
        if (!item)
            continue;
        total++;
        if (isItalianSourceKey(getSourceKeyFromItem(item)))
            italian++;
    }
    for (const id of cluster.memberSignalIds) {
        const sig = signalsById?.get(id);
        if (!sig)
            continue;
        total++;
        if (isItalianSourceKey(String(sig.provenanceMetadata.sourceKey)))
            italian++;
    }
    if (total === 0)
        return null;
    return italian / total;
}
/** Map share to factor level. */
function italianShareToLevel(share) {
    if (share >= 1)
        return "high";
    if (share >= 0.5)
        return "medium";
    if (share > 0)
        return "low";
    return "none";
}
export function computeRankingFactors(input) {
    const { cluster, summary, snapshots, now, itemsById, signalsById, isItalianSourceKey, getSourceRoleNullable, } = input;
    let indicators = getRepresentativeIndicatorSet(snapshots);
    if (indicators == null && (itemsById != null || signalsById != null)) {
        let hasAuthoritativeSource = false;
        let hasEditorialSource = false;
        let hasAttentionSource = false;
        let signalCountInHorizon = 0;
        const sourceKeys = new Set();
        for (const id of cluster.memberSignalIds) {
            const sig = signalsById?.get(id);
            if (!sig)
                continue;
            signalCountInHorizon++;
            sourceKeys.add(String(sig.provenanceMetadata.sourceKey));
            const role = sig.provenanceMetadata.sourceRoleNullable;
            if (role === DiscoverySourceUsageRole.AUTHORITATIVE)
                hasAuthoritativeSource = true;
            if (role === DiscoverySourceUsageRole.EDITORIAL)
                hasEditorialSource = true;
            if (role === DiscoverySourceUsageRole.ATTENTION)
                hasAttentionSource = true;
        }
        for (const id of cluster.memberItemIds) {
            const item = itemsById?.get(id);
            if (!item)
                continue;
            signalCountInHorizon++;
            sourceKeys.add(getSourceKeyFromItem(item));
            const role = getSourceRoleNullable?.(getSourceKeyFromItem(item));
            if (role === DiscoverySourceUsageRole.AUTHORITATIVE)
                hasAuthoritativeSource = true;
            if (role === DiscoverySourceUsageRole.EDITORIAL)
                hasEditorialSource = true;
            if (role === DiscoverySourceUsageRole.ATTENTION)
                hasAttentionSource = true;
        }
        indicators = createDiscoveryTrendIndicatorSet({
            signalCountInHorizon,
            sourceDiversityCount: sourceKeys.size,
            hasAuthoritativeSource,
            hasEditorialSource,
            hasAttentionSource,
            recentActivityDensity: signalCountInHorizon > 0 ? 1 : 0,
            timeSpanHours: 0,
            freshnessClassConsistency: "mixed",
            scheduledSourceRelevance: hasAuthoritativeSource,
        });
    }
    const reasons = [];
    const cautionFlags = [];
    // Novelty: cluster age
    const createdAtMs = Date.parse(cluster.createdAt);
    const ageHours = (now.getTime() - createdAtMs) / (60 * 60 * 1000);
    const novelty = ageHours <= CLUSTER_AGE_NEW_HOURS ? "new" : ageHours <= CLUSTER_AGE_NEW_HOURS * 7 ? "recurring" : "unknown";
    if (novelty === "new") {
        reasons.push(createDiscoveryRankingReason({
            code: "novelty_new",
            label: "Recent cluster (within 24h)",
            impact: "positive",
        }));
    }
    // Signal density
    const signalCount = indicators?.signalCountInHorizon ?? 0;
    const activityDensity = indicators?.recentActivityDensity ?? 0;
    const signalDensity = signalCount >= SIGNAL_DENSITY_HIGH || activityDensity >= 2
        ? "high"
        : signalCount >= SIGNAL_DENSITY_MEDIUM || activityDensity >= 0.5
            ? "medium"
            : "low";
    if (signalDensity === "high") {
        reasons.push(createDiscoveryRankingReason({
            code: "signal_density_high",
            label: "High signal count or activity density",
            impact: "positive",
        }));
    }
    else if (signalDensity === "low" && signalCount < SIGNAL_DENSITY_MEDIUM) {
        reasons.push(createDiscoveryRankingReason({
            code: "signal_density_low",
            label: "Low signal count",
            impact: "negative",
        }));
    }
    // Source diversity
    const divCount = indicators?.sourceDiversityCount ?? summary.sourceDiversityCount ?? 0;
    const sourceDiversity = divCount >= SOURCE_DIVERSITY_HIGH ? "high" : divCount >= SOURCE_DIVERSITY_MEDIUM ? "medium" : "low";
    if (sourceDiversity === "high") {
        reasons.push(createDiscoveryRankingReason({
            code: "source_diversity_high",
            label: "Multiple independent sources",
            impact: "positive",
        }));
    }
    else if (sourceDiversity === "low" && divCount < SOURCE_DIVERSITY_MEDIUM) {
        reasons.push(createDiscoveryRankingReason({
            code: "source_diversity_low",
            label: "Single or few sources",
            impact: "negative",
        }));
    }
    const authoritativeRelevance = indicators?.hasAuthoritativeSource ?? false;
    const editorialRelevance = indicators?.hasEditorialSource ?? false;
    const attentionRelevance = indicators?.hasAttentionSource ?? false;
    if (authoritativeRelevance) {
        reasons.push(createDiscoveryRankingReason({
            code: "authoritative_source",
            label: "Authoritative source present",
            impact: "positive",
        }));
    }
    if (editorialRelevance) {
        reasons.push(createDiscoveryRankingReason({
            code: "editorial_source",
            label: "Editorial source present",
            impact: "positive",
        }));
    }
    if (attentionRelevance) {
        reasons.push(createDiscoveryRankingReason({
            code: "attention_source",
            label: "Attention signal present",
            impact: "neutral",
        }));
    }
    // Caution: high attention but weak authoritative
    if (attentionRelevance && !authoritativeRelevance && !editorialRelevance) {
        cautionFlags.push("high_attention_low_authoritative");
        reasons.push(createDiscoveryRankingReason({
            code: "caution_attention_only",
            label: "Attention-only; no authoritative or editorial support",
            impact: "negative",
        }));
    }
    // Italian relevance
    const summaryGeoIT = summary.topicGeoSummaryNullable?.geo === DiscoveryGeoScope.IT;
    const italianShare = computeItalianShare(cluster, itemsById, signalsById, isItalianSourceKey);
    let italianRelevance = "none";
    if (summaryGeoIT && italianShare != null && italianShare > 0) {
        italianRelevance = italianShareToLevel(italianShare);
    }
    else if (summaryGeoIT) {
        italianRelevance = "medium";
    }
    else if (italianShare != null) {
        italianRelevance = italianShareToLevel(italianShare);
    }
    if (italianRelevance === "high") {
        reasons.push(createDiscoveryRankingReason({
            code: "italian_relevance_high",
            label: "Italian geo scope and Italian-first sources",
            impact: "positive",
        }));
    }
    else if (italianRelevance === "medium") {
        reasons.push(createDiscoveryRankingReason({
            code: "italian_relevance_medium",
            label: "Italian market relevance",
            impact: "positive",
        }));
    }
    // Freshness
    const freshness = indicators?.freshnessClassConsistency ?? "mixed";
    if (freshness === "realtime" || freshness === "recent") {
        reasons.push(createDiscoveryRankingReason({
            code: "freshness_recent",
            label: "Recent or realtime signals",
            impact: "positive",
        }));
    }
    // Scheduled relevance
    const scheduledRelevance = indicators?.scheduledSourceRelevance ?? false;
    const hasScheduledTrending = snapshots.some((s) => s.horizon === DiscoveryTrendHorizon.SCHEDULED_MONITOR &&
        s.trendStatus === DiscoveryTrendStatus.TRENDING);
    const scheduledRelevanceEffective = scheduledRelevance || hasScheduledTrending;
    if (scheduledRelevanceEffective) {
        reasons.push(createDiscoveryRankingReason({
            code: "scheduled_relevance",
            label: "Scheduled or authoritative monitor relevance",
            impact: "positive",
        }));
    }
    // Atomicity potential: high when authoritative + (scheduled or narrow time span)
    const timeSpanHours = indicators?.timeSpanHours ?? 0;
    const narrowSpan = timeSpanHours <= 24;
    let atomicityPotential = "low";
    if (authoritativeRelevance && (scheduledRelevanceEffective || narrowSpan)) {
        atomicityPotential = "high";
    }
    else if (editorialRelevance || authoritativeRelevance) {
        atomicityPotential = "medium";
    }
    if (atomicityPotential === "high") {
        reasons.push(createDiscoveryRankingReason({
            code: "atomicity_potential_high",
            label: "Clear event-like structure (authoritative, narrow or scheduled)",
            impact: "positive",
        }));
    }
    // Resolvability potential: high when scheduled + authoritative
    let resolvabilityPotential = "low";
    if (scheduledRelevanceEffective && authoritativeRelevance) {
        resolvabilityPotential = "high";
    }
    else if (scheduledRelevanceEffective || authoritativeRelevance) {
        resolvabilityPotential = "medium";
    }
    const breakdown = createDiscoveryRankingScoreBreakdown({
        novelty,
        signalDensity,
        sourceDiversity,
        authoritativeRelevance,
        editorialRelevance,
        attentionRelevance,
        italianRelevance,
        freshness,
        scheduledRelevance: scheduledRelevanceEffective,
        atomicityPotential,
        resolvabilityPotential,
    });
    return { breakdown, reasons, cautionFlags };
}
//# sourceMappingURL=discovery-ranking-factors.js.map