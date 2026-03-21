/**
 * Deterministic dedupe evaluator v1: within-run and optional prior comparison,
 * explainable decisions, no fuzzy/ML.
 */
import { createDiscoveryDedupeDecision, createDiscoveryDedupeDecisionV1, } from "../entities/discovery-dedupe-decision.entity.js";
import { DiscoveryDedupeReason } from "../enums/discovery-dedupe-reason.enum.js";
import { DiscoveryDedupeOutcome } from "../enums/discovery-dedupe-outcome.enum.js";
import { DiscoveryDedupeDecisionType } from "../enums/discovery-dedupe-decision.enum.js";
import { DiscoveryDedupeEvidenceStrength } from "../enums/discovery-dedupe-evidence-strength.enum.js";
import { deriveDedupeKeysFromItem, deriveDedupeKeysFromSignal, } from "../dedupe/discovery-dedupe-keys.js";
function reasonFromKind(kind) {
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
function strengthFromKind(evidenceStrength) {
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
function buildKeyIndexFromItems(items, foundWithinRun) {
    const map = new Map();
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
function buildKeyIndexFromSignals(signals, foundWithinRun, getItem) {
    const map = new Map();
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
function mergeKeyIndices(withinRun, prior) {
    const merged = new Map(prior);
    for (const [k, v] of withinRun) {
        merged.set(k, v);
    }
    return merged;
}
function evaluateWithKeys(candidateKeys, candidateRefId, withinRunMap, priorMap) {
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
function isNormalizedDiscoveryItem(candidate) {
    return (typeof candidate === "object" &&
        candidate !== null &&
        "headline" in candidate &&
        "canonicalUrl" in candidate &&
        "sourceReference" in candidate);
}
function isDiscoverySignal(candidate) {
    return (typeof candidate === "object" &&
        candidate !== null &&
        "payloadRef" in candidate &&
        "kind" in candidate);
}
export const discoveryDedupeEvaluator = {
    evaluate(key, candidate, context) {
        const ctx = context;
        let keys;
        let refId;
        if (isNormalizedDiscoveryItem(candidate)) {
            keys = deriveDedupeKeysFromItem(candidate);
            refId = candidate.externalItemId ?? "";
        }
        else if (isDiscoverySignal(candidate)) {
            const item = ctx.getItemForNormalizedId?.(candidate.payloadRef.normalizedItemId) ?? null;
            keys = deriveDedupeKeysFromSignal(candidate.payloadRef.normalizedItemId, item);
            refId = typeof candidate.id === "string" ? candidate.id : String(candidate.id);
        }
        else {
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
        const withinRunMap = mergeKeyIndices(buildKeyIndexFromItems(withinRunItems, true), buildKeyIndexFromSignals(withinRunSignals, true, getItem));
        const priorMap = mergeKeyIndices(buildKeyIndexFromItems(priorItems, false), buildKeyIndexFromSignals(priorSignals, false, getItem));
        const v1 = evaluateWithKeys(keys, refId, withinRunMap, priorMap);
        if (v1.outcome === DiscoveryDedupeOutcome.DUPLICATE_WITHIN_RUN ||
            v1.outcome === DiscoveryDedupeOutcome.DUPLICATE_OF_EXISTING) {
            return createDiscoveryDedupeDecision({
                key: v1.matchedKey,
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
    evaluateItem(candidate, context) {
        const withinRunItems = context.withinRunItems ?? [];
        const priorItems = context.priorItems ?? [];
        const withinRunMap = buildKeyIndexFromItems(withinRunItems, true);
        const priorMap = buildKeyIndexFromItems(priorItems, false);
        const keys = deriveDedupeKeysFromItem(candidate);
        const refId = candidate.externalItemId ?? "";
        return evaluateWithKeys(keys, refId, withinRunMap, priorMap);
    },
    evaluateSignal(candidate, context) {
        const getItem = context.getItemForNormalizedId;
        const item = getItem?.(candidate.payloadRef.normalizedItemId) ?? null;
        const keys = deriveDedupeKeysFromSignal(candidate.payloadRef.normalizedItemId, item);
        const withinRunItems = context.withinRunItems ?? [];
        const priorItems = context.priorItems ?? [];
        const withinRunSignals = context.withinRunSignals ?? [];
        const priorSignals = context.priorSignals ?? [];
        const withinRunMap = mergeKeyIndices(buildKeyIndexFromItems(withinRunItems, true), buildKeyIndexFromSignals(withinRunSignals, true, getItem));
        const priorMap = mergeKeyIndices(buildKeyIndexFromItems(priorItems, false), buildKeyIndexFromSignals(priorSignals, false, getItem));
        const refId = typeof candidate.id === "string" ? candidate.id : String(candidate.id);
        return evaluateWithKeys(keys, refId, withinRunMap, priorMap);
    },
};
//# sourceMappingURL=discovery-dedupe-evaluator.js.map