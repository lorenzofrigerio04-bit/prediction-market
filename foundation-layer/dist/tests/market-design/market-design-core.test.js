import { describe, expect, it } from "vitest";
import { createCanonicalEventIntelligence } from "../../src/event-intelligence/canonicalization/entities/canonical-event.entity.js";
import { createActionReference, createSubjectReference, createTemporalWindow, } from "../../src/event-intelligence/value-objects/shared-domain.vo.js";
import { createCanonicalEventIntelligenceId, createEventCandidateId, createEventClusterId, } from "../../src/event-intelligence/value-objects/event-intelligence-ids.vo.js";
import { createSourceObservationId } from "../../src/observations/value-objects/source-observation-id.vo.js";
import { createClaimId } from "../../src/value-objects/claim-id.vo.js";
import { createDescription } from "../../src/value-objects/description.vo.js";
import { MarketResolutionBasis } from "../../src/enums/market-resolution-basis.enum.js";
import { createEventId } from "../../src/value-objects/event-id.vo.js";
import { createSlug } from "../../src/value-objects/slug.vo.js";
import { createTag } from "../../src/value-objects/tag.vo.js";
import { createTitle } from "../../src/value-objects/title.vo.js";
import { createCandidateMarketId } from "../../src/value-objects/candidate-market-id.vo.js";
import { createEntityVersion } from "../../src/value-objects/entity-version.vo.js";
import { createOutcomeId } from "../../src/value-objects/outcome-id.vo.js";
import { createTimestamp } from "../../src/value-objects/timestamp.vo.js";
import { createOpportunityAssessment } from "../../src/market-design/opportunity/entities/opportunity-assessment.entity.js";
import { validateOpportunityAssessment } from "../../src/market-design/opportunity/validators/validate-opportunity-assessment.js";
import { ContractType, DeadlineBasisType, OpportunityStatus, OutcomeExclusivityPolicy, OutcomeExhaustivenessPolicy, } from "../../src/market-design/index.js";
import { createOpportunityAssessmentId, createContractSelectionId, createOutcomeGenerationResultId, createDeadlineResolutionId, createSourceHierarchySelectionId } from "../../src/market-design/value-objects/market-design-ids.vo.js";
import { createContractSelection } from "../../src/market-design/contract-selection/entities/contract-selection.entity.js";
import { validateContractSelection } from "../../src/market-design/contract-selection/validators/validate-contract-selection.js";
import { ContractSelectionStatus } from "../../src/market-design/enums/contract-selection-status.enum.js";
import { createOutcomeDefinition } from "../../src/market-design/outcomes/entities/outcome-definition.entity.js";
import { createOutcomeKey } from "../../src/market-design/value-objects/outcome-key.vo.js";
import { createOutcomeGenerationResult } from "../../src/market-design/outcomes/entities/outcome-generation-result.entity.js";
import { validateOutcomeGenerationResult } from "../../src/market-design/outcomes/validators/validate-outcome-generation-result.js";
import { createDeadlineResolution } from "../../src/market-design/deadlines/entities/deadline-resolution.entity.js";
import { validateDeadlineResolution } from "../../src/market-design/deadlines/validators/validate-deadline-resolution.js";
import { createSourceHierarchySelection } from "../../src/market-design/source-hierarchy/entities/source-hierarchy-selection.entity.js";
import { SourceClass } from "../../src/sources/enums/source-class.enum.js";
import { validateSourceHierarchySelection } from "../../src/market-design/source-hierarchy/validators/validate-source-hierarchy-selection.js";
import { FoundationCompatibleMarketDraftBuilder, validateMarketDraftCompatibility, } from "../../src/market-design/index.js";
import { createPreliminaryScorecard } from "../../src/market-design/scoring/entities/preliminary-scorecard.entity.js";
import { validatePreliminaryScorecard } from "../../src/market-design/scoring/validators/validate-preliminary-scorecard.js";
import { createRangeDefinition } from "../../src/market-design/value-objects/range-definition.vo.js";
const makeCanonicalEvent = () => createCanonicalEventIntelligence({
    id: createCanonicalEventIntelligenceId("cevt_marketdsgn001"),
    version: createEntityVersion(1),
    subject: createSubjectReference({
        value: "Federal Reserve",
        normalized_value: "federal reserve",
        entity_type: "organization",
    }),
    action: createActionReference({
        value: "announce rate decision",
        normalized_value: "announce rate decision",
    }),
    object_nullable: null,
    event_type: "economic-policy",
    category: "macro",
    time_window: createTemporalWindow({
        start_at: createTimestamp("2026-06-01T10:00:00.000Z"),
        end_at: createTimestamp("2026-06-20T10:00:00.000Z"),
    }),
    jurisdiction_nullable: null,
    supporting_candidates: [createEventCandidateId("ecnd_marketdsgn001")],
    supporting_observations: [createSourceObservationId("obs_marketdsgn001")],
    conflicting_observations: [],
    canonicalization_confidence: 0.9,
    dedupe_cluster_id: createEventClusterId("eclu_marketdsgn001"),
    graph_node_id_nullable: null,
});
const makeValidOpportunityAssessment = () => createOpportunityAssessment({
    id: createOpportunityAssessmentId("opp_marketdsgn001"),
    version: createEntityVersion(1),
    canonical_event_id: makeCanonicalEvent().id,
    opportunity_status: OpportunityStatus.ELIGIBLE,
    relevance_score: 0.8,
    resolvability_score: 0.9,
    timeliness_score: 0.7,
    novelty_score: 0.6,
    audience_potential_score: 0.8,
    blocking_reasons: [],
    recommendation_notes_nullable: null,
});
describe("Market Design Core v1", () => {
    it("valid OpportunityAssessment", () => {
        const assessment = makeValidOpportunityAssessment();
        const report = validateOpportunityAssessment(assessment);
        expect(report.isValid).toBe(true);
    });
    it("invalid OpportunityAssessment with blocking inconsistency", () => {
        const invalid = {
            ...makeValidOpportunityAssessment(),
            opportunity_status: OpportunityStatus.BLOCKED,
            blocking_reasons: [],
        };
        const report = validateOpportunityAssessment(invalid);
        expect(report.isValid).toBe(false);
    });
    it("valid ContractSelection", () => {
        const selection = createContractSelection({
            id: createContractSelectionId("csel_marketdsgn001"),
            version: createEntityVersion(1),
            canonical_event_id: makeCanonicalEvent().id,
            status: ContractSelectionStatus.SELECTED,
            selected_contract_type: ContractType.BINARY,
            contract_type_reason: "Binary proposition with clear yes/no resolution.",
            selection_confidence: 0.9,
            rejected_contract_types: [ContractType.MULTI_OUTCOME],
            selection_metadata: {},
        });
        const report = validateContractSelection(selection);
        expect(report.isValid).toBe(true);
    });
    it("invalid ContractSelection with unsupported contract type", () => {
        const invalid = {
            id: createContractSelectionId("csel_marketdsgn002"),
            version: createEntityVersion(1),
            canonical_event_id: makeCanonicalEvent().id,
            status: ContractSelectionStatus.SELECTED,
            selected_contract_type: ContractType.RACE,
            contract_type_reason: "Future type not yet operational",
            selection_confidence: 0.9,
            rejected_contract_types: [],
            selection_metadata: {},
        };
        const report = validateContractSelection(invalid);
        expect(report.isValid).toBe(false);
    });
    it("valid OutcomeGenerationResult for binary", () => {
        const result = createOutcomeGenerationResult({
            id: createOutcomeGenerationResultId("ogr_marketdsgn001"),
            contract_type: ContractType.BINARY,
            outcomes: [
                createOutcomeDefinition({
                    id: createOutcomeId("out_binyes001"),
                    outcome_key: createOutcomeKey("yes"),
                    display_label: "Yes",
                    semantic_definition: "Condition occurs",
                    ordering_index_nullable: 0,
                    range_definition_nullable: null,
                    active: true,
                }),
                createOutcomeDefinition({
                    id: createOutcomeId("out_binno0001"),
                    outcome_key: createOutcomeKey("no"),
                    display_label: "No",
                    semantic_definition: "Condition does not occur",
                    ordering_index_nullable: 1,
                    range_definition_nullable: null,
                    active: true,
                }),
            ],
            exhaustiveness_policy: OutcomeExhaustivenessPolicy.EXHAUSTIVE,
            exclusivity_policy: OutcomeExclusivityPolicy.MUTUALLY_EXCLUSIVE,
            generation_confidence: 0.8,
            validation_notes: [],
        });
        const report = validateOutcomeGenerationResult(result);
        expect(report.isValid).toBe(true);
    });
    it("valid OutcomeGenerationResult for multi_outcome", () => {
        const result = createOutcomeGenerationResult({
            id: createOutcomeGenerationResultId("ogr_marketdsgn002"),
            contract_type: ContractType.MULTI_OUTCOME,
            outcomes: [
                createOutcomeDefinition({
                    id: createOutcomeId("out_mulone001"),
                    outcome_key: createOutcomeKey("outcome_a"),
                    display_label: "Outcome A",
                    semantic_definition: "First option",
                    ordering_index_nullable: 0,
                    range_definition_nullable: null,
                    active: true,
                }),
                createOutcomeDefinition({
                    id: createOutcomeId("out_multwo001"),
                    outcome_key: createOutcomeKey("outcome_b"),
                    display_label: "Outcome B",
                    semantic_definition: "Second option",
                    ordering_index_nullable: 1,
                    range_definition_nullable: null,
                    active: true,
                }),
            ],
            exhaustiveness_policy: OutcomeExhaustivenessPolicy.EXHAUSTIVE,
            exclusivity_policy: OutcomeExclusivityPolicy.MUTUALLY_EXCLUSIVE,
            generation_confidence: 0.8,
            validation_notes: [],
        });
        const report = validateOutcomeGenerationResult(result);
        expect(report.isValid).toBe(true);
    });
    it("invalid OutcomeGenerationResult with empty outcomes", () => {
        const invalid = {
            id: createOutcomeGenerationResultId("ogr_marketdsgn003"),
            contract_type: ContractType.MULTI_OUTCOME,
            outcomes: [],
            exhaustiveness_policy: OutcomeExhaustivenessPolicy.EXHAUSTIVE,
            exclusivity_policy: OutcomeExclusivityPolicy.MUTUALLY_EXCLUSIVE,
            generation_confidence: 0.8,
            validation_notes: [],
        };
        const report = validateOutcomeGenerationResult(invalid);
        expect(report.isValid).toBe(false);
    });
    it("valid DeadlineResolution", () => {
        const deadline = createDeadlineResolution({
            id: createDeadlineResolutionId("dlr_marketdsgn001"),
            canonical_event_id: makeCanonicalEvent().id,
            event_deadline: createTimestamp("2026-06-20T10:00:00.000Z"),
            market_close_time: createTimestamp("2026-06-20T09:00:00.000Z"),
            resolution_cutoff_nullable: createTimestamp("2026-06-22T10:00:00.000Z"),
            timezone: "UTC",
            deadline_basis_type: DeadlineBasisType.EVENT_TIME,
            deadline_basis_reference: "canonical_event.time_window.end_at",
            confidence: 0.9,
            warnings: [],
        });
        const report = validateDeadlineResolution(deadline);
        expect(report.isValid).toBe(true);
    });
    it("invalid DeadlineResolution with missing timezone or invalid confidence", () => {
        const invalid = {
            id: createDeadlineResolutionId("dlr_marketdsgn002"),
            canonical_event_id: makeCanonicalEvent().id,
            event_deadline: createTimestamp("2026-06-20T10:00:00.000Z"),
            market_close_time: createTimestamp("2026-06-20T09:00:00.000Z"),
            resolution_cutoff_nullable: null,
            timezone: "",
            deadline_basis_type: DeadlineBasisType.EVENT_TIME,
            deadline_basis_reference: "canonical_event.time_window.end_at",
            confidence: 1.2,
            warnings: [],
        };
        const report = validateDeadlineResolution(invalid);
        expect(report.isValid).toBe(false);
    });
    it("valid SourceHierarchySelection", () => {
        const selection = createSourceHierarchySelection({
            id: createSourceHierarchySelectionId("shs_marketdsgn001"),
            canonical_event_id: makeCanonicalEvent().id,
            candidate_source_classes: [SourceClass.OFFICIAL, SourceClass.MEDIA],
            selected_source_priority: [
                { source_class: SourceClass.OFFICIAL, priority_rank: 1 },
                { source_class: SourceClass.MEDIA, priority_rank: 2 },
            ],
            source_selection_reason: "Prefer official first, then media confirmation.",
            source_confidence: 0.85,
        });
        const report = validateSourceHierarchySelection(selection);
        expect(report.isValid).toBe(true);
    });
    it("MarketDraft builder compatibility test with Foundation Layer model", () => {
        const builder = new FoundationCompatibleMarketDraftBuilder();
        const candidateMarket = builder.build({
            canonical_event: makeCanonicalEvent(),
            opportunity_assessment: makeValidOpportunityAssessment(),
            contract_selection: createContractSelection({
                id: createContractSelectionId("csel_marketdsgn003"),
                version: createEntityVersion(1),
                canonical_event_id: makeCanonicalEvent().id,
                status: ContractSelectionStatus.SELECTED,
                selected_contract_type: ContractType.BINARY,
                contract_type_reason: "Binary contract",
                selection_confidence: 0.9,
                rejected_contract_types: [],
                selection_metadata: {},
            }),
            outcome_generation_result: createOutcomeGenerationResult({
                id: createOutcomeGenerationResultId("ogr_marketdsgn004"),
                contract_type: ContractType.BINARY,
                outcomes: [
                    createOutcomeDefinition({
                        id: createOutcomeId("out_bldyes001"),
                        outcome_key: createOutcomeKey("yes"),
                        display_label: "Yes",
                        semantic_definition: "Condition occurs",
                        ordering_index_nullable: 0,
                        range_definition_nullable: null,
                        active: true,
                    }),
                    createOutcomeDefinition({
                        id: createOutcomeId("out_bldno0001"),
                        outcome_key: createOutcomeKey("no"),
                        display_label: "No",
                        semantic_definition: "Condition does not occur",
                        ordering_index_nullable: 1,
                        range_definition_nullable: null,
                        active: true,
                    }),
                ],
                exhaustiveness_policy: OutcomeExhaustivenessPolicy.EXHAUSTIVE,
                exclusivity_policy: OutcomeExclusivityPolicy.MUTUALLY_EXCLUSIVE,
                generation_confidence: 0.9,
                validation_notes: [],
            }),
            deadline_resolution: createDeadlineResolution({
                id: createDeadlineResolutionId("dlr_marketdsgn003"),
                canonical_event_id: makeCanonicalEvent().id,
                event_deadline: createTimestamp("2026-06-20T10:00:00.000Z"),
                market_close_time: createTimestamp("2026-06-20T09:00:00.000Z"),
                resolution_cutoff_nullable: createTimestamp("2026-06-22T10:00:00.000Z"),
                timezone: "UTC",
                deadline_basis_type: DeadlineBasisType.EVENT_TIME,
                deadline_basis_reference: "canonical_event.time_window.end_at",
                confidence: 0.9,
                warnings: [],
            }),
            source_hierarchy_selection: createSourceHierarchySelection({
                id: createSourceHierarchySelectionId("shs_marketdsgn002"),
                canonical_event_id: makeCanonicalEvent().id,
                candidate_source_classes: [SourceClass.OFFICIAL, SourceClass.MEDIA],
                selected_source_priority: [
                    { source_class: SourceClass.OFFICIAL, priority_rank: 1 },
                    { source_class: SourceClass.MEDIA, priority_rank: 2 },
                ],
                source_selection_reason: "Official then media",
                source_confidence: 0.9,
            }),
            preliminary_scorecard: createPreliminaryScorecard({
                clarity_score: 0.8,
                resolvability_score: 0.85,
                novelty_score: 0.7,
                liquidity_potential_score: 0.65,
                ambiguity_risk_score: 0.2,
                duplicate_risk_score: 0.1,
                editorial_value_score: 0.8,
                final_publish_score: 0.82,
            }),
            foundation_target: {
                id: createCandidateMarketId("mkt_marketdsgn001"),
                claim_id: createClaimId("clm_marketdsgn001"),
                canonical_event_id: createEventId("evt_marketdsgn001"),
                title: createTitle("Will the policy be announced by June 20, 2026?"),
                slug: createSlug("policy-announcement-june-20-2026"),
                description: createDescription("Deterministic market draft generated from canonical event."),
                resolution_basis: MarketResolutionBasis.OFFICIAL_SOURCE,
                categories: ["macro"],
                tags: [createTag("macro"), createTag("policy")],
                draft_notes_nullable: null,
                entity_version: 1,
                confidence_score: 0.8,
                outcomes: [],
            },
        });
        const report = validateMarketDraftCompatibility(candidateMarket);
        expect(report.isValid).toBe(true);
    });
    it("invalid OutcomeGenerationResult with duplicate outcome keys", () => {
        const invalid = {
            id: createOutcomeGenerationResultId("ogr_marketdsgn005"),
            contract_type: ContractType.MULTI_OUTCOME,
            outcomes: [
                createOutcomeDefinition({
                    id: createOutcomeId("out_dupone001"),
                    outcome_key: createOutcomeKey("dup_key"),
                    display_label: "A",
                    semantic_definition: "A",
                    ordering_index_nullable: 0,
                    range_definition_nullable: null,
                    active: true,
                }),
                createOutcomeDefinition({
                    id: createOutcomeId("out_duptwo001"),
                    outcome_key: createOutcomeKey("dup_key"),
                    display_label: "B",
                    semantic_definition: "B",
                    ordering_index_nullable: 1,
                    range_definition_nullable: null,
                    active: true,
                }),
            ],
            exhaustiveness_policy: OutcomeExhaustivenessPolicy.EXHAUSTIVE,
            exclusivity_policy: OutcomeExclusivityPolicy.MUTUALLY_EXCLUSIVE,
            generation_confidence: 0.7,
            validation_notes: [],
        };
        const report = validateOutcomeGenerationResult(invalid);
        expect(report.isValid).toBe(false);
    });
    it("invalid ContractSelection when selected appears in rejected", () => {
        const invalid = {
            id: createContractSelectionId("csel_marketdsgn004"),
            version: createEntityVersion(1),
            canonical_event_id: makeCanonicalEvent().id,
            status: ContractSelectionStatus.SELECTED,
            selected_contract_type: ContractType.BINARY,
            contract_type_reason: "Invalid rejected mismatch",
            selection_confidence: 0.8,
            rejected_contract_types: [ContractType.BINARY],
            selection_metadata: {},
        };
        const report = validateContractSelection(invalid);
        expect(report.isValid).toBe(false);
    });
    it("invalid score ranges in PreliminaryScorecard", () => {
        const invalid = {
            clarity_score: 2,
            resolvability_score: 0.8,
            novelty_score: 0.7,
            liquidity_potential_score: 0.7,
            ambiguity_risk_score: 0.2,
            duplicate_risk_score: 0.2,
            editorial_value_score: 0.7,
            final_publish_score: 0.8,
        };
        const report = validatePreliminaryScorecard(invalid);
        expect(report.isValid).toBe(false);
    });
    it("invalid source priority mismatch", () => {
        const invalid = {
            id: createSourceHierarchySelectionId("shs_marketdsgn003"),
            canonical_event_id: makeCanonicalEvent().id,
            candidate_source_classes: [SourceClass.MEDIA],
            selected_source_priority: [{ source_class: SourceClass.OFFICIAL, priority_rank: 1 }],
            source_selection_reason: "Mismatch on purpose",
            source_confidence: 0.7,
        };
        const report = validateSourceHierarchySelection(invalid);
        expect(report.isValid).toBe(false);
    });
    it("invalid scalar bracket overlap structure", () => {
        const invalid = {
            id: createOutcomeGenerationResultId("ogr_marketdsgn006"),
            contract_type: ContractType.SCALAR_BRACKET,
            outcomes: [
                createOutcomeDefinition({
                    id: createOutcomeId("out_scaone001"),
                    outcome_key: createOutcomeKey("low"),
                    display_label: "0-10",
                    semantic_definition: "Low range",
                    ordering_index_nullable: 0,
                    range_definition_nullable: createRangeDefinition({
                        min_inclusive: 0,
                        max_exclusive: 10,
                        label_nullable: null,
                    }),
                    active: true,
                }),
                createOutcomeDefinition({
                    id: createOutcomeId("out_scatwo001"),
                    outcome_key: createOutcomeKey("mid"),
                    display_label: "5-15",
                    semantic_definition: "Overlapping range",
                    ordering_index_nullable: 1,
                    range_definition_nullable: createRangeDefinition({
                        min_inclusive: 5,
                        max_exclusive: 15,
                        label_nullable: null,
                    }),
                    active: true,
                }),
            ],
            exhaustiveness_policy: OutcomeExhaustivenessPolicy.EXHAUSTIVE,
            exclusivity_policy: OutcomeExclusivityPolicy.MUTUALLY_EXCLUSIVE,
            generation_confidence: 0.7,
            validation_notes: [],
        };
        const report = validateOutcomeGenerationResult(invalid);
        expect(report.isValid).toBe(false);
    });
});
//# sourceMappingURL=market-design-core.test.js.map