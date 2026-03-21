import type { CanonicalEventIntelligenceId } from "../../../event-intelligence/value-objects/event-intelligence-ids.vo.js";
import type { EntityVersion } from "../../../value-objects/entity-version.vo.js";
import { OpportunityStatus } from "../../enums/opportunity-status.enum.js";
import type { OpportunityAssessmentId } from "../../value-objects/market-design-ids.vo.js";
export type OpportunityAssessment = Readonly<{
    id: OpportunityAssessmentId;
    version: EntityVersion;
    canonical_event_id: CanonicalEventIntelligenceId;
    opportunity_status: OpportunityStatus;
    relevance_score: number;
    resolvability_score: number;
    timeliness_score: number;
    novelty_score: number;
    audience_potential_score: number;
    blocking_reasons: readonly string[];
    recommendation_notes_nullable: string | null;
}>;
export declare const createOpportunityAssessment: (input: OpportunityAssessment) => OpportunityAssessment;
//# sourceMappingURL=opportunity-assessment.entity.d.ts.map