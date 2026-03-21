/**
 * Ranking evaluator v1: deterministic, explainable, Italian-first.
 * Consumes discovery outputs (clusters, summaries, trend snapshots); no EventLead or persistence.
 */
import { createDiscoveryRankingEntry } from "../entities/discovery-ranking-entry.entity.js";
import { DiscoveryPriorityClass } from "../enums/discovery-priority-class.enum.js";
import { DiscoveryTrendStatus } from "../enums/discovery-trend-status.enum.js";
import { computeRankingFactors } from "../ranking/discovery-ranking-factors.js";
const PRIORITY_ORDER = {
    [DiscoveryPriorityClass.HIGH]: 0,
    [DiscoveryPriorityClass.MEDIUM]: 1,
    [DiscoveryPriorityClass.LOW]: 2,
    [DiscoveryPriorityClass.INSUFFICIENT_EVIDENCE]: 3,
};
function derivePriorityClass(breakdown, reasons, cautionFlags, hasAnyTrendingSnapshot, bestSignalCount) {
    const insufficientEvidence = bestSignalCount < 2 &&
        breakdown.sourceDiversity === "low" &&
        !hasAnyTrendingSnapshot;
    if (insufficientEvidence) {
        return DiscoveryPriorityClass.INSUFFICIENT_EVIDENCE;
    }
    const attentionOnlyCaution = cautionFlags.includes("high_attention_low_authoritative");
    if (attentionOnlyCaution &&
        !breakdown.authoritativeRelevance &&
        !breakdown.editorialRelevance) {
        return DiscoveryPriorityClass.LOW;
    }
    const strongItalian = breakdown.italianRelevance === "high" || breakdown.italianRelevance === "medium";
    const hasAuthorityOrEditorial = breakdown.authoritativeRelevance || breakdown.editorialRelevance;
    const enoughSignals = breakdown.signalDensity === "high" ||
        breakdown.signalDensity === "medium" ||
        breakdown.sourceDiversity === "high" ||
        breakdown.sourceDiversity === "medium";
    if (strongItalian &&
        hasAuthorityOrEditorial &&
        !attentionOnlyCaution &&
        enoughSignals) {
        return DiscoveryPriorityClass.HIGH;
    }
    if (breakdown.signalDensity === "low" &&
        breakdown.sourceDiversity === "low" &&
        !breakdown.authoritativeRelevance &&
        !breakdown.editorialRelevance) {
        return DiscoveryPriorityClass.LOW;
    }
    return DiscoveryPriorityClass.MEDIUM;
}
function orderingBasisFor(entry) {
    const p = PRIORITY_ORDER[entry.priorityClass];
    const italianOrder = entry.breakdown.italianRelevance === "high"
        ? 2
        : entry.breakdown.italianRelevance === "medium"
            ? 1
            : 0;
    const auth = entry.breakdown.authoritativeRelevance ? 1 : 0;
    const editorial = entry.breakdown.editorialRelevance ? 1 : 0;
    const densityOrder = entry.breakdown.signalDensity === "high"
        ? 2
        : entry.breakdown.signalDensity === "medium"
            ? 1
            : 0;
    return [p, -italianOrder, auth, editorial, densityOrder, String(entry.clusterId)];
}
export const discoveryRankingEvaluator = {
    rank(context) {
        const { clusters, summariesByClusterId, snapshotsByClusterId, itemsById, signalsById, isItalianSourceKey, getSourceRoleNullable, } = context;
        const now = new Date();
        const entries = [];
        for (const cluster of clusters) {
            const clusterIdStr = String(cluster.clusterId);
            const summary = summariesByClusterId.get(clusterIdStr);
            const snapshots = snapshotsByClusterId.get(clusterIdStr) ?? [];
            const { breakdown, reasons, cautionFlags } = computeRankingFactors({
                cluster,
                summary: summary ?? {
                    clusterId: cluster.clusterId,
                    memberIds: { itemIds: [...cluster.memberItemIds], signalIds: [...cluster.memberSignalIds] },
                    representativeHeadlineOrItemId: "",
                    sourceDiversityCount: 0,
                    timeSpanNullable: null,
                    topicGeoSummaryNullable: null,
                },
                snapshots,
                now,
                ...(itemsById !== undefined ? { itemsById } : {}),
                ...(signalsById !== undefined ? { signalsById } : {}),
                ...(isItalianSourceKey !== undefined ? { isItalianSourceKey } : {}),
                ...(getSourceRoleNullable !== undefined ? { getSourceRoleNullable } : {}),
            });
            const bestSnapshot = snapshots.length > 0
                ? snapshots.reduce((a, b) => (b.indicatorSet.signalCountInHorizon > a.indicatorSet.signalCountInHorizon ? b : a))
                : null;
            const bestSignalCount = bestSnapshot?.indicatorSet.signalCountInHorizon ?? 0;
            const hasAnyTrendingSnapshot = snapshots.some((s) => s.trendStatus === DiscoveryTrendStatus.TRENDING);
            const priorityClass = derivePriorityClass(breakdown, reasons, cautionFlags, hasAnyTrendingSnapshot, bestSignalCount);
            const entry = createDiscoveryRankingEntry({
                clusterId: cluster.clusterId,
                priorityClass,
                breakdown,
                reasons,
                ...(cautionFlags.length > 0 ? { cautionFlags } : {}),
            });
            const withBasis = createDiscoveryRankingEntry({
                ...entry,
                orderingBasis: orderingBasisFor(entry),
            });
            entries.push(withBasis);
        }
        entries.sort((a, b) => {
            const basisA = a.orderingBasis ?? [String(a.clusterId)];
            const basisB = b.orderingBasis ?? [String(b.clusterId)];
            for (let i = 0; i < Math.max(basisA.length, basisB.length); i++) {
                const va = basisA[i];
                const vb = basisB[i];
                if (va === undefined && vb === undefined)
                    return 0;
                if (va === undefined)
                    return 1;
                if (vb === undefined)
                    return -1;
                if (va < vb)
                    return -1;
                if (va > vb)
                    return 1;
            }
            return 0;
        });
        return { entries };
    },
};
//# sourceMappingURL=discovery-ranking-evaluator.js.map