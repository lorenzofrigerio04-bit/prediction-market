import { deepFreeze } from "../../../common/utils/deep-freeze.js";
import { ValidationError } from "../../../common/errors/validation-error.js";
import type { CanonicalEventIntelligenceId, EventCandidateId } from "../../value-objects/event-intelligence-ids.vo.js";
import { assertConfidence01 } from "../../value-objects/shared-domain.vo.js";
import { DeduplicationDecisionType } from "../enums/deduplication-decision-type.enum.js";

export type DeduplicationDecision = Readonly<{
  candidate_id: EventCandidateId;
  canonical_event_id: CanonicalEventIntelligenceId;
  decision_type: DeduplicationDecisionType;
  decision_confidence: number;
}>;

export const createDeduplicationDecision = (
  input: DeduplicationDecision,
): DeduplicationDecision => {
  if (input.candidate_id.length === 0 || input.canonical_event_id.length === 0) {
    throw new ValidationError(
      "INVALID_DEDUPLICATION_DECISION",
      "candidate_id and canonical_event_id must be present",
    );
  }
  assertConfidence01(input.decision_confidence, "decision_confidence");
  return deepFreeze(input);
};
