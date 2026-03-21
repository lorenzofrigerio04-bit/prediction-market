import { ValidationError } from "../../../common/errors/validation-error.js";
import { deepFreeze } from "../../../common/utils/deep-freeze.js";
import type { EntityVersion } from "../../../value-objects/entity-version.vo.js";
import type { SourceObservationId } from "../../../observations/value-objects/source-observation-id.vo.js";
import type {
  CanonicalEventIntelligenceId,
  EventCandidateId,
  EventClusterId,
  EventGraphNodeId,
} from "../../value-objects/event-intelligence-ids.vo.js";
import type {
  ActionReference,
  JurisdictionReference,
  ObjectReference,
  SubjectReference,
  TemporalWindow,
} from "../../value-objects/shared-domain.vo.js";
import { assertConfidence01 } from "../../value-objects/shared-domain.vo.js";

export type CanonicalEventIntelligence = Readonly<{
  id: CanonicalEventIntelligenceId;
  version: EntityVersion;
  subject: SubjectReference;
  action: ActionReference;
  object_nullable: ObjectReference | null;
  event_type: string;
  category: string;
  time_window: TemporalWindow;
  jurisdiction_nullable: JurisdictionReference | null;
  supporting_candidates: readonly EventCandidateId[];
  supporting_observations: readonly SourceObservationId[];
  conflicting_observations: readonly SourceObservationId[];
  canonicalization_confidence: number;
  dedupe_cluster_id: EventClusterId;
  graph_node_id_nullable: EventGraphNodeId | null;
}>;

export type CanonicalEvent = CanonicalEventIntelligence;

const hasUniqueValues = (values: readonly string[]): boolean => new Set(values).size === values.length;

export const createCanonicalEventIntelligence = (
  input: CanonicalEventIntelligence,
): CanonicalEventIntelligence => {
  if (input.supporting_candidates.length === 0) {
    throw new ValidationError(
      "INVALID_CANONICAL_EVENT",
      "supporting_candidates must contain at least one candidate",
    );
  }
  if (input.supporting_observations.length === 0) {
    throw new ValidationError(
      "INVALID_CANONICAL_EVENT",
      "supporting_observations must contain at least one observation",
    );
  }
  if (!hasUniqueValues(input.supporting_candidates)) {
    throw new ValidationError(
      "INVALID_CANONICAL_EVENT",
      "supporting_candidates must contain unique values",
    );
  }
  if (!hasUniqueValues(input.supporting_observations)) {
    throw new ValidationError(
      "INVALID_CANONICAL_EVENT",
      "supporting_observations must contain unique values",
    );
  }
  if (input.event_type.trim().length === 0 || input.category.trim().length === 0) {
    throw new ValidationError("INVALID_CANONICAL_EVENT", "event_type and category must be non-empty");
  }
  assertConfidence01(input.canonicalization_confidence, "canonicalization_confidence");
  return deepFreeze({
    ...input,
    event_type: input.event_type.trim(),
    category: input.category.trim(),
    supporting_candidates: [...input.supporting_candidates],
    supporting_observations: [...input.supporting_observations],
    conflicting_observations: [...input.conflicting_observations],
  });
};

export const createCanonicalEvent = (input: CanonicalEvent): CanonicalEvent =>
  createCanonicalEventIntelligence(input);
