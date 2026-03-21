/**
 * Deterministic dedupe evaluator v1: within-run and optional prior comparison,
 * explainable decisions, no fuzzy/ML.
 */

import type { NormalizedDiscoveryItem } from "../entities/normalized-discovery-item.entity.js";
import type { DiscoverySignal } from "../entities/discovery-signal.entity.js";
import {
  createDiscoveryDedupeDecision,
  createDiscoveryDedupeDecisionV1,
  type DiscoveryDedupeDecision,
  type DiscoveryDedupeDecisionV1,
} from "../entities/discovery-dedupe-decision.entity.js";
import { DiscoveryDedupeReason } from "../enums/discovery-dedupe-reason.enum.js";
import { DiscoveryDedupeOutcome } from "../enums/discovery-dedupe-outcome.enum.js";
import { DiscoveryDedupeDecisionType } from "../enums/discovery-dedupe-decision.enum.js";
import { DiscoveryDedupeEvidenceStrength } from "../enums/discovery-dedupe-evidence-strength.enum.js";
import type { DiscoveryDedupeContext } from "../interfaces/discovery-dedupe-evaluator.js";
import type { DiscoveryDedupeContextV1 } from "../interfaces/discovery-dedupe-evaluator.js";
import type { DiscoveryDedupeEvaluator } from "../interfaces/discovery-dedupe-evaluator.js";
import type { DiscoveryDedupeKey } from "../value-objects/discovery-dedupe-key.vo.js";
import {
  deriveDedupeKeysFromItem,
  deriveDedupeKeysFromSignal,
  type DedupeKeyWithKind,
} from "../dedupe/discovery-dedupe-keys.js";

type KeyEntry = Readonly<{ referenceId: string; foundWithinRun: boolean }>;

function reasonFromKind(kind: string): DiscoveryDedupeReason {
  switch (kind) {
    case "canonical_url":
      return DiscoveryDedupeReason.CANONICAL_MATCH;
    case "source_external_id":
      return DiscoveryDedupeReason.SOURCE_EXTERNAL_ID;
    case "synthetic_locator":
      return DiscoveryDedupeReason.SYNTHETIC_LOCATOR;
    case "title_time_window":
      return DiscoveryDedupeReason.TITLE_TIME_WINDOW;
    default:
      return DiscoveryDedupeReason.EXACT_MATCH;
  }
}

function strengthFromKind(evidenceStrength: "strong" | "medium" | "weak"): DiscoveryDedupeEvidenceStrength {
  switch (evidenceStrength) {
    case "strong":
      return DiscoveryDedupeEvidenceStrength.STRONG;
    case "medium":
      return DiscoveryDedupeEvidenceStrength.MEDIUM;
    case "weak":
      return DiscoveryDedupeEvidenceStrength.WEAK;
    default:
      return DiscoveryDedupeEvidenceStrength.MEDIUM;
  }
}

function buildKeyIndexFromItems(
  items: readonly NormalizedDiscoveryItem[],
  foundWithinRun: boolean,
): Map<DiscoveryDedupeKey, KeyEntry> {
  const map = new Map<DiscoveryDedupeKey, KeyEntry>();
  for (const item of items) {
    const keys = deriveDedupeKeysFromItem(item);
    const refId = item.externalItemId ?? "";
    for (const { key } of keys) {
      if (!map.has(key)) {
        map.set(key, { referenceId: refId, foundWithinRun });
      }
    }
  }
  return map;
}

function buildKeyIndexFromSignals(
  signals: readonly DiscoverySignal[],
  foundWithinRun: boolean,
  getItem: ((id: string) => NormalizedDiscoveryItem | null) | undefined,
): Map<DiscoveryDedupeKey, KeyEntry> {
  const map = new Map<DiscoveryDedupeKey, KeyEntry>();
  for (const sig of signals) {
    const itemId = sig.payloadRef.normalizedItemId;
    const item = getItem?.(itemId) ?? null;
    const keys = deriveDedupeKeysFromSignal(itemId, item);
    const refId = typeof sig.id === "string" ? sig.id : String(sig.id);
    for (const { key } of keys) {
      if (!map.has(key)) {
        map.set(key, { referenceId: refId, foundWithinRun });
      }
    }
  }
  return map;
}

