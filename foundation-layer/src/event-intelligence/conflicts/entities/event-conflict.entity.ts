import { ValidationError } from "../../../common/errors/validation-error.js";
import { deepFreeze } from "../../../common/utils/deep-freeze.js";
import type {
  CanonicalEventIntelligenceId,
  EventCandidateId,
  EventConflictId,
} from "../../value-objects/event-intelligence-ids.vo.js";
import type { SourceObservationId } from "../../../observations/value-objects/source-observation-id.vo.js";
import type { ConflictDescriptor } from "../../value-objects/shared-domain.vo.js";
import { assertConfidence01 } from "../../value-objects/shared-domain.vo.js";
import { ConflictType } from "../enums/conflict-type.enum.js";

export type EventConflict = Readonly<{
  id: EventConflictId;
  canonical_event_id_nullable: CanonicalEventIntelligenceId | null;
  candidate_id_nullable: EventCandidateId | null;
  conflict_type: ConflictType;
  description: string;
  conflicting_fields: readonly ConflictDescriptor[];
  related_observation_ids: readonly SourceObservationId[];
  confidence: number;
}>;

export const createEventConflict = (input: EventConflict): EventConflict => {
  if (input.canonical_event_id_nullable === null && input.candidate_id_nullable === null) {
    throw new ValidationError(
      "INVALID_EVENT_CONFLICT",
      "canonical_event_id_nullable or candidate_id_nullable must be provided",
    );
  }
  if (input.description.trim().length === 0) {
    throw new ValidationError("INVALID_EVENT_CONFLICT", "description must be non-empty");
  }
  assertConfidence01(input.confidence, "confidence");
  return deepFreeze({
    ...input,
    description: input.description.trim(),
    conflicting_fields: [...input.conflicting_fields],
    related_observation_ids: [...input.related_observation_ids],
  });
};
