import { describe, expect, it } from "vitest";
import { CandidateStatus, ClusterStatus, ConflictType, DeduplicationDecisionType, RelationType, createActionReference, createCanonicalEventIntelligence, createCanonicalEventIntelligenceId, createConflictDescriptor, createDeduplicationDecision, createEntityNormalizationResult, createEventCandidate, createEventCandidateId, createEventCluster, createEventClusterId, createEventConflict, createEventConflictId, createEventGraphNode, createEventGraphNodeId, createEventRelation, createEventRelationId, createEvidenceSpan, createGraphMetadata, createInterpretationMetadata, createInterpretedClaim, createInterpretedDate, createInterpretedEntity, createInterpretedNumber, createNormalizationMetadata, createObjectReference, createObservationInterpretation, createObservationInterpretationId, createSimilarityScore, createSubjectReference, createTemporalWindow, validateCanonicalEvent, validateDeduplicationDecision, validateEntityNormalizationResult, validateEventCandidate, validateEventCluster, validateEventConflict, validateEventGraphNode, validateEventRelation, validateObservationInterpretation, } from "@/event-intelligence/index.js";
import { createEntityVersion } from "@/value-objects/entity-version.vo.js";
import { createTimestamp } from "@/value-objects/timestamp.vo.js";
import { createSourceObservationId } from "@/observations/value-objects/source-observation-id.vo.js";
const sourceObservationId = createSourceObservationId("obs_abcdefg");
const baseEvidenceSpan = () => createEvidenceSpan({
    span_id: "span-1",
    source_observation_id: sourceObservationId,
    locator: "/article/body/0",
    start_offset: 0,
    end_offset: 10,
    extracted_text_nullable: "text",
    mapped_field_nullable: "subject_candidate",
});
const baseSubject = () => createSubjectReference({
    value: "Federal Reserve",
    normalized_value: "federal reserve",
    entity_type: "ORGANIZATION",
});
const baseAction = () => createActionReference({
    value: "raises",
    normalized_value: "raise",
});
const baseObject = () => createObjectReference({
    value: "interest rates",
    normalized_value: "interest rate",
    entity_type_nullable: "POLICY",
});
const baseTemporalWindow = () => createTemporalWindow({
    start_at: createTimestamp("2026-03-01T00:00:00.000Z"),
    end_at: createTimestamp("2026-03-31T23:59:59.000Z"),
});
const baseCandidate = () => createEventCandidate({
    id: createEventCandidateId("ecnd_abcdefg"),
    version: createEntityVersion(),
    observation_ids: [sourceObservationId],
    subject_candidate: baseSubject(),
    action_candidate: baseAction(),
    object_candidate_nullable: baseObject(),
    temporal_window_candidate: baseTemporalWindow(),
    jurisdiction_candidate_nullable: null,
    category_candidate: "MACRO_POLICY",
    extraction_confidence: 0.8,
    evidence_spans: [baseEvidenceSpan()],
    candidate_status: CandidateStatus.PROPOSED,
});
const baseCanonicalEvent = () => createCanonicalEventIntelligence({
    id: createCanonicalEventIntelligenceId("cevt_abcdefg"),
    version: createEntityVersion(),
    subject: baseSubject(),
    action: baseAction(),
    object_nullable: baseObject(),
    event_type: "POLICY_CHANGE",
    category: "MACRO_POLICY",
    time_window: baseTemporalWindow(),
    jurisdiction_nullable: null,
    supporting_candidates: [createEventCandidateId("ecnd_abcdefg")],
    supporting_observations: [sourceObservationId],
    conflicting_observations: [],
    canonicalization_confidence: 0.9,
    dedupe_cluster_id: createEventClusterId("eclu_abcdefg"),
    graph_node_id_nullable: null,
});
describe("event intelligence validators", () => {
    it("valid ObservationInterpretation", () => {
        const interpretation = createObservationInterpretation({
            id: createObservationInterpretationId("oint_abcdefg"),
            version: createEntityVersion(),
            source_observation_id: sourceObservationId,
            interpreted_entities: [
                createInterpretedEntity({
                    value: "Federal Reserve",
                    normalized_value: "federal reserve",
                    entity_type: "ORGANIZATION",
                    confidence: 0.82,
                    evidence_spans: [baseEvidenceSpan()],
                }),
            ],
            interpreted_dates: [
                createInterpretedDate({
                    original_value: "March 2026",
                    resolved_timestamp_nullable: "2026-03-01T00:00:00.000Z",
                    confidence: 0.7,
                    evidence_spans: [baseEvidenceSpan()],
                }),
            ],
            interpreted_numbers: [
                createInterpretedNumber({
                    original_value: 0.25,
                    unit_nullable: "PERCENT",
                    confidence: 0.72,
                    evidence_spans: [baseEvidenceSpan()],
                }),
            ],
            interpreted_claims: [
                createInterpretedClaim({
                    text: "Federal Reserve raises rates by 25 bps",
                    polarity: "AFFIRMATIVE",
                    confidence: 0.84,
                    evidence_spans: [baseEvidenceSpan()],
                }),
            ],
            semantic_confidence: 0.85,
            interpretation_metadata: createInterpretationMetadata({
                interpreter_version: "ei-v1",
                strategy_ids: ["deterministic-map-v1"],
                deterministic: true,
            }),
        });
        expect(validateObservationInterpretation(interpretation).isValid).toBe(true);
    });
    it("valid EventCandidate", () => {
        expect(validateEventCandidate(baseCandidate()).isValid).toBe(true);
    });
    it("invalid EventCandidate with missing observations", () => {
        const payload = {
            ...baseCandidate(),
            observation_ids: [],
        };
        const report = validateEventCandidate(payload);
        expect(report.isValid).toBe(false);
        expect(report.issues.map((issue) => issue.code)).toContain("MISSING_OBSERVATION_IDS");
    });
    it("valid CanonicalEvent", () => {
        expect(validateCanonicalEvent(baseCanonicalEvent()).isValid).toBe(true);
    });
    it("invalid CanonicalEvent without supporting candidates", () => {
        const payload = {
            ...baseCanonicalEvent(),
            supporting_candidates: [],
        };
        const report = validateCanonicalEvent(payload);
        expect(report.isValid).toBe(false);
        expect(report.issues.map((issue) => issue.code)).toContain("MISSING_SUPPORTING_CANDIDATES");
    });
    it("relation validation", () => {
        const validRelation = createEventRelation({
            id: createEventRelationId("erel_abcdefg"),
            source_event_id: createCanonicalEventIntelligenceId("cevt_abcdefg"),
            target_event_id: createCanonicalEventIntelligenceId("cevt_abcdefh"),
            relation_type: RelationType.DEPENDENCY,
            relation_confidence: 0.6,
        });
        expect(validateEventRelation(validRelation).isValid).toBe(true);
        const invalidRelation = {
            ...validRelation,
            source_event_id: createCanonicalEventIntelligenceId("cevt_abcdefg"),
            target_event_id: createCanonicalEventIntelligenceId("cevt_abcdefg"),
            relation_type: RelationType.DUPLICATE,
        };
        expect(validateEventRelation(invalidRelation).isValid).toBe(false);
    });
    it("cluster validation", () => {
        const validCluster = createEventCluster({
            cluster_id: createEventClusterId("eclu_abcdefg"),
            candidate_ids: [createEventCandidateId("ecnd_abcdefg")],
            similarity_scores: [],
            cluster_confidence: 0.74,
            cluster_status: ClusterStatus.OPEN,
        });
        expect(validateEventCluster(validCluster).isValid).toBe(true);
        const invalidCluster = { ...validCluster, candidate_ids: [] };
        expect(validateEventCluster(invalidCluster).isValid).toBe(false);
    });
    it("deduplication decision validation", () => {
        const validDecision = createDeduplicationDecision({
            candidate_id: createEventCandidateId("ecnd_abcdefg"),
            canonical_event_id: createCanonicalEventIntelligenceId("cevt_abcdefg"),
            decision_type: DeduplicationDecisionType.ATTACH_TO_EXISTING,
            decision_confidence: 0.91,
        });
        expect(validateDeduplicationDecision(validDecision).isValid).toBe(true);
    });
    it("entity normalization result validation", () => {
        const entity = createInterpretedEntity({
            value: "European Central Bank",
            normalized_value: "european central bank",
            entity_type: "ORGANIZATION",
            confidence: 0.88,
            evidence_spans: [baseEvidenceSpan()],
        });
        const validResult = createEntityNormalizationResult({
            normalized_entities: [entity],
            unresolved_entities: [],
            normalization_confidence: 0.9,
            normalization_metadata: createNormalizationMetadata({
                strategy_id: "norm-v1",
                resolver_version: "1.0.0",
            }),
        });
        expect(validateEntityNormalizationResult(validResult).isValid).toBe(true);
        const invalidResult = {
            ...validResult,
            normalized_entities: [],
            unresolved_entities: [],
        };
        expect(validateEntityNormalizationResult(invalidResult).isValid).toBe(false);
    });
    it("event graph node validation", () => {
        const validNode = createEventGraphNode({
            id: createEventGraphNodeId("egnd_abcdefg"),
            canonical_event_id: createCanonicalEventIntelligenceId("cevt_abcdefg"),
            incoming_relations: [createEventRelationId("erel_abcdefg")],
            outgoing_relations: [createEventRelationId("erel_abcdefh")],
            graph_metadata: createGraphMetadata({
                created_from_candidate_ids: [createEventCandidateId("ecnd_abcdefg")],
                relation_count: 2,
            }),
        });
        expect(validateEventGraphNode(validNode).isValid).toBe(true);
        const invalidNode = {
            ...validNode,
            outgoing_relations: [createEventRelationId("erel_abcdefg")],
        };
        expect(validateEventGraphNode(invalidNode).isValid).toBe(false);
    });
    it("conflict structure validation", () => {
        const validConflict = createEventConflict({
            id: createEventConflictId("ecfl_abcdefg"),
            canonical_event_id_nullable: createCanonicalEventIntelligenceId("cevt_abcdefg"),
            candidate_id_nullable: null,
            conflict_type: ConflictType.SEMANTIC_CONFLICT,
            description: "Sources disagree on action direction",
            conflicting_fields: [
                createConflictDescriptor({
                    field: "action",
                    left_value_nullable: "raises",
                    right_value_nullable: "cuts",
                }),
            ],
            related_observation_ids: [sourceObservationId],
            confidence: 0.77,
        });
        expect(validateEventConflict(validConflict).isValid).toBe(true);
    });
    it("invalid confidence bounds where relevant", () => {
        expect(() => createDeduplicationDecision({
            candidate_id: createEventCandidateId("ecnd_abcdefg"),
            canonical_event_id: createCanonicalEventIntelligenceId("cevt_abcdefg"),
            decision_type: DeduplicationDecisionType.CREATE_NEW_CANONICAL,
            decision_confidence: 1.01,
        })).toThrow();
    });
    it("supports deterministic similarity structures", () => {
        const score = createSimilarityScore({
            left_candidate_id: createEventCandidateId("ecnd_abcdefg"),
            right_candidate_id: createEventCandidateId("ecnd_abcdefh"),
            score: 0.5,
        });
        expect(score.score).toBe(0.5);
    });
});
//# sourceMappingURL=event-intelligence.spec.js.map