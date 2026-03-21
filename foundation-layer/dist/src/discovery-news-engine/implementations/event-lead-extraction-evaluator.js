/**
 * Event lead extraction evaluator v1: conservative, rule-based, explainable.
 * Consumes ranked discovery entries and optional context; produces EventLead or not_extracted per cluster.
 */
import { createEventLead } from "../entities/event-lead.entity.js";
import { createEventLeadEvidenceSet } from "../entities/event-lead-evidence-set.entity.js";
import { createEventLeadReason } from "../entities/event-lead-reason.entity.js";
import { createEventLeadExtractionDecisionLead, createEventLeadExtractionDecisionNotExtracted, } from "../entities/event-lead-extraction-decision.entity.js";
import { createEventLeadId } from "../value-objects/event-lead-id.vo.js";
import { EventLeadStatus } from "../enums/event-lead-status.enum.js";
import { EventLeadReadiness } from "../enums/event-lead-readiness.enum.js";
import { EventLeadConfidence } from "../enums/event-lead-confidence.enum.js";
import { DiscoveryPriorityClass } from "../enums/discovery-priority-class.enum.js";
function buildEventLeadId(clusterId, index) {
    const sanitized = String(clusterId).replace(/[^a-zA-Z0-9_-]/g, "_");
    const bodyBase = sanitized.length >= 6 ? sanitized : sanitized + "0".repeat(6 - sanitized.length);
    const body = bodyBase + "_" + index;
    const safeBody = /^[a-zA-Z0-9]/.test(body) ? body.slice(0, 64) : "x" + body.slice(0, 63);
    return "del_" + safeBody;
}
function buildEvidenceSet(entry, summariesByClusterId) {
    const clusterIdStr = String(entry.clusterId);
    const summary = summariesByClusterId?.get(clusterIdStr);
    const itemIds = summary?.memberIds?.itemIds ?? [];
    const signalIds = summary?.memberIds?.signalIds;
    const headline = summary?.representativeHeadlineOrItemId ?? null;
    return createEventLeadEvidenceSet({
        clusterId: entry.clusterId,
        memberItemIds: [...itemIds],
        ...(signalIds != null && signalIds.length > 0 ? { memberSignalIds: [...signalIds] } : {}),
        representativeHeadlineNullable: headline,
    });
}
function leadReasonsFromEntry(entry) {
    const reasons = [];
    if (entry.priorityClass === DiscoveryPriorityClass.HIGH) {
        reasons.push(createEventLeadReason({ code: "priority_high", label: "High ranking priority", impact: "positive" }));
    }
    else if (entry.priorityClass === DiscoveryPriorityClass.MEDIUM) {
        reasons.push(createEventLeadReason({ code: "priority_medium", label: "Medium ranking priority", impact: "positive" }));
    }
    if (entry.breakdown.authoritativeRelevance) {
        reasons.push(createEventLeadReason({ code: "authoritative_support", label: "Authoritative source support", impact: "positive" }));
    }
    if (entry.breakdown.editorialRelevance) {
        reasons.push(createEventLeadReason({ code: "editorial_support", label: "Editorial source support", impact: "positive" }));
    }
    if (entry.breakdown.italianRelevance === "high" || entry.breakdown.italianRelevance === "medium") {
        reasons.push(createEventLeadReason({ code: "italian_relevance", label: "Italian relevance", impact: "positive" }));
    }
    if (entry.breakdown.scheduledRelevance) {
        reasons.push(createEventLeadReason({ code: "scheduled_relevance", label: "Scheduled or official relevance", impact: "positive" }));
    }
    if (entry.breakdown.atomicityPotential === "high" || entry.breakdown.atomicityPotential === "medium") {
        reasons.push(createEventLeadReason({ code: "atomicity_potential", label: "Event-like atomicity", impact: "positive" }));
    }
    if (entry.breakdown.resolvabilityPotential === "high" || entry.breakdown.resolvabilityPotential === "medium") {
        reasons.push(createEventLeadReason({ code: "resolvability_potential", label: "Resolvability potential", impact: "positive" }));
    }
    return reasons;
}
function deriveConfidence(entry) {
    const auth = entry.breakdown.authoritativeRelevance;
    const editorial = entry.breakdown.editorialRelevance;
    const italian = entry.breakdown.italianRelevance === "high" || entry.breakdown.italianRelevance === "medium";
    const scheduled = entry.breakdown.scheduledRelevance;
    const atomicity = entry.breakdown.atomicityPotential === "high";
    const evidence = entry.breakdown.signalDensity !== "low" && entry.breakdown.sourceDiversity !== "low";
    const positiveCount = [auth, editorial, italian, scheduled, atomicity, evidence].filter(Boolean).length;
    if (positiveCount >= 5 && entry.priorityClass === DiscoveryPriorityClass.HIGH)
        return EventLeadConfidence.HIGH;
    if (positiveCount >= 3)
        return EventLeadConfidence.MEDIUM;
    return EventLeadConfidence.LOW;
}
function italianContext(entry) {
    if (entry.breakdown.italianRelevance === "none")
        return null;
    return `italian_relevance=${entry.breakdown.italianRelevance}`;
}
function sourceSupportContext(entry) {
    const parts = [];
    if (entry.breakdown.authoritativeRelevance)
        parts.push("authoritative");
    if (entry.breakdown.editorialRelevance)
        parts.push("editorial");
    if (entry.breakdown.attentionRelevance)
        parts.push("attention");
    if (parts.length === 0)
        return null;
    return parts.join(",");
}
export const eventLeadExtractionEvaluator = {
    extract(context) {
        const { rankedEntries, summariesByClusterId, snapshotsByClusterId } = context;
        const decisions = [];
        let index = 0;
        for (const entry of rankedEntries) {
            const reasons = [];
            const missingConditions = [];
            const cautionFlags = entry.cautionFlags != null && entry.cautionFlags.length > 0 ? [...entry.cautionFlags] : undefined;
            // Gate 1: priority class
            if (entry.priorityClass === DiscoveryPriorityClass.INSUFFICIENT_EVIDENCE) {
                reasons.push(createEventLeadReason({ code: "low_priority", label: "Insufficient evidence priority", impact: "negative" }));
                missingConditions.push("insufficient_priority");
                decisions.push(createEventLeadExtractionDecisionNotExtracted({
                    outcome: "not_extracted",
                    clusterId: entry.clusterId,
                    reasons,
                    missingConditions,
                }));
                index++;
                continue;
            }
            if (entry.priorityClass === DiscoveryPriorityClass.LOW) {
                const scheduledAndAuth = entry.breakdown.scheduledRelevance && entry.breakdown.authoritativeRelevance;
                if (!scheduledAndAuth) {
                    reasons.push(createEventLeadReason({ code: "low_priority", label: "Low ranking priority", impact: "negative" }));
                    missingConditions.push("insufficient_priority");
                    decisions.push(createEventLeadExtractionDecisionNotExtracted({
                        outcome: "not_extracted",
                        clusterId: entry.clusterId,
                        reasons,
                        missingConditions,
                    }));
                    index++;
                    continue;
                }
            }
            // Gate 2: source support (at least authoritative or editorial)
            if (!entry.breakdown.authoritativeRelevance && !entry.breakdown.editorialRelevance) {
                reasons.push(createEventLeadReason({
                    code: "attention_only_no_authoritative",
                    label: "No authoritative or editorial support",
                    impact: "negative",
                }));
                missingConditions.push("insufficient_authoritative");
                decisions.push(createEventLeadExtractionDecisionNotExtracted({
                    outcome: "not_extracted",
                    clusterId: entry.clusterId,
                    reasons,
                    missingConditions,
                }));
                index++;
                continue;
            }
            // Gate 3: caution flag (attention-only)
            if (cautionFlags?.includes("high_attention_low_authoritative")) {
                reasons.push(createEventLeadReason({
                    code: "caution_attention_only",
                    label: "Attention-only; insufficient authoritative support",
                    impact: "negative",
                }));
                missingConditions.push("high_attention_low_authoritative");
                decisions.push(createEventLeadExtractionDecisionNotExtracted({
                    outcome: "not_extracted",
                    clusterId: entry.clusterId,
                    reasons,
                    missingConditions,
                }));
                index++;
                continue;
            }
            // Gate 4: Italian relevance or strong scheduled/authoritative
            const hasItalian = entry.breakdown.italianRelevance === "high" || entry.breakdown.italianRelevance === "medium";
            const hasScheduledAuth = entry.breakdown.scheduledRelevance && entry.breakdown.authoritativeRelevance;
            if (!hasItalian && !hasScheduledAuth) {
                reasons.push(createEventLeadReason({
                    code: "insufficient_italian_or_scheduled",
                    label: "Missing Italian relevance or scheduled/authoritative anchor",
                    impact: "negative",
                }));
                missingConditions.push("italian_or_scheduled_required");
                decisions.push(createEventLeadExtractionDecisionNotExtracted({
                    outcome: "not_extracted",
                    clusterId: entry.clusterId,
                    reasons,
                    missingConditions,
                }));
                index++;
                continue;
            }
            // Gate 5: evidence sufficiency
            if (entry.breakdown.signalDensity === "low" && entry.breakdown.sourceDiversity === "low") {
                reasons.push(createEventLeadReason({ code: "insufficient_evidence", label: "Insufficient signal or source diversity", impact: "negative" }));
                missingConditions.push("insufficient_evidence");
                decisions.push(createEventLeadExtractionDecisionNotExtracted({
                    outcome: "not_extracted",
                    clusterId: entry.clusterId,
                    reasons,
                    missingConditions,
                }));
                index++;
                continue;
            }
            // Gate 6: atomicity for non-scheduled (persistent diffuse cluster)
            const hasAtomicity = entry.breakdown.atomicityPotential === "high" || entry.breakdown.atomicityPotential === "medium";
            const hasResolvability = entry.breakdown.resolvabilityPotential === "high" || entry.breakdown.resolvabilityPotential === "medium";
            if (!hasScheduledAuth && !hasAtomicity && !hasResolvability) {
                reasons.push(createEventLeadReason({
                    code: "insufficient_atomicity",
                    label: "Persistent or diffuse cluster; insufficient atomicity/resolvability",
                    impact: "negative",
                }));
                missingConditions.push("insufficient_atomicity");
                decisions.push(createEventLeadExtractionDecisionNotExtracted({
                    outcome: "not_extracted",
                    clusterId: entry.clusterId,
                    reasons,
                    missingConditions,
                }));
                index++;
                continue;
            }
            // All gates passed: create EventLead
            const evidenceSet = buildEvidenceSet(entry, summariesByClusterId);
            const leadReasons = leadReasonsFromEntry(entry);
            const hypothesisSummary = evidenceSet.representativeHeadlineNullable?.trim() ||
                `Cluster ${String(entry.clusterId)}`;
            const lead = createEventLead({
                id: createEventLeadId(buildEventLeadId(String(entry.clusterId), index)),
                sourceClusterId: entry.clusterId,
                status: EventLeadStatus.EXTRACTED,
                readiness: EventLeadReadiness.READY,
                confidence: deriveConfidence(entry),
                hypothesisSummary,
                evidenceSet,
                reasons: leadReasons,
                ...(cautionFlags != null && cautionFlags.length > 0 ? { cautionFlags } : {}),
                italianRelevanceContextNullable: italianContext(entry),
                sourceSupportContextNullable: sourceSupportContext(entry),
            });
            decisions.push(createEventLeadExtractionDecisionLead({ outcome: "lead", lead }));
            index++;
        }
        return { decisions };
    },
};
//# sourceMappingURL=event-lead-extraction-evaluator.js.map