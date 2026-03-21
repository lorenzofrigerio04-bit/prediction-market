import type { CandidateMarket } from "../../../entities/candidate-market.entity.js";
import type { CanonicalEventIntelligence } from "../../../event-intelligence/canonicalization/entities/canonical-event.entity.js";
import type { ContractSelection } from "../../contract-selection/entities/contract-selection.entity.js";
import type { DeadlineResolution } from "../../deadlines/entities/deadline-resolution.entity.js";
import type { OpportunityAssessment } from "../../opportunity/entities/opportunity-assessment.entity.js";
import type { OutcomeGenerationResult } from "../../outcomes/entities/outcome-generation-result.entity.js";
import type { PreliminaryScorecard } from "../../scoring/entities/preliminary-scorecard.entity.js";
import type { SourceHierarchySelection } from "../../source-hierarchy/entities/source-hierarchy-selection.entity.js";
export type MarketDraftPipeline = Readonly<{
    canonical_event: CanonicalEventIntelligence;
    opportunity_assessment: OpportunityAssessment;
    contract_selection: ContractSelection;
    outcome_generation_result: OutcomeGenerationResult;
    deadline_resolution: DeadlineResolution;
    source_hierarchy_selection: SourceHierarchySelection;
    preliminary_scorecard: PreliminaryScorecard;
    foundation_candidate_market: CandidateMarket;
}>;
//# sourceMappingURL=market-draft-pipeline.entity.d.ts.map