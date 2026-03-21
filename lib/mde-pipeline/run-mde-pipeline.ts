/**
 * MDE pipeline runner: SourceObservation → … → PublishableCandidate.
 * Runs interpretation, event candidate, canonical event, opportunity, contract selection,
 * outcome generation, deadline/source/scorecard, market draft, then title/summary/rulebook
 * and PublishableCandidate builder.
 */

import type { SourceObservation } from "@market-design-engine/foundation-layer";
import {
  ContractType,
  CandidateOutcomeType,
  DeadlineBasisType,
  MarketResolutionBasis,
  SourceClass,
  createClaimId,
  createCandidateMarketId,
  createDescription,
  createEntityVersion,
  createEventId,
  createMarketOutcome,
  createOutcomeId,
  createSlug,
  createTag,
  createTitle,
  createTimestamp,
  marketDesign,
  publishing,
} from "@market-design-engine/foundation-layer";
import { interpretObservation } from "./observation-interpreter";
import { interpretationToEventCandidate } from "./interpretation-to-candidate";
import { candidateToCanonicalEvent } from "./candidate-to-canonical";

const {
  DeterministicOpportunityAssessor,
  DeterministicContractTypeSelector,
  DeterministicOutcomeGenerator,
  DeterministicDeadlineResolver,
  DeterministicSourceHierarchySelector,
  FoundationCompatibleMarketDraftBuilder,
  createPreliminaryScorecard,
} = marketDesign;

const {
  DeterministicTitleGenerator,
  DeterministicResolutionSummaryGenerator,
  DeterministicRulebookCompiler,
  DeterministicPublishableCandidateBuilder,
  DeterministicTimePolicyRenderer,
  DeterministicSourcePolicyRenderer,
  DeterministicEdgeCaseRenderer,
} = publishing;

export type PublishableCandidate = ReturnType<
  typeof DeterministicPublishableCandidateBuilder.prototype.build
>;

export interface RunMdePipelineResult {
  publishableCandidate: PublishableCandidate;
  pipeline: {
    canonical_event: { category: string };
    deadline_resolution: { market_close_time: string };
    outcome_generation_result: {
      outcomes: readonly { display_label: string; semantic_definition: string }[];
    };
  };
  titleSet: { display_title: string; canonical_title: string };
  resolutionSummary: { one_line_resolution_summary: string };
}

export interface RunMdePipelineParams {
  observation: SourceObservation;
  /** Default: BINARY */
  preferredContractType?: ContractType;
  /** Event deadline (resolution); default 30 days from now */
  eventDeadline?: Date;
  /** Market close time; default 1h before event deadline */
  marketCloseTime?: Date;
}

/**
 * Run the full MDE pipeline from one SourceObservation to PublishableCandidate
 * and artifacts (pipeline, titleSet, resolutionSummary) for app publish adapter.
 * Uses binary contract by default; deterministic title/summary/rulebook generation.
 */
