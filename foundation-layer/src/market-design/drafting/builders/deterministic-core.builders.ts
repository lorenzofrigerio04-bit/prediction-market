import { candidateMarketFactory } from "../../../factories/candidate-market.factory.js";
import {
  CandidateOutcomeType,
} from "../../../enums/candidate-outcome-type.enum.js";
import { MarketResolutionBasis } from "../../../enums/market-resolution-basis.enum.js";
import { MarketType } from "../../../enums/market-type.enum.js";
import { createMarketOutcome } from "../../../entities/market-outcome.entity.js";
import { createConfidenceScore } from "../../../value-objects/confidence-score.vo.js";
import { createEntityVersion } from "../../../value-objects/entity-version.vo.js";
import { createOutcomeId } from "../../../value-objects/outcome-id.vo.js";
import { ContractSelectionStatus } from "../../enums/contract-selection-status.enum.js";
import { ContractType } from "../../enums/contract-type.enum.js";
import { OpportunityStatus } from "../../enums/opportunity-status.enum.js";
import { OutcomeExclusivityPolicy } from "../../enums/outcome-exclusivity-policy.enum.js";
import { OutcomeExhaustivenessPolicy } from "../../enums/outcome-exhaustiveness-policy.enum.js";
import type {
  ContractTypeSelector,
  ContractTypeSelectorInput,
  DeadlineResolver,
  DeadlineResolverInput,
  MarketDraftBuilder,
  MarketDraftBuilderInput,
  OpportunityAssessor,
  OpportunityAssessorInput,
  OutcomeGenerator,
  OutcomeGeneratorInput,
  SourceHierarchySelector,
  SourceHierarchySelectorInput,
} from "../../interfaces/pipeline.interfaces.js";
import {
  createContractSelection,
  type ContractSelection,
} from "../../contract-selection/entities/contract-selection.entity.js";
import {
  createDeadlineResolution,
  type DeadlineResolution,
} from "../../deadlines/entities/deadline-resolution.entity.js";
import { createOpportunityAssessment } from "../../opportunity/entities/opportunity-assessment.entity.js";
import {
  createOutcomeDefinition,
  type OutcomeDefinition,
} from "../../outcomes/entities/outcome-definition.entity.js";
import { createOutcomeGenerationResult } from "../../outcomes/entities/outcome-generation-result.entity.js";
import { createSourceHierarchySelection } from "../../source-hierarchy/entities/source-hierarchy-selection.entity.js";
import { createContractSelectionId, createDeadlineResolutionId, createOpportunityAssessmentId, createOutcomeGenerationResultId, createSourceHierarchySelectionId } from "../../value-objects/market-design-ids.vo.js";
import { createOutcomeKey } from "../../value-objects/outcome-key.vo.js";
import { createRangeDefinition } from "../../value-objects/range-definition.vo.js";

const deriveOpportunityStatus = (
  blockingReasons: readonly string[],
  aggregateScore: number,
): OpportunityStatus => {
  if (blockingReasons.length > 0) {
    return OpportunityStatus.BLOCKED;
  }
  if (aggregateScore >= 0.6) {
    return OpportunityStatus.ELIGIBLE;
  }
  return OpportunityStatus.REVIEW_REQUIRED;
};

export class DeterministicOpportunityAssessor implements OpportunityAssessor {
  assess(input: OpportunityAssessorInput) {
    const blockingReasons = input.blocking_reasons ?? [];
    const aggregateScore =
      (input.relevance_score +
        input.resolvability_score +
        input.timeliness_score +
        input.novelty_score +
        input.audience_potential_score) /
      5;
    return createOpportunityAssessment({
      id: createOpportunityAssessmentId(`opp_${input.canonical_event.id.slice(5)}oa`),
      version: createEntityVersion(1),
      canonical_event_id: input.canonical_event.id,
      opportunity_status: deriveOpportunityStatus(blockingReasons, aggregateScore),
      relevance_score: input.relevance_score,
      resolvability_score: input.resolvability_score,
      timeliness_score: input.timeliness_score,
      novelty_score: input.novelty_score,
      audience_potential_score: input.audience_potential_score,
      blocking_reasons: blockingReasons,
      recommendation_notes_nullable: input.recommendation_notes_nullable ?? null,
    });
  }
}

