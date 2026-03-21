import { ValidationError } from "../../../common/errors/validation-error.js";
import { deepFreeze } from "../../../common/utils/deep-freeze.js";
import type { CanonicalEventIntelligenceId } from "../../../event-intelligence/value-objects/event-intelligence-ids.vo.js";
import type { EntityVersion } from "../../../value-objects/entity-version.vo.js";
import { OpportunityStatus } from "../../enums/opportunity-status.enum.js";
import type { OpportunityAssessmentId } from "../../value-objects/market-design-ids.vo.js";
import { createBlockingReasons } from "../../value-objects/reason-collections.vo.js";
import { createScore01 } from "../../value-objects/score.vo.js";

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

export const createOpportunityAssessment = (input: OpportunityAssessment): OpportunityAssessment => {
  createScore01(input.relevance_score, "relevance_score");
  createScore01(input.resolvability_score, "resolvability_score");
  createScore01(input.timeliness_score, "timeliness_score");
  createScore01(input.novelty_score, "novelty_score");
  createScore01(input.audience_potential_score, "audience_potential_score");
  const blockingReasons = createBlockingReasons(input.blocking_reasons);

  if (input.opportunity_status === OpportunityStatus.BLOCKED && blockingReasons.length === 0) {
    throw new ValidationError(
      "INVALID_BLOCKING_CONSISTENCY",
      "blocking_reasons must be non-empty when opportunity_status is blocked",
    );
  }
  if (input.opportunity_status === OpportunityStatus.ELIGIBLE && blockingReasons.length > 0) {
    throw new ValidationError(
      "INVALID_BLOCKING_CONSISTENCY",
      "blocking_reasons must be empty when opportunity_status is eligible",
    );
  }

  return deepFreeze({
    ...input,
    blocking_reasons: [...blockingReasons],
    recommendation_notes_nullable:
      input.recommendation_notes_nullable === null ? null : input.recommendation_notes_nullable.trim(),
  });
};