function mergeKeyIndices(
  withinRun: Map<DiscoveryDedupeKey, KeyEntry>,
  prior: Map<DiscoveryDedupeKey, KeyEntry>,
): Map<DiscoveryDedupeKey, KeyEntry> {
  const merged = new Map<DiscoveryDedupeKey, KeyEntry>(prior);
  for (const [k, v] of withinRun) {
    merged.set(k, v);
  }
  return merged;
}

function evaluateWithKeys(
  candidateKeys: DedupeKeyWithKind[],
  candidateRefId: string,
  withinRunMap: Map<DiscoveryDedupeKey, KeyEntry>,
  priorMap: Map<DiscoveryDedupeKey, KeyEntry>,
): DiscoveryDedupeDecisionV1 {
  if (candidateKeys.length === 0) {
    return createDiscoveryDedupeDecisionV1({
      outcome: DiscoveryDedupeOutcome.INSUFFICIENT_EVIDENCE,
      reason: DiscoveryDedupeReason.EXACT_MATCH,
      matchedKey: null,
      matchedCandidateIdNullable: null,
      evidenceStrengthNullable: null,
      foundWithinRun: false,
    });
  }

  for (const { key, kind, evidenceStrength } of candidateKeys) {
    const inWithin = withinRunMap.get(key);
    if (inWithin) {
      return createDiscoveryDedupeDecisionV1({
        outcome: DiscoveryDedupeOutcome.DUPLICATE_WITHIN_RUN,
        reason: reasonFromKind(kind),
        matchedKey: key,
        matchedCandidateIdNullable: inWithin.referenceId,
        evidenceStrengthNullable: strengthFromKind(evidenceStrength),
        foundWithinRun: true,
      });
    }
    const inPrior = priorMap.get(key);
    if (inPrior) {
      return createDiscoveryDedupeDecisionV1({
        outcome: DiscoveryDedupeOutcome.DUPLICATE_OF_EXISTING,
        reason: reasonFromKind(kind),
        matchedKey: key,
        matchedCandidateIdNullable: inPrior.referenceId,
        evidenceStrengthNullable: strengthFromKind(evidenceStrength),
        foundWithinRun: false,
      });
    }
  }

  return createDiscoveryDedupeDecisionV1({
    outcome: DiscoveryDedupeOutcome.UNIQUE,
    reason: DiscoveryDedupeReason.EXACT_MATCH,
    matchedKey: null,
    matchedCandidateIdNullable: null,
    evidenceStrengthNullable: null,
    foundWithinRun: false,
  });
}

function isNormalizedDiscoveryItem(candidate: unknown): candidate is NormalizedDiscoveryItem {
  return (
    typeof candidate === "object" &&
    candidate !== null &&
    "headline" in candidate &&
    "canonicalUrl" in candidate &&
    "sourceReference" in candidate
  );
}

function isDiscoverySignal(candidate: unknown): candidate is DiscoverySignal {
  return (
    typeof candidate === "object" &&
    candidate !== null &&
    "payloadRef" in candidate &&
    "kind" in candidate
  );
}