export class DeterministicContractTypeSelector implements ContractTypeSelector {
  select(input: ContractTypeSelectorInput): ContractSelection {
    return createContractSelection({
      id: createContractSelectionId(`csel_${input.canonical_event.id.slice(5)}ct`),
      version: createEntityVersion(1),
      canonical_event_id: input.canonical_event.id,
      status: ContractSelectionStatus.SELECTED,
      selected_contract_type: input.preferred_contract_type,
      contract_type_reason: input.contract_type_reason,
      selection_confidence: input.selection_confidence,
      rejected_contract_types: input.rejected_contract_types ?? [],
      selection_metadata: {
        event_type: input.canonical_event.event_type,
      },
    });
  }
}

const toOutcomeId = (suffix: string): string => `out_${suffix.padEnd(6, "0").slice(0, 6)}`;

const buildBinaryOutcomes = (input: OutcomeGeneratorInput): readonly OutcomeDefinition[] => {
  const yesLabel = input.binary_input?.yes_label ?? "Yes";
  const noLabel = input.binary_input?.no_label ?? "No";
  return [
    createOutcomeDefinition({
      id: createOutcomeId(toOutcomeId("yes001")),
      outcome_key: createOutcomeKey("yes"),
      display_label: yesLabel,
      semantic_definition: "Resolves true when the statement is satisfied.",
      ordering_index_nullable: 0,
      range_definition_nullable: null,
      active: true,
    }),
    createOutcomeDefinition({
      id: createOutcomeId(toOutcomeId("no0001")),
      outcome_key: createOutcomeKey("no"),
      display_label: noLabel,
      semantic_definition: "Resolves false when the statement is not satisfied.",
      ordering_index_nullable: 1,
      range_definition_nullable: null,
      active: true,
    }),
  ];
};

const buildMultiOutcomes = (input: OutcomeGeneratorInput): readonly OutcomeDefinition[] => {
  const outcomes = input.multi_input?.outcomes ?? [];
  return outcomes.map((outcome, index) =>
    createOutcomeDefinition({
      id: createOutcomeId(toOutcomeId(`mul${index + 1}`)),
      outcome_key: createOutcomeKey(outcome.key),
      display_label: outcome.label,
      semantic_definition: outcome.definition,
      ordering_index_nullable: index,
      range_definition_nullable: null,
      active: true,
    }),
  );
};

const buildScalarBracketOutcomes = (input: OutcomeGeneratorInput): readonly OutcomeDefinition[] => {
  const outcomes = input.scalar_bracket_input?.outcomes ?? [];
  return outcomes.map((outcome, index) =>
    createOutcomeDefinition({
      id: createOutcomeId(toOutcomeId(`scl${index + 1}`)),
      outcome_key: createOutcomeKey(outcome.key),
      display_label: outcome.label,
      semantic_definition: outcome.definition,
      ordering_index_nullable: index,
      range_definition_nullable: createRangeDefinition({
        min_inclusive: outcome.min_inclusive,
        max_exclusive: outcome.max_exclusive,
        label_nullable: null,
      }),
      active: true,
    }),
  );
};

export class DeterministicOutcomeGenerator implements OutcomeGenerator {
  generate(input: OutcomeGeneratorInput) {
    const outcomes =
      input.contract_type === ContractType.BINARY
        ? buildBinaryOutcomes(input)
        : input.contract_type === ContractType.MULTI_OUTCOME
          ? buildMultiOutcomes(input)
          : buildScalarBracketOutcomes(input);

    return createOutcomeGenerationResult({
      id: createOutcomeGenerationResultId("ogr_outcome0001"),
      contract_type: input.contract_type,
      outcomes,
      exhaustiveness_policy: OutcomeExhaustivenessPolicy.EXHAUSTIVE,
      exclusivity_policy: OutcomeExclusivityPolicy.MUTUALLY_EXCLUSIVE,
      generation_confidence: input.generation_confidence,
      validation_notes: [...(input.validation_notes ?? [])],
    });
  }
}

