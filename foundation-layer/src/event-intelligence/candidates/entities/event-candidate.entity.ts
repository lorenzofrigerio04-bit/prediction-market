import { ValidationError } from "../../../common/errors/validation-error.js";
import { deepFreeze } from "../../../common/utils/deep-freeze.js";
import type { EntityVersion } from "../../../value-objects/entity-version.vo.js";
import type { SourceObservationId } from "../../../observations/value-objects/source-observation-id.vo.js";
import type { EventCandidateId } from "../../value-objects/event-intelligence-ids.vo.js";
import type {
  ActionReference,
  EvidenceSpan,
  JurisdictionReference,
  ObjectReference,
  SubjectReference,
  TemporalWindow,
} from "../../value-objects/shared-domain.vo.js";
import { assertConfidence01 } from "../../value-objects/shared-domain.vo.js";
import { CandidateStatus } from "../enums/candidate-status.enum.js";

export type EventCandidate = Readonly<{
  id: EventCandidateId;
  version: EntityVersion;
  observation_ids: readonly SourceObservationId[];
  subject_candidate: SubjectReference;
  action_candidate: ActionReference;
  object_candidate_nullable: ObjectReference | null;
  temporal_window_candidate: TemporalWindow;
  jurisdiction_candidate_nullable: JurisdictionReference | null;
  category_candidate: string;
  extraction_confidence: number;
  evidence_spans: readonly EvidenceSpan[];
  candidate_status: CandidateStatus;
}>;

const uniqueValues = (values: readonly string[]): boolean => new Set(values).size === values.length;

export const createEventCandidate = (input: EventCandidate): EventCandidate => {
  if (input.observation_ids.length === 0) {
    throw new ValidationError(
      "INVALID_EVENT_CANDIDATE",
      "observation_ids must contain at least one observation",
    );
  }
  if (!uniqueValues(input.observation_ids)) {
    throw new ValidationError("INVALID_EVENT_CANDIDATE", "observation_ids must be unique");
  }
  if (input.evidence_spans.length === 0) {
    throw new ValidationError(
      "INVALID_EVENT_CANDIDATE",
      "evidence_spans must contain at least one evidence span",
    );
  }
  if (input.category_candidate.trim().length === 0) {
    throw new ValidationError("INVALID_EVENT_CANDIDATE", "category_candidate must be non-empty");
  }
  assertConfidence01(input.extraction_confidence, "extraction_confidence");
  return deepFreeze({
    ...input,
    observation_ids: [...input.observation_ids],
    category_candidate: input.category_candidate.trim(),
    evidence_spans: [...input.evidence_spans],
  });
};
