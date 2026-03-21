import { ValidationError } from "../../../common/errors/validation-error.js";
import { deepFreeze } from "../../../common/utils/deep-freeze.js";
import type { EntityVersion } from "../../../value-objects/entity-version.vo.js";
import type { Timestamp } from "../../../value-objects/timestamp.vo.js";
import type { PublishableCandidateId } from "../../../publishing/value-objects/publishing-ids.vo.js";
import type {
  ControlledStateTransitionId,
  EditorialActorId,
  AuditRecordId,
} from "../../value-objects/editorial-ids.vo.js";

export type ControlledStateTransition = Readonly<{
  id: ControlledStateTransitionId;
  version: EntityVersion;
  publishable_candidate_id: PublishableCandidateId;
  from_state: string;
  to_state: string;
  transition_at: Timestamp;
  transitioned_by: EditorialActorId;
  transition_reason: string;
  audit_record_id: AuditRecordId;
}>;

export const createControlledStateTransition = (
  input: ControlledStateTransition,
): ControlledStateTransition => {
  if (
    input.from_state.trim().length === 0 ||
    input.to_state.trim().length === 0 ||
    input.transition_reason.trim().length === 0
  ) {
    throw new ValidationError(
      "INVALID_CONTROLLED_STATE_TRANSITION",
      "from_state, to_state, and transition_reason are required",
    );
  }
  if (input.from_state === input.to_state) {
    throw new ValidationError(
      "INVALID_CONTROLLED_STATE_TRANSITION",
      "from_state and to_state must differ",
    );
  }
  return deepFreeze(input);
};
