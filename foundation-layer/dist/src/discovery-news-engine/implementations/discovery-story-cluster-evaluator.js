/**
 * Story cluster evaluator v1: deterministic rules, explainable decisions, no persistence.
 */
import { createDiscoveryStoryCluster, } from "../entities/discovery-story-cluster.entity.js";
import { createDiscoveryStoryMembershipDecision } from "../entities/discovery-story-membership-decision.entity.js";
import { createDiscoveryStoryClusterId } from "../value-objects/discovery-story-cluster-id.vo.js";
import { DiscoveryStoryClusterStatus } from "../enums/discovery-story-cluster-status.enum.js";
import { DiscoveryStoryMembershipReason } from "../enums/discovery-story-membership-reason.enum.js";
import { DiscoveryDedupeEvidenceStrength } from "../enums/discovery-dedupe-evidence-strength.enum.js";
import { evaluateStoryClusterRules } from "../clustering/discovery-story-clustering-rules.js";
function nextClusterId(counter) {
    const body = `gen_${String(counter.value).padStart(6, "0")}`;
    counter.value += 1;
    return createDiscoveryStoryClusterId(`dsc_${body}`);
}
function addItemToCluster(cluster, itemId, signalId) {
    const hasItem = cluster.memberItemIds.includes(itemId);
    const hasSignal = signalId && cluster.memberSignalIds.includes(signalId);
    const newItemIds = hasItem ? cluster.memberItemIds : [...cluster.memberItemIds, itemId];
    const newSignalIds = signalId && !hasSignal ? [...cluster.memberSignalIds, signalId] : cluster.memberSignalIds;
    return createDiscoveryStoryCluster({
        ...cluster,
        memberItemIds: newItemIds,
        memberSignalIds: newSignalIds,
    });
}
export const discoveryStoryClusterEvaluator = {
    assignToClusters(input, context) {
        const existing = context.existingClusters ?? [];
        const itemsByIdRun = new Map();
        for (const it of input.items ?? []) {
            const id = it.externalItemId ?? "";
            if (id)
                itemsByIdRun.set(id, it);
        }
        const getItem = (id) => itemsByIdRun.get(id) ?? context.getItemForNormalizedId?.(id) ?? null;
        const clusters = existing.map((c) => ({
            ...c,
            memberItemIds: [...c.memberItemIds],
            memberSignalIds: [...c.memberSignalIds],
        }));
        const decisions = [];
        const idCounter = { value: 0 };
        const processItem = (item, itemId, signalId) => {
            const result = evaluateStoryClusterRules(item, itemId, clusters, getItem);
            if (result.match) {
                const idx = clusters.findIndex((c) => c.clusterId === result.clusterId);
                const existing = idx >= 0 ? clusters[idx] : undefined;
                if (existing != null) {
                    clusters[idx] = addItemToCluster(existing, itemId, signalId);
                }
                decisions.push(createDiscoveryStoryMembershipDecision({
                    clusterId: result.clusterId,
                    joinedExisting: true,
                    reason: result.reason,
                    matchedMemberIdNullable: result.matchedMemberId,
                    evidenceStrength: result.evidenceStrength,
                    createdNewCluster: false,
                }));
            }
            else {
                const newId = nextClusterId(idCounter);
                const now = new Date().toISOString();
                clusters.push(createDiscoveryStoryCluster({
                    clusterId: newId,
                    memberItemIds: [itemId],
                    memberSignalIds: signalId != null ? [signalId] : [],
                    status: DiscoveryStoryClusterStatus.OPEN,
                    createdAt: now,
                }));
                decisions.push(createDiscoveryStoryMembershipDecision({
                    clusterId: newId,
                    joinedExisting: false,
                    reason: DiscoveryStoryMembershipReason.NEW_CLUSTER_NO_MATCH,
                    matchedMemberIdNullable: null,
                    evidenceStrength: DiscoveryDedupeEvidenceStrength.WEAK,
                    createdNewCluster: true,
                }));
            }
        };
        for (const item of input.items ?? []) {
            const itemId = item.externalItemId ?? "";
            processItem(item, itemId);
        }
        for (const signal of input.signals ?? []) {
            const itemId = signal.payloadRef.normalizedItemId ?? "";
            const item = getItem(itemId);
            if (item) {
                processItem(item, itemId, signal.id);
            }
            else {
                // No item to run rules; create new cluster with just this signal
                const newId = nextClusterId(idCounter);
                const now = new Date().toISOString();
                clusters.push(createDiscoveryStoryCluster({
                    clusterId: newId,
                    memberItemIds: itemId ? [itemId] : [],
                    memberSignalIds: [signal.id],
                    status: DiscoveryStoryClusterStatus.OPEN,
                    createdAt: now,
                }));
                decisions.push(createDiscoveryStoryMembershipDecision({
                    clusterId: newId,
                    joinedExisting: false,
                    reason: DiscoveryStoryMembershipReason.NEW_CLUSTER_NO_MATCH,
                    matchedMemberIdNullable: null,
                    evidenceStrength: DiscoveryDedupeEvidenceStrength.WEAK,
                    createdNewCluster: true,
                }));
            }
        }
        return {
            clusters,
            decisions,
        };
    },
};
//# sourceMappingURL=discovery-story-cluster-evaluator.js.map