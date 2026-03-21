import { MarketResolutionBasis } from "../../../enums/market-resolution-basis.enum.js";
import { MarketType } from "../../../enums/market-type.enum.js";
import { ContractType } from "../../enums/contract-type.enum.js";
import { OpportunityStatus } from "../../enums/opportunity-status.enum.js";
import { OutcomeExclusivityPolicy } from "../../enums/outcome-exclusivity-policy.enum.js";
import { OutcomeExhaustivenessPolicy } from "../../enums/outcome-exhaustiveness-policy.enum.js";
import type { ContractTypeSelector, ContractTypeSelectorInput, DeadlineResolver, DeadlineResolverInput, MarketDraftBuilder, MarketDraftBuilderInput, OpportunityAssessor, OpportunityAssessorInput, OutcomeGenerator, OutcomeGeneratorInput, SourceHierarchySelector, SourceHierarchySelectorInput } from "../../interfaces/pipeline.interfaces.js";
import { type ContractSelection } from "../../contract-selection/entities/contract-selection.entity.js";
import { type DeadlineResolution } from "../../deadlines/entities/deadline-resolution.entity.js";
import { type OutcomeDefinition } from "../../outcomes/entities/outcome-definition.entity.js";
export declare class DeterministicOpportunityAssessor implements OpportunityAssessor {
    assess(input: OpportunityAssessorInput): Readonly<{
        id: import("../../index.js").OpportunityAssessmentId;
        version: import("../../../index.js").EntityVersion;
        canonical_event_id: import("../../../event-intelligence/index.js").CanonicalEventIntelligenceId;
        opportunity_status: OpportunityStatus;
        relevance_score: number;
        resolvability_score: number;
        timeliness_score: number;
        novelty_score: number;
        audience_potential_score: number;
        blocking_reasons: readonly string[];
        recommendation_notes_nullable: string | null;
    }>;
}
export declare class DeterministicContractTypeSelector implements ContractTypeSelector {
    select(input: ContractTypeSelectorInput): ContractSelection;
}
export declare class DeterministicOutcomeGenerator implements OutcomeGenerator {
    generate(input: OutcomeGeneratorInput): Readonly<{
        id: import("../../index.js").OutcomeGenerationResultId;
        contract_type: ContractType;
        outcomes: readonly OutcomeDefinition[];
        exhaustiveness_policy: OutcomeExhaustivenessPolicy;
        exclusivity_policy: OutcomeExclusivityPolicy;
        generation_confidence: number;
        validation_notes: readonly string[];
    }>;
}
export declare class DeterministicDeadlineResolver implements DeadlineResolver {
    resolve(input: DeadlineResolverInput): DeadlineResolution;
}
export declare class DeterministicSourceHierarchySelector implements SourceHierarchySelector {
    select(input: SourceHierarchySelectorInput): Readonly<{
        id: import("../../index.js").SourceHierarchySelectionId;
        canonical_event_id: import("../../../event-intelligence/index.js").CanonicalEventIntelligenceId;
        candidate_source_classes: readonly import("../../../index.js").SourceClass[];
        selected_source_priority: readonly import("../../index.js").SourcePriorityItem[];
        source_selection_reason: string;
        source_confidence: number;
    }>;
}
export declare class FoundationCompatibleMarketDraftBuilder implements MarketDraftBuilder {
    build(input: MarketDraftBuilderInput): Readonly<{
        id: import("../../../index.js").CandidateMarketId;
        claimId: import("../../../index.js").ClaimId;
        canonicalEventId: import("../../../index.js").EventId;
        title: import("../../../index.js").Title;
        slug: import("../../../index.js").Slug;
        description: import("../../../index.js").Description;
        resolutionBasis: MarketResolutionBasis;
        resolutionWindow: import("../../../index.js").ResolutionWindow;
        outcomes: readonly import("../../../index.js").MarketOutcome[];
        marketType: MarketType;
        categories: readonly string[];
        tags: readonly import("../../../index.js").Tag[];
        confidenceScore: import("../../../index.js").ConfidenceScore;
        draftNotes: string | null;
        entityVersion: import("../../../index.js").EntityVersion;
    }>;
}
//# sourceMappingURL=deterministic-core.builders.d.ts.map