export const discoveryDedupeEvaluator: DiscoveryDedupeEvaluator = {
  evaluate(
    key: DiscoveryDedupeKey,
    candidate: unknown,
    context: DiscoveryDedupeContext,
  ): DiscoveryDedupeDecision {
    const ctx = context as DiscoveryDedupeContextV1;
    let keys: DedupeKeyWithKind[];
    let refId: string;

    if (isNormalizedDiscoveryItem(candidate)) {
      keys = deriveDedupeKeysFromItem(candidate);
      refId = candidate.externalItemId ?? "";
    } else if (isDiscoverySignal(candidate)) {
      const item = ctx.getItemForNormalizedId?.(candidate.payloadRef.normalizedItemId) ?? null;
      keys = deriveDedupeKeysFromSignal(candidate.payloadRef.normalizedItemId, item);
      refId = typeof candidate.id === "string" ? candidate.id : String(candidate.id);
    } else {
      return createDiscoveryDedupeDecision({
        key,
        decision: DiscoveryDedupeDecisionType.NEW,
        reason: DiscoveryDedupeReason.EXACT_MATCH,
      });
    }

    const hasKey = keys.some((k) => k.key === key);
    if (!hasKey) {
      return createDiscoveryDedupeDecision({
        key,
        decision: DiscoveryDedupeDecisionType.NEW,
        reason: DiscoveryDedupeReason.EXACT_MATCH,
      });
    }

    const withinRunItems = ctx.withinRunItems ?? [];
    const priorItems = ctx.priorItems ?? [];
    const withinRunSignals = ctx.withinRunSignals ?? [];
    const priorSignals = ctx.priorSignals ?? [];
    const getItem = ctx.getItemForNormalizedId;

    const withinRunMap = mergeKeyIndices(
      buildKeyIndexFromItems(withinRunItems, true),
      buildKeyIndexFromSignals(withinRunSignals, true, getItem),
    );
    const priorMap = mergeKeyIndices(
      buildKeyIndexFromItems(priorItems, false),
      buildKeyIndexFromSignals(priorSignals, false, getItem),
    );

    const v1 = evaluateWithKeys(keys, refId, withinRunMap, priorMap);

    if (
      v1.outcome === DiscoveryDedupeOutcome.DUPLICATE_WITHIN_RUN ||
      v1.outcome === DiscoveryDedupeOutcome.DUPLICATE_OF_EXISTING
    ) {
      return createDiscoveryDedupeDecision({
        key: v1.matchedKey!,
        decision: DiscoveryDedupeDecisionType.DUPLICATE,
        reason: v1.reason,
      });
    }
    return createDiscoveryDedupeDecision({
      key,
      decision: DiscoveryDedupeDecisionType.NEW,
      reason: v1.reason,
    });
  },

  evaluateItem(
    candidate: NormalizedDiscoveryItem,
    context: DiscoveryDedupeContextV1,
  ): DiscoveryDedupeDecisionV1 {
    const withinRunItems = context.withinRunItems ?? [];
    const priorItems = context.priorItems ?? [];
    const withinRunMap = buildKeyIndexFromItems(withinRunItems, true);
    const priorMap = buildKeyIndexFromItems(priorItems, false);
    const keys = deriveDedupeKeysFromItem(candidate);
    const refId = candidate.externalItemId ?? "";
    return evaluateWithKeys(keys, refId, withinRunMap, priorMap);
  },

  evaluateSignal(
    candidate: DiscoverySignal,
    context: DiscoveryDedupeContextV1,
  ): DiscoveryDedupeDecisionV1 {
    const getItem = context.getItemForNormalizedId;
    const item = getItem?.(candidate.payloadRef.normalizedItemId) ?? null;
    const keys = deriveDedupeKeysFromSignal(candidate.payloadRef.normalizedItemId, item);

    const withinRunItems = context.withinRunItems ?? [];
    const priorItems = context.priorItems ?? [];
    const withinRunSignals = context.withinRunSignals ?? [];
    const priorSignals = context.priorSignals ?? [];

    const withinRunMap = mergeKeyIndices(
      buildKeyIndexFromItems(withinRunItems, true),
      buildKeyIndexFromSignals(withinRunSignals, true, getItem),
    );
    const priorMap = mergeKeyIndices(
      buildKeyIndexFromItems(priorItems, false),
      buildKeyIndexFromSignals(priorSignals, false, getItem),
    );

    const refId = typeof candidate.id === "string" ? candidate.id : String(candidate.id);
    return evaluateWithKeys(keys, refId, withinRunMap, priorMap);
  },
};
