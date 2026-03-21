import { describe, expect, it } from "vitest";
import { eventLeadExtractionEvaluator, createDiscoveryStoryClusterId, createDiscoveryStoryClusterSummary, createDiscoveryRankingEntry, createDiscoveryRankingScoreBreakdown, createDiscoveryRankingReason, DiscoveryPriorityClass, DiscoveryGeoScope, EventLeadStatus, EventLeadReadiness, EventLeadConfidence, } from "../../src/discovery-news-engine/index.js";
function rankingEntry(opts) {
    return createDiscoveryRankingEntry({
        clusterId: opts.clusterId,
        priorityClass: opts.priorityClass,
        breakdown: opts.breakdown,
        reasons: opts.reasons ?? [],
        ...(opts.cautionFlags != null && opts.cautionFlags.length > 0
            ? { cautionFlags: opts.cautionFlags }
            : {}),
    });
}
function breakdown(overrides = {}) {
    return createDiscoveryRankingScoreBreakdown({
        novelty: "new",
        signalDensity: "high",
        sourceDiversity: "high",
        authoritativeRelevance: true,
        editorialRelevance: true,
        attentionRelevance: false,
        italianRelevance: "high",
        freshness: "recent",
        scheduledRelevance: false,
        atomicityPotential: "high",
        resolvabilityPotential: "medium",
        ...overrides,
    });
}
describe("eventLeadExtractionEvaluator", () => {
    it("high-ranked, well-supported Italian cluster produces EventLead", () => {
        const clusterId = createDiscoveryStoryClusterId("dsc_high_it");
        const entries = [
            rankingEntry({
                clusterId,
                priorityClass: DiscoveryPriorityClass.HIGH,
                breakdown: breakdown({
                    italianRelevance: "high",
                    authoritativeRelevance: true,
                    editorialRelevance: true,
                    signalDensity: "high",
                    sourceDiversity: "high",
                    atomicityPotential: "high",
                    resolvabilityPotential: "medium",
                }),
                reasons: [
                    createDiscoveryRankingReason({ code: "italian_relevance_high", label: "Italian relevance", impact: "positive" }),
                    createDiscoveryRankingReason({ code: "authoritative_source", label: "Authoritative", impact: "positive" }),
                ],
            }),
        ];
        const summariesByClusterId = new Map([
            [
                String(clusterId),
                createDiscoveryStoryClusterSummary({
                    clusterId,
                    memberIds: { itemIds: ["i1", "i2"], signalIds: [] },
                    representativeHeadlineOrItemId: "Italian news headline",
                    sourceDiversityCount: 2,
                    timeSpanNullable: null,
                    topicGeoSummaryNullable: { geo: DiscoveryGeoScope.IT },
                }),
            ],
        ]);
        const result = eventLeadExtractionEvaluator.extract({
            rankedEntries: entries,
            summariesByClusterId,
        });
        expect(result.decisions.length).toBe(1);
        const decision = result.decisions[0];
        expect(decision.outcome).toBe("lead");
        if (decision.outcome === "lead") {
            expect(decision.lead.status).toBe(EventLeadStatus.EXTRACTED);
            expect(decision.lead.readiness).toBe(EventLeadReadiness.READY);
            expect([EventLeadConfidence.HIGH, EventLeadConfidence.MEDIUM]).toContain(decision.lead.confidence);
            expect(decision.lead.sourceClusterId).toBe(clusterId);
            expect(decision.lead.hypothesisSummary).toBe("Italian news headline");
            expect(decision.lead.evidenceSet.clusterId).toBe(clusterId);
            expect(decision.lead.reasons.length).toBeGreaterThan(0);
            expect(decision.lead.italianRelevanceContextNullable).toBeDefined();
            expect(decision.lead.sourceSupportContextNullable).toBeDefined();
        }
    });
    it("attention-heavy but weakly supported cluster does not produce EventLead", () => {
        const clusterId = createDiscoveryStoryClusterId("dsc_attention_only");
        const entries = [
            rankingEntry({
                clusterId,
                priorityClass: DiscoveryPriorityClass.LOW,
                breakdown: breakdown({
                    authoritativeRelevance: false,
                    editorialRelevance: false,
                    attentionRelevance: true,
                    italianRelevance: "none",
                    scheduledRelevance: false,
                    signalDensity: "low",
                    sourceDiversity: "low",
                }),
                cautionFlags: ["high_attention_low_authoritative"],
            }),
        ];
        const result = eventLeadExtractionEvaluator.extract({ rankedEntries: entries });
        expect(result.decisions.length).toBe(1);
        const decision = result.decisions[0];
        expect(decision.outcome).toBe("not_extracted");
        if (decision.outcome === "not_extracted") {
            expect(decision.clusterId).toBe(clusterId);
            expect(decision.reasons.length).toBeGreaterThan(0);
            expect(decision.missingConditions.length).toBeGreaterThan(0);
            const hasRelevantReason = decision.reasons.some((r) => r.code === "attention_only_no_authoritative") ||
                decision.reasons.some((r) => r.code === "caution_attention_only") ||
                decision.reasons.some((r) => r.code === "low_priority");
            expect(hasRelevantReason).toBe(true);
        }
    });
    it("scheduled/authoritative cluster can produce EventLead", () => {
        const clusterId = createDiscoveryStoryClusterId("dsc_sched_auth");
        const entries = [
            rankingEntry({
                clusterId,
                priorityClass: DiscoveryPriorityClass.MEDIUM,
                breakdown: breakdown({
                    authoritativeRelevance: true,
                    editorialRelevance: false,
                    italianRelevance: "none",
                    scheduledRelevance: true,
                    signalDensity: "medium",
                    sourceDiversity: "medium",
                    atomicityPotential: "high",
                    resolvabilityPotential: "high",
                }),
            }),
        ];
        const summariesByClusterId = new Map([
            [
                String(clusterId),
                createDiscoveryStoryClusterSummary({
                    clusterId,
                    memberIds: { itemIds: ["g1"], signalIds: [] },
                    representativeHeadlineOrItemId: "Official gazette update",
                    sourceDiversityCount: 1,
                    timeSpanNullable: null,
                    topicGeoSummaryNullable: null,
                }),
            ],
        ]);
        const result = eventLeadExtractionEvaluator.extract({
            rankedEntries: entries,
            summariesByClusterId,
        });
        expect(result.decisions.length).toBe(1);
        const decision = result.decisions[0];
        expect(decision.outcome).toBe("lead");
        if (decision.outcome === "lead") {
            expect(decision.lead.status).toBe(EventLeadStatus.EXTRACTED);
            expect(decision.lead.readiness).toBe(EventLeadReadiness.READY);
            const hasScheduledReason = decision.lead.reasons.some((r) => r.code === "scheduled_relevance");
            expect(hasScheduledReason).toBe(true);
        }
    });
    it("persistent but insufficiently atomic cluster does not produce EventLead", () => {
        const clusterId = createDiscoveryStoryClusterId("dsc_diffuse");
        const entries = [
            rankingEntry({
                clusterId,
                priorityClass: DiscoveryPriorityClass.MEDIUM,
                breakdown: breakdown({
                    authoritativeRelevance: true,
                    editorialRelevance: true,
                    italianRelevance: "medium",
                    scheduledRelevance: false,
                    atomicityPotential: "low",
                    resolvabilityPotential: "low",
                    signalDensity: "medium",
                    sourceDiversity: "medium",
                }),
            }),
        ];
        const result = eventLeadExtractionEvaluator.extract({ rankedEntries: entries });
        expect(result.decisions.length).toBe(1);
        const decision = result.decisions[0];
        expect(decision.outcome).toBe("not_extracted");
        if (decision.outcome === "not_extracted") {
            expect(decision.missingConditions).toContain("insufficient_atomicity");
            expect(decision.reasons.some((r) => r.code === "insufficient_atomicity")).toBe(true);
        }
    });
    it("insufficient evidence / low priority produces non-lead outcome with explainability", () => {
        const clusterId = createDiscoveryStoryClusterId("dsc_low_ev");
        const entries = [
            rankingEntry({
                clusterId,
                priorityClass: DiscoveryPriorityClass.INSUFFICIENT_EVIDENCE,
                breakdown: breakdown({
                    signalDensity: "low",
                    sourceDiversity: "low",
                    authoritativeRelevance: false,
                    editorialRelevance: false,
                    italianRelevance: "none",
                }),
            }),
        ];
        const result = eventLeadExtractionEvaluator.extract({ rankedEntries: entries });
        expect(result.decisions.length).toBe(1);
        const decision = result.decisions[0];
        expect(decision.outcome).toBe("not_extracted");
        if (decision.outcome === "not_extracted") {
            expect(decision.reasons.length).toBeGreaterThan(0);
            expect(decision.missingConditions).toContain("insufficient_priority");
        }
    });
    it("explainability fields are populated on both positive and negative decisions", () => {
        const clusterIdLead = createDiscoveryStoryClusterId("dsc_lead_explain");
        const clusterIdNoLead = createDiscoveryStoryClusterId("dsc_nolead_explain");
        const entries = [
            rankingEntry({
                clusterId: clusterIdLead,
                priorityClass: DiscoveryPriorityClass.HIGH,
                breakdown: breakdown({
                    italianRelevance: "high",
                    authoritativeRelevance: true,
                    editorialRelevance: true,
                    atomicityPotential: "high",
                    resolvabilityPotential: "medium",
                }),
                reasons: [
                    createDiscoveryRankingReason({ code: "priority_high", label: "High priority", impact: "positive" }),
                ],
            }),
            rankingEntry({
                clusterId: clusterIdNoLead,
                priorityClass: DiscoveryPriorityClass.INSUFFICIENT_EVIDENCE,
                breakdown: breakdown({
                    signalDensity: "low",
                    sourceDiversity: "low",
                    authoritativeRelevance: false,
                    editorialRelevance: false,
                }),
            }),
        ];
        const summariesByClusterId = new Map([
            [
                String(clusterIdLead),
                createDiscoveryStoryClusterSummary({
                    clusterId: clusterIdLead,
                    memberIds: { itemIds: ["a1"], signalIds: [] },
                    representativeHeadlineOrItemId: "Lead headline",
                    sourceDiversityCount: 2,
                    timeSpanNullable: null,
                    topicGeoSummaryNullable: null,
                }),
            ],
        ]);
        const result = eventLeadExtractionEvaluator.extract({
            rankedEntries: entries,
            summariesByClusterId,
        });
        expect(result.decisions.length).toBe(2);
        const leadDecision = result.decisions.find((d) => d.outcome === "lead" && d.lead.sourceClusterId === clusterIdLead);
        expect(leadDecision).toBeDefined();
        if (leadDecision?.outcome === "lead") {
            expect(leadDecision.lead.reasons.length).toBeGreaterThan(0);
            expect(leadDecision.lead.evidenceSet).toBeDefined();
            expect(leadDecision.lead.hypothesisSummary).toBe("Lead headline");
        }
        const noLeadDecision = result.decisions.find((d) => d.outcome === "not_extracted" && d.clusterId === clusterIdNoLead);
        expect(noLeadDecision).toBeDefined();
        if (noLeadDecision?.outcome === "not_extracted") {
            expect(noLeadDecision.reasons.length).toBeGreaterThan(0);
            expect(noLeadDecision.missingConditions.length).toBeGreaterThan(0);
        }
    });
});
//# sourceMappingURL=event-lead-extraction-evaluator.test.js.map