export function runMdePipelineFromObservation(
  params: RunMdePipelineParams
): RunMdePipelineResult {
  const {
    observation,
    preferredContractType = ContractType.BINARY,
    eventDeadline = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    marketCloseTime = new Date(eventDeadline.getTime() - 60 * 60 * 1000),
  } = params;

  const interpretation = interpretObservation(observation);
  const candidate = interpretationToEventCandidate(interpretation);
  const canonicalEvent = candidateToCanonicalEvent(candidate);

  const opportunityAssessor = new DeterministicOpportunityAssessor();
  const opportunityAssessment = opportunityAssessor.assess({
    canonical_event: canonicalEvent,
    relevance_score: 0.8,
    resolvability_score: 0.85,
    timeliness_score: 0.75,
    novelty_score: 0.7,
    audience_potential_score: 0.75,
  });

  const contractSelector = new DeterministicContractTypeSelector();
  const contractSelection = contractSelector.select({
    canonical_event: canonicalEvent,
    preferred_contract_type: preferredContractType,
    contract_type_reason: "Single-observation deterministic path.",
    selection_confidence: 0.8,
  });

  const outcomeGenerator = new DeterministicOutcomeGenerator();
  const outcomeGenerationResult = outcomeGenerator.generate({
    contract_type: contractSelection.selected_contract_type,
    generation_confidence: 0.85,
    binary_input: { yes_label: "Yes", no_label: "No" },
  });

  const deadlineResolver = new DeterministicDeadlineResolver();
  const deadlineResolution = deadlineResolver.resolve({
    canonical_event_id: canonicalEvent.id,
    event_deadline: createTimestamp(eventDeadline),
    market_close_time: createTimestamp(marketCloseTime),
    resolution_cutoff_nullable: createTimestamp(new Date(eventDeadline.getTime() + 24 * 60 * 60 * 1000)),
    timezone: "Europe/Rome",
    deadline_basis_type: DeadlineBasisType.EVENT_TIME,
    deadline_basis_reference: "canonical_event.time_window.end_at",
    confidence: 0.85,
  });

  const sourceHierarchySelector = new DeterministicSourceHierarchySelector();
  const sourceHierarchySelection = sourceHierarchySelector.select({
    canonical_event_id: canonicalEvent.id,
    candidate_source_classes: [SourceClass.MEDIA, SourceClass.OFFICIAL],
    selected_source_priority: [
      { source_class: SourceClass.MEDIA, priority_rank: 1 },
      { source_class: SourceClass.OFFICIAL, priority_rank: 2 },
    ],
    source_selection_reason: "MDE pipeline default.",
    source_confidence: 0.7,
  });

  const preliminaryScorecard = createPreliminaryScorecard({
    clarity_score: 0.8,
    resolvability_score: 0.85,
    novelty_score: 0.75,
    liquidity_potential_score: 0.7,
    ambiguity_risk_score: 0.2,
    duplicate_risk_score: 0.1,
    editorial_value_score: 0.75,
    final_publish_score: 0.8,
  });

  const subject = canonicalEvent.subject?.value?.trim().toLowerCase();
  const actionValue = canonicalEvent.action?.value?.trim();
  const isReportedEventSubject = subject === "reported event";
  const titleText = (() => {
    if (actionValue && isReportedEventSubject) {
      const t = actionValue.endsWith("?") ? actionValue : `${actionValue}?`;
      return t.slice(0, 200);
    }
    if (canonicalEvent.subject?.value && actionValue) {
      return `${canonicalEvent.subject.value}: ${actionValue}?`.slice(0, 200);
    }
    return "Will the reported event occur?";
  })();
  const slugBase = titleText.replace(/\?/g, "").slice(0, 100);
  const marketId = createCandidateMarketId(`mkt_${canonicalEvent.id.slice(5).slice(0, 12)}`);
  const foundationTarget = {
    id: marketId,
    claim_id: createClaimId(`clm_${canonicalEvent.id.slice(5).slice(0, 12)}`),
    canonical_event_id: createEventId(`evt_${canonicalEvent.id.slice(5).slice(0, 12)}`),
    title: createTitle(titleText),
    slug: createSlug(slugBase),
    description: createDescription(
      outcomeGenerationResult.outcomes.map((o) => o.display_label).join(" / ") || "Binary outcome."
    ),
    resolution_basis: MarketResolutionBasis.MULTI_SOURCE_CONSENSUS,
    categories: [canonicalEvent.category],
    tags: [createTag("mde-pipeline")],
    draft_notes_nullable: null,
    entity_version: 1,
    confidence_score: 0.8,
    outcomes: outcomeGenerationResult.outcomes.map((outcome, index) =>
      createMarketOutcome({
        id: createOutcomeId(`out_${(index + 1).toString().padStart(6, "0")}`),
        outcomeType:
          index === 0 ? CandidateOutcomeType.YES : CandidateOutcomeType.NO,
        label: outcome.display_label,
        shortLabel: index === 0 ? "Y" : "N",
        description: outcome.semantic_definition,
        orderIndex: index,
        probabilityHint: null,
        entityVersion: createEntityVersion(1),
      })
    ),
  };

  const marketDraftBuilder = new FoundationCompatibleMarketDraftBuilder();
  const foundationCandidateMarket = marketDraftBuilder.build({
    canonical_event: canonicalEvent,
    opportunity_assessment: opportunityAssessment,
    contract_selection: contractSelection,
    outcome_generation_result: outcomeGenerationResult,
    deadline_resolution: deadlineResolution,
    source_hierarchy_selection: sourceHierarchySelection,
    preliminary_scorecard: preliminaryScorecard,
    foundation_target: foundationTarget,
  });

  const pipeline = {
    canonical_event: canonicalEvent,
    opportunity_assessment: opportunityAssessment,
    contract_selection: contractSelection,
    outcome_generation_result: outcomeGenerationResult,
    deadline_resolution: deadlineResolution,
    source_hierarchy_selection: sourceHierarchySelection,
    preliminary_scorecard: preliminaryScorecard,
    foundation_candidate_market: foundationCandidateMarket,
  };

  const titleGenerator = new DeterministicTitleGenerator();
  const titleSet = titleGenerator.generate(pipeline);

  const summaryGenerator = new DeterministicResolutionSummaryGenerator();
  const resolutionSummary = summaryGenerator.generate(pipeline);

  const rulebookCompiler = new DeterministicRulebookCompiler(
    new DeterministicTimePolicyRenderer(),
    new DeterministicSourcePolicyRenderer(),
    new DeterministicEdgeCaseRenderer()
  );
  const rulebookCompilation = rulebookCompiler.compile({ pipeline });

  const publishableCandidateBuilder = new DeterministicPublishableCandidateBuilder();
  const publishableCandidate = publishableCandidateBuilder.build({
    pipeline,
    title_set: titleSet,
    resolution_summary: resolutionSummary,
    rulebook_compilation: rulebookCompilation,
  });

  return {
    publishableCandidate,
    pipeline,
    titleSet,
    resolutionSummary,
  };
}
