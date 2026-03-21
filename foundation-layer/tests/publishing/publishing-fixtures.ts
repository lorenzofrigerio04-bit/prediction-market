import { createCanonicalEventIntelligence } from "@/event-intelligence/canonicalization/entities/canonical-event.entity.js";
import {
  createActionReference,
  createSubjectReference,
  createTemporalWindow,
} from "@/event-intelligence/value-objects/shared-domain.vo.js";
import {
  createCanonicalEventIntelligenceId,
  createEventCandidateId,
  createEventClusterId,
} from "@/event-intelligence/value-objects/event-intelligence-ids.vo.js";
import { createSourceObservationId } from "@/observations/value-objects/source-observation-id.vo.js";
import {
  createClaimId,
  createConfidenceScore,
  createDescription,
  createEventId,
  createResolutionWindow,
  createSlug,
  createTag,
  createTitle,
} from "@/index.js";
import { createCandidateMarketId } from "@/value-objects/candidate-market-id.vo.js";
import { createEntityVersion } from "@/value-objects/entity-version.vo.js";
import { createOutcomeId } from "@/value-objects/outcome-id.vo.js";
import { createTimestamp } from "@/value-objects/timestamp.vo.js";
import { MarketResolutionBasis } from "@/enums/market-resolution-basis.enum.js";
import { MarketType } from "@/enums/market-type.enum.js";
import { ContractSelectionStatus } from "@/market-design/enums/contract-selection-status.enum.js";
import { ContractType } from "@/market-design/enums/contract-type.enum.js";
import { DeadlineBasisType } from "@/market-design/enums/deadline-basis-type.enum.js";
import { OpportunityStatus } from "@/market-design/enums/opportunity-status.enum.js";
import { OutcomeExclusivityPolicy } from "@/market-design/enums/outcome-exclusivity-policy.enum.js";
import { OutcomeExhaustivenessPolicy } from "@/market-design/enums/outcome-exhaustiveness-policy.enum.js";
import { createContractSelection } from "@/market-design/contract-selection/entities/contract-selection.entity.js";
import { createDeadlineResolution } from "@/market-design/deadlines/entities/deadline-resolution.entity.js";
import type { MarketDraftPipeline } from "@/market-design/drafting/entities/market-draft-pipeline.entity.js";
import { createOpportunityAssessment } from "@/market-design/opportunity/entities/opportunity-assessment.entity.js";
import { createOutcomeDefinition } from "@/market-design/outcomes/entities/outcome-definition.entity.js";
import { createOutcomeGenerationResult } from "@/market-design/outcomes/entities/outcome-generation-result.entity.js";
import { createPreliminaryScorecard } from "@/market-design/scoring/entities/preliminary-scorecard.entity.js";
import { createSourceHierarchySelection } from "@/market-design/source-hierarchy/entities/source-hierarchy-selection.entity.js";
import {
  createContractSelectionId,
  createDeadlineResolutionId,
  createOpportunityAssessmentId,
  createOutcomeGenerationResultId,
  createSourceHierarchySelectionId,
} from "@/market-design/value-objects/market-design-ids.vo.js";
import { createOutcomeKey } from "@/market-design/value-objects/outcome-key.vo.js";
import { SourceClass } from "@/sources/enums/source-class.enum.js";
import { candidateMarketFactory } from "@/factories/candidate-market.factory.js";
import { createMarketOutcome } from "@/entities/market-outcome.entity.js";
import { CandidateOutcomeType } from "@/enums/candidate-outcome-type.enum.js";

