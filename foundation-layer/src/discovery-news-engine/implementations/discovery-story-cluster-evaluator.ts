/**
 * Story cluster evaluator v1: deterministic rules, explainable decisions, no persistence.
 */

import type { NormalizedDiscoveryItem } from "../entities/normalized-discovery-item.entity.js";
import type { DiscoverySignal } from "../entities/discovery-signal.entity.js";
import type { DiscoveryStoryCluster } from "../entities/discovery-story-cluster.entity.js";
import {
  createDiscoveryStoryCluster,
  type DiscoveryStoryCluster as DiscoveryStoryClusterType,
} from "../entities/discovery-story-cluster.entity.js";
import type { DiscoverySignalId } from "../value-objects/discovery-signal-id.vo.js";
import type { DiscoveryStoryMembershipDecision } from "../entities/discovery-story-membership-decision.entity.js";
import { createDiscoveryStoryMembershipDecision } from "../entities/discovery-story-membership-decision.entity.js";
import { createDiscoveryStoryClusterId } from "../value-objects/discovery-story-cluster-id.vo.js";
import { DiscoveryStoryClusterStatus } from "../enums/discovery-story-cluster-status.enum.js";
import { DiscoveryStoryMembershipReason } from "../enums/discovery-story-membership-reason.enum.js";
import { DiscoveryDedupeEvidenceStrength } from "../enums/discovery-dedupe-evidence-strength.enum.js";
import type { DiscoveryStoryClusterEvaluator } from "../interfaces/discovery-story-cluster-evaluator.js";
import type {
  DiscoveryStoryClusterContext,
  DiscoveryStoryClusterAssignInput,
  DiscoveryStoryClusterAssignResult,
} from "../interfaces/discovery-story-cluster-evaluator.js";
import { evaluateStoryClusterRules } from "../clustering/discovery-story-clustering-rules.js";
import type { Timestamp } from "../../value-objects/timestamp.vo.js";

function nextClusterId(counter: { value: number }): ReturnType<typeof createDiscoveryStoryClusterId> {
  const body = `gen_${String(counter.value).padStart(6, "0")}`;
  counter.value += 1;
  return createDiscoveryStoryClusterId(`dsc_${body}`);
}

function addItemToCluster(
  cluster: DiscoveryStoryClusterType,
  itemId: string,
  signalId?: DiscoverySignalId,
): DiscoveryStoryClusterType {
  const hasItem = cluster.memberItemIds.includes(itemId);
  const hasSignal = signalId && cluster.memberSignalIds.includes(signalId);
  const newItemIds = hasItem ? cluster.memberItemIds : [...cluster.memberItemIds, itemId];
  const newSignalIds: readonly DiscoverySignalId[] =
    signalId && !hasSignal ? [...cluster.memberSignalIds, signalId] : cluster.memberSignalIds;
  return createDiscoveryStoryCluster({
    ...cluster,
    memberItemIds: newItemIds,
    memberSignalIds: newSignalIds,
  });
}

export const discoveryStoryClusterEvaluator: DiscoveryStoryClusterEvaluator = {
  assignToClusters(
    input: DiscoveryStoryClusterAssignInput,
    context: DiscoveryStoryClusterContext,
  ): DiscoveryStoryClusterAssignResult {
    const existing = context.existingClusters ?? [];
    const itemsByIdRun = new Map<string, NormalizedDiscoveryItem>();
    for (const it of input.items ?? []) {
      const id = it.externalItemId ?? "";
      if (id) itemsByIdRun.set(id, it);
    }
    const getItem = (id: string): NormalizedDiscoveryItem | null =>
      itemsByIdRun.get(id) ?? context.getItemForNormalizedId?.(id) ?? null;
    const clusters: DiscoveryStoryClusterType[] = existing.map((c) => ({
      ...c,
      memberItemIds: [...c.memberItemIds],
      memberSignalIds: [...c.memberSignalIds],
    }));
    const decisions: DiscoveryStoryMembershipDecision[] = [];
    const idCounter = { value: 0 };

    const processItem = (
      item: NormalizedDiscoveryItem,
      itemId: string,
      signalId?: DiscoverySignalId,
    ): void => {
      const result = evaluateStoryClusterRules(item, itemId, clusters, getItem);
      if (result.match) {
        const idx = clusters.findIndex((c) => c.clusterId === result.clusterId);
        const existing = idx >= 0 ? clusters[idx] : undefined;
        if (existing != null) {
          clusters[idx] = addItemToCluster(existing, itemId, signalId);
        }
        decisions.push(
          createDiscoveryStoryMembershipDecision({
            clusterId: result.clusterId,
            joinedExisting: true,
            reason: result.reason,
            matchedMemberIdNullable: result.matchedMemberId,
            evidenceStrength: result.evidenceStrength,
            createdNewCluster: false,
          }),
        );
      } else {
        const newId = nextClusterId(idCounter);
        const now = new Date().toISOString() as Timestamp;
        clusters.push(
          createDiscoveryStoryCluster({
            clusterId: newId,
            memberItemIds: [itemId],
            memberSignalIds: signalId != null ? [signalId] : [],
            status: DiscoveryStoryClusterStatus.OPEN,
            createdAt: now,
          }),
        );
        decisions.push(
          createDiscoveryStoryMembershipDecision({
            clusterId: newId,
            joinedExisting: false,
            reason: DiscoveryStoryMembershipReason.NEW_CLUSTER_NO_MATCH,
            matchedMemberIdNullable: null,
            evidenceStrength: DiscoveryDedupeEvidenceStrength.WEAK,
            createdNewCluster: true,
          }),
        );
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
      } else {
        // No item to run rules; create new cluster with just this signal
        const newId = nextClusterId(idCounter);
        const now = new Date().toISOString() as Timestamp;
        clusters.push(
          createDiscoveryStoryCluster({
            clusterId: newId,
            memberItemIds: itemId ? [itemId] : [],
            memberSignalIds: [signal.id],
            status: DiscoveryStoryClusterStatus.OPEN,
            createdAt: now,
          }),
        );
        decisions.push(
          createDiscoveryStoryMembershipDecision({
            clusterId: newId,
            joinedExisting: false,
            reason: DiscoveryStoryMembershipReason.NEW_CLUSTER_NO_MATCH,
            matchedMemberIdNullable: null,
            evidenceStrength: DiscoveryDedupeEvidenceStrength.WEAK,
            createdNewCluster: true,
          }),
        );
      }
    }

    return {
      clusters,
      decisions,
    };
  },
};
