import type { CandidateMarket } from "../../entities/candidate-market.entity.js";
import type { MarketOutcome } from "../../entities/market-outcome.entity.js";
import type { CanonicalEventIntelligence } from "../../event-intelligence/canonicalization/entities/canonical-event.entity.js";
import type { CanonicalEventIntelligenceId } from "../../event-intelligence/value-objects/event-intelligence-ids.vo.js";
import type { SourceClass } from "../../sources/enums/source-class.enum.js";
import type { CandidateMarketId } from "../../value-objects/candidate-market-id.vo.js";
import type { ClaimId } from "../../value-objects/claim-id.vo.js";
import type { Description } from "../../value-objects/description.vo.js";
import type { EventId } from "../../value-objects/event-id.vo.js";
import type { MarketResolutionBasis } from "../../enums/market-resolution-basis.enum.js";
import type { Slug } from "../../value-objects/slug.vo.js";
import type { Tag } from "../../value-objects/tag.vo.js";
import type { Timestamp } from "../../value-objects/timestamp.vo.js";
import type { Title } from "../../value-objects/title.vo.js";
import type { ContractSelection } from "../contract-selection/entities/contract-selection.entity.js";
import type { DeadlineResolution } from "../deadlines/entities/deadline-resolution.entity.js";
import type { OpportunityAssessment } from "../opportunity/entities/opportunity-assessment.entity.js";
import type { OutcomeGenerationResult } from "../outcomes/entities/outcome-generation-result.entity.js";
import type { PreliminaryScorecard } from "../scoring/entities/preliminary-scorecard.entity.js";
import type { SourceHierarchySelection } from "../source-hierarchy/entities/source-hierarchy-selection.entity.js";
import type { ContractType, OperativeContractType } from "../enums/contract-type.enum.js";
import type { DeadlineBasisType } from "../enums/deadline-basis-type.enum.js";
import type { SourcePriorityItem } from "../value-objects/source-priority.vo.js";

export type OpportunityAssessorInput = Readonly<{
  canonical_event: CanonicalEventIntelligence;
  relevance_score: number;
  resolvability_score: number;
  timeliness_score: number;
  novelty_score: number;
  audience_potential_score: number;
  blocking_reasons?: readonly string[];
  recommendation_notes_nullable?: string | null;
}>;

export interface OpportunityAssessor {
  assess(input: OpportunityAssessorInput): OpportunityAssessment;
}

export type ContractTypeSelectorInput = Readonly<{
  canonical_event: CanonicalEventIntelligence;
  preferred_contract_type: OperativeContractType;
  rejected_contract_types?: readonly OperativeContractType[];
  contract_type_reason: string;
  selection_confidence: number;
}>;

export interface ContractTypeSelector {
  select(input: ContractTypeSelectorInput): ContractSelection;
}

export type OutcomeGeneratorBinaryInput = Readonly<{
  yes_label?: string;
  no_label?: string;
}>;

export type OutcomeGeneratorMultiInput = Readonly<{
  outcomes: readonly {
    key: string;
    label: string;
    definition: string;
  }[];
}>;

export type OutcomeGeneratorScalarBracketInput = Readonly<{
  outcomes: readonly {
    key: string;
    label: string;
    definition: string;
    min_inclusive: number;
    max_exclusive: number;
  }[];
}>;

export type OutcomeGeneratorInput = Readonly<{
  contract_type: OperativeContractType;
  generation_confidence: number;
  validation_notes?: readonly string[];
  binary_input?: OutcomeGeneratorBinaryInput;
  multi_input?: OutcomeGeneratorMultiInput;
  scalar_bracket_input?: OutcomeGeneratorScalarBracketInput;
}>;

export interface OutcomeGenerator {
  generate(input: OutcomeGeneratorInput): OutcomeGenerationResult;
}

export type DeadlineResolverInput = Readonly<{
  canonical_event_id: CanonicalEventIntelligenceId;
  event_deadline: Timestamp;
  market_close_time: Timestamp;
  resolution_cutoff_nullable?: Timestamp | null;
  timezone: string;
  deadline_basis_type: DeadlineBasisType;
  deadline_basis_reference: string;
  confidence: number;
  warnings?: readonly string[];
}>;

export interface DeadlineResolver {
  resolve(input: DeadlineResolverInput): DeadlineResolution;
}

export type SourceHierarchySelectorInput = Readonly<{
  canonical_event_id: CanonicalEventIntelligenceId;
  candidate_source_classes: readonly SourceClass[];
  selected_source_priority: readonly SourcePriorityItem[];
  source_selection_reason: string;
  source_confidence: number;
}>;

export interface SourceHierarchySelector {
  select(input: SourceHierarchySelectorInput): SourceHierarchySelection;
}

export type MarketDraftBuilderInput = Readonly<{
  canonical_event: CanonicalEventIntelligence;
  opportunity_assessment: OpportunityAssessment;
  contract_selection: ContractSelection;
  outcome_generation_result: OutcomeGenerationResult;
  deadline_resolution: DeadlineResolution;
  source_hierarchy_selection: SourceHierarchySelection;
  preliminary_scorecard: PreliminaryScorecard;
  foundation_target: Readonly<{
    id: CandidateMarketId;
    claim_id: ClaimId;
    canonical_event_id: EventId;
    title: Title;
    slug: Slug;
    description: Description;
    resolution_basis: MarketResolutionBasis;
    categories: readonly string[];
    tags: readonly Tag[];
    draft_notes_nullable: string | null;
    entity_version: number;
    confidence_score: number;
    outcomes: readonly MarketOutcome[];
  }>;
}>;

export interface MarketDraftBuilder {
  build(input: MarketDraftBuilderInput): CandidateMarket;
}