export const makeMarketDraftPipeline = (): MarketDraftPipeline => {
  const canonicalEvent = createCanonicalEventIntelligence({
    id: createCanonicalEventIntelligenceId("cevt_publish0001"),
    version: createEntityVersion(1),
    subject: createSubjectReference({
      value: "Federal Reserve",
      normalized_value: "federal reserve",
      entity_type: "organization",
    }),
    action: createActionReference({
      value: "announce policy rate decision",
      normalized_value: "announce policy rate decision",
    }),
    object_nullable: null,
    event_type: "economic-policy",
    category: "macro",
    time_window: createTemporalWindow({
      start_at: createTimestamp("2026-07-01T10:00:00.000Z"),
      end_at: createTimestamp("2026-07-31T10:00:00.000Z"),
    }),
    jurisdiction_nullable: null,
    supporting_candidates: [createEventCandidateId("ecnd_publish0001")],
    supporting_observations: [createSourceObservationId("obs_publish0001")],
    conflicting_observations: [],
    canonicalization_confidence: 0.9,
    dedupe_cluster_id: createEventClusterId("eclu_publish0001"),
    graph_node_id_nullable: null,
  });

  const opportunityAssessment = createOpportunityAssessment({
    id: createOpportunityAssessmentId("opp_publish0001"),
    version: createEntityVersion(1),
    canonical_event_id: canonicalEvent.id,
    opportunity_status: OpportunityStatus.ELIGIBLE,
    relevance_score: 0.8,
    resolvability_score: 0.9,
    timeliness_score: 0.8,
    novelty_score: 0.7,
    audience_potential_score: 0.75,
    blocking_reasons: [],
    recommendation_notes_nullable: null,
  });

  const contractSelection = createContractSelection({
    id: createContractSelectionId("csel_publish0001"),
    version: createEntityVersion(1),
    canonical_event_id: canonicalEvent.id,
    status: ContractSelectionStatus.SELECTED,
    selected_contract_type: ContractType.BINARY,
    contract_type_reason: "Binary outcome from deterministic market design.",
    selection_confidence: 0.9,
    rejected_contract_types: [],
    selection_metadata: {},
  });

  const outcomeGenerationResult = createOutcomeGenerationResult({
    id: createOutcomeGenerationResultId("ogr_publish0001"),
    contract_type: ContractType.BINARY,
    outcomes: [
      createOutcomeDefinition({
        id: createOutcomeId("out_pubyes001"),
        outcome_key: createOutcomeKey("yes"),
        display_label: "Yes",
        semantic_definition: "Condition occurs before deadline.",
        ordering_index_nullable: 0,
        range_definition_nullable: null,
        active: true,
      }),
      createOutcomeDefinition({
        id: createOutcomeId("out_pubno0001"),
        outcome_key: createOutcomeKey("no"),
        display_label: "No",
        semantic_definition: "Condition does not occur before deadline.",
        ordering_index_nullable: 1,
        range_definition_nullable: null,
        active: true,
      }),
    ],
    exhaustiveness_policy: OutcomeExhaustivenessPolicy.EXHAUSTIVE,
    exclusivity_policy: OutcomeExclusivityPolicy.MUTUALLY_EXCLUSIVE,
    generation_confidence: 0.9,
    validation_notes: [],
  });

  const deadlineResolution = createDeadlineResolution({
    id: createDeadlineResolutionId("dlr_publish0001"),
    canonical_event_id: canonicalEvent.id,
    event_deadline: createTimestamp("2026-07-31T10:00:00.000Z"),
    market_close_time: createTimestamp("2026-07-31T09:00:00.000Z"),
    resolution_cutoff_nullable: createTimestamp("2026-08-01T10:00:00.000Z"),
    timezone: "UTC",
    deadline_basis_type: DeadlineBasisType.EVENT_TIME,
    deadline_basis_reference: "canonical_event.time_window.end_at",
    confidence: 0.85,
    warnings: [],
  });

  const sourceHierarchySelection = createSourceHierarchySelection({
    id: createSourceHierarchySelectionId("shs_publish0001"),
    canonical_event_id: canonicalEvent.id,
    candidate_source_classes: [SourceClass.OFFICIAL, SourceClass.MEDIA],
    selected_source_priority: [
      { source_class: SourceClass.OFFICIAL, priority_rank: 1 },
      { source_class: SourceClass.MEDIA, priority_rank: 2 },
    ],
    source_selection_reason: "Official source first, media as fallback.",
    source_confidence: 0.88,
  });

  const preliminaryScorecard = createPreliminaryScorecard({
    clarity_score: 0.8,
    resolvability_score: 0.9,
    novelty_score: 0.75,
    liquidity_potential_score: 0.7,
    ambiguity_risk_score: 0.2,
    duplicate_risk_score: 0.1,
    editorial_value_score: 0.8,
    final_publish_score: 0.85,
  });

  const foundationCandidateMarket = candidateMarketFactory({
    id: createCandidateMarketId("mkt_publish0001"),
    claimId: createClaimId("clm_publish0001"),
    canonicalEventId: createEventId("evt_publish0001"),
    title: createTitle("Will the Federal Reserve announce a policy rate decision by July 31, 2026?"),
    slug: createSlug("fed-rate-decision-july-31-2026"),
    description: createDescription("Deterministic candidate from market-design pipeline."),
    resolutionBasis: MarketResolutionBasis.OFFICIAL_SOURCE,
    resolutionWindow: createResolutionWindow(
      "2026-07-01T10:00:00.000Z",
      "2026-08-01T10:00:00.000Z",
    ),
    categories: ["macro"],
    tags: [createTag("macro"), createTag("fed")],
    draftNotes: null,
    entityVersion: createEntityVersion(1),
    confidenceScore: createConfidenceScore(0.83),
    marketType: MarketType.BINARY,
    outcomes: [
      createMarketOutcome({
        id: createOutcomeId("out_pubmkt001"),
        outcomeType: CandidateOutcomeType.YES,
        label: "Yes",
        shortLabel: "Y",
        description: null,
        orderIndex: 0,
        probabilityHint: null,
        entityVersion: createEntityVersion(1),
      }),
      createMarketOutcome({
        id: createOutcomeId("out_pubmkt002"),
        outcomeType: CandidateOutcomeType.NO,
        label: "No",
        shortLabel: "N",
        description: null,
        orderIndex: 1,
        probabilityHint: null,
        entityVersion: createEntityVersion(1),
      }),
    ],
  });

  return {
    canonical_event: canonicalEvent,
    opportunity_assessment: opportunityAssessment,
    contract_selection: contractSelection,
    outcome_generation_result: outcomeGenerationResult,
    deadline_resolution: deadlineResolution,
    source_hierarchy_selection: sourceHierarchySelection,
    preliminary_scorecard: preliminaryScorecard,
    foundation_candidate_market: foundationCandidateMarket,
  };
};