export class DeterministicDeadlineResolver implements DeadlineResolver {
  resolve(input: DeadlineResolverInput): DeadlineResolution {
    return createDeadlineResolution({
      id: createDeadlineResolutionId("dlr_deadln0001"),
      canonical_event_id: input.canonical_event_id,
      event_deadline: input.event_deadline,
      market_close_time: input.market_close_time,
      resolution_cutoff_nullable: input.resolution_cutoff_nullable ?? null,
      timezone: input.timezone,
      deadline_basis_type: input.deadline_basis_type,
      deadline_basis_reference: input.deadline_basis_reference,
      confidence: input.confidence,
      warnings: [...(input.warnings ?? [])],
    });
  }
}

export class DeterministicSourceHierarchySelector implements SourceHierarchySelector {
  select(input: SourceHierarchySelectorInput) {
    return createSourceHierarchySelection({
      id: createSourceHierarchySelectionId("shs_source00001"),
      canonical_event_id: input.canonical_event_id,
      candidate_source_classes: [...input.candidate_source_classes],
      selected_source_priority: [...input.selected_source_priority],
      source_selection_reason: input.source_selection_reason,
      source_confidence: input.source_confidence,
    });
  }
}

const toMarketType = (contractType: ContractType): MarketType => {
  if (contractType === ContractType.BINARY) {
    return MarketType.BINARY;
  }
  if (contractType === ContractType.SCALAR_BRACKET) {
    return MarketType.NUMERIC;
  }
  return MarketType.CATEGORICAL;
};

const toCandidateOutcomeType = (contractType: ContractType): CandidateOutcomeType => {
  if (contractType === ContractType.BINARY) {
    return CandidateOutcomeType.YES;
  }
  if (contractType === ContractType.SCALAR_BRACKET) {
    return CandidateOutcomeType.NUMERIC;
  }
  return CandidateOutcomeType.CATEGORICAL;
};

export class FoundationCompatibleMarketDraftBuilder implements MarketDraftBuilder {
  build(input: MarketDraftBuilderInput) {
    const basis =
      input.foundation_target.resolution_basis ??
      MarketResolutionBasis.MULTI_SOURCE_CONSENSUS;
    const outcomes = input.outcome_generation_result.outcomes.map((outcome, index) =>
      createMarketOutcome({
        id: createOutcomeId(`out_${(index + 1).toString().padStart(6, "0")}`),
        outcomeType:
          input.contract_selection.selected_contract_type === ContractType.BINARY
            ? index === 0
              ? CandidateOutcomeType.YES
              : CandidateOutcomeType.NO
            : toCandidateOutcomeType(input.contract_selection.selected_contract_type),
        label: outcome.display_label,
        shortLabel: null,
        description: outcome.semantic_definition,
        orderIndex: outcome.ordering_index_nullable ?? index,
        probabilityHint: null,
        entityVersion: createEntityVersion(input.foundation_target.entity_version),
      }),
    );

    return candidateMarketFactory({
      id: input.foundation_target.id,
      claimId: input.foundation_target.claim_id,
      canonicalEventId: input.foundation_target.canonical_event_id,
      title: input.foundation_target.title,
      slug: input.foundation_target.slug,
      description: input.foundation_target.description,
      resolutionBasis: basis,
      resolutionWindow: {
        openAt: input.deadline_resolution.market_close_time,
        closeAt: input.deadline_resolution.event_deadline,
      },
      outcomes,
      marketType: toMarketType(input.contract_selection.selected_contract_type),
      categories: [...input.foundation_target.categories],
      tags: [...input.foundation_target.tags],
      confidenceScore: createConfidenceScore(input.foundation_target.confidence_score),
      draftNotes:
        input.foundation_target.draft_notes_nullable ??
        `publish_score=${input.preliminary_scorecard.final_publish_score.toFixed(2)}`,
      entityVersion: createEntityVersion(input.foundation_target.entity_version),
    });
  }
}
