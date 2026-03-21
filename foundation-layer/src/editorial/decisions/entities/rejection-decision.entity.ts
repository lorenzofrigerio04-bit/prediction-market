import { ValidationError } from "../../../common/errors/validation-error.js";
import { deepFreeze } from "../../../common/utils/deep-freeze.js";
import type { EntityVersion } from "../../../value-objects/entity-version.vo.js";
import type { Timestamp } from "../../../value-objects/timestamp.vo.js";
import type { PublishableCandidateId } from "../../../publishing/value-objects/publishing-ids.vo.js";
import type { ReasonCode } from "../../enums/reason-code.enum.js";
import type { RejectionDecisionId, EditorialActorId } from "../../value-objects/editorial-ids.vo.js";

export type RejectionDecision = Readonly<{
  id: RejectionDecisionId;
  version: EntityVersion;
  publishable_candidate_id: PublishableCandidateId;
  rejected_by: EditorialActorId;
  rejected_at: Timestamp;
  rejection_reason_codes: readonly ReasonCode[];
  rejection_notes_nullable: string | null;
  rework_required: boolean;
}>;

export const createRejectionDecision = (input: RejectionDecision): RejectionDecision => {
  if (input.rejection_reason_codes.length === 0) {
    throw new ValidationError(
      "INVALID_REJECTION_DECISION",
      "rejection_reason_codes must contain at least one reason code",
    );
  }
  return deepFreeze({
    ...input,
    rejection_reason_codes: deepFreeze([...input.rejection_reason_codes]),
  });
};
