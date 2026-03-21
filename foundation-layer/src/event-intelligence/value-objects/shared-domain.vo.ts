import { ValidationError } from "../../common/errors/validation-error.js";
import { deepFreeze } from "../../common/utils/deep-freeze.js";
import type { Timestamp } from "../../value-objects/timestamp.vo.js";
import type { SourceObservationId } from "../../observations/value-objects/source-observation-id.vo.js";
import type { EventCandidateId, CanonicalEventIntelligenceId } from "./event-intelligence-ids.vo.js";

export type TemporalWindow = Readonly<{
  start_at: Timestamp;
  end_at: Timestamp;
}>;

export type EvidenceSpan = Readonly<{
  span_id: string;
  source_observation_id: SourceObservationId;
  locator: string;
  start_offset: number | null;
  end_offset: number | null;
  extracted_text_nullable: string | null;
  mapped_field_nullable: string | null;
}>;

export type SubjectReference = Readonly<{
  value: string;
  normalized_value: string;
  entity_type: string;
}>;

export type ActionReference = Readonly<{
  value: string;
  normalized_value: string;
}>;

export type ObjectReference = Readonly<{
  value: string;
  normalized_value: string;
  entity_type_nullable: string | null;
}>;

export type JurisdictionReference = Readonly<{
  code: string;
  label_nullable: string | null;
}>;

export type GraphMetadata = Readonly<{
  created_from_candidate_ids: readonly EventCandidateId[];
  relation_count: number;
}>;

export type SimilarityScore = Readonly<{
  left_candidate_id: EventCandidateId;
  right_candidate_id: EventCandidateId;
  score: number;
}>;

export type ConflictDescriptor = Readonly<{
  field: string;
  left_value_nullable: string | null;
  right_value_nullable: string | null;
}>;

export type NormalizationMetadata = Readonly<{
  strategy_id: string;
  resolver_version: string;
}>;

const assertScore01 = (value: number, field: string): void => {
  if (!Number.isFinite(value) || value < 0 || value > 1) {
    throw new ValidationError("INVALID_CONFIDENCE_SCORE", `${field} must be within [0,1]`, {
      field,
      value,
    });
  }
};

export const createTemporalWindow = (input: TemporalWindow): TemporalWindow => {
  if (Date.parse(input.start_at) > Date.parse(input.end_at)) {
    throw new ValidationError(
      "INVALID_TEMPORAL_WINDOW",
      "start_at must be less than or equal to end_at",
      input,
    );
  }
  return deepFreeze(input);
};

export const createEvidenceSpan = (input: EvidenceSpan): EvidenceSpan => {
  if (input.span_id.trim().length === 0 || input.locator.trim().length === 0) {
    throw new ValidationError("INVALID_EVIDENCE_SPAN", "span_id and locator must be non-empty");
  }
  if (
    input.start_offset !== null &&
    input.end_offset !== null &&
    input.end_offset < input.start_offset
  ) {
    throw new ValidationError(
      "INVALID_EVIDENCE_SPAN",
      "end_offset must be greater than or equal to start_offset",
      input,
    );
  }
  return deepFreeze({
    ...input,
    span_id: input.span_id.trim(),
    locator: input.locator.trim(),
  });
};

export const createSubjectReference = (input: SubjectReference): SubjectReference => {
  if (
    input.value.trim().length === 0 ||
    input.normalized_value.trim().length === 0 ||
    input.entity_type.trim().length === 0
  ) {
    throw new ValidationError(
      "INVALID_SUBJECT_REFERENCE",
      "value, normalized_value and entity_type must be non-empty",
    );
  }
  return deepFreeze({
    ...input,
    value: input.value.trim(),
    normalized_value: input.normalized_value.trim(),
    entity_type: input.entity_type.trim(),
  });
};

export const createActionReference = (input: ActionReference): ActionReference => {
  if (input.value.trim().length === 0 || input.normalized_value.trim().length === 0) {
    throw new ValidationError(
      "INVALID_ACTION_REFERENCE",
      "value and normalized_value must be non-empty",
    );
  }
  return deepFreeze({
    ...input,
    value: input.value.trim(),
    normalized_value: input.normalized_value.trim(),
  });
};

export const createObjectReference = (input: ObjectReference): ObjectReference => {
  if (input.value.trim().length === 0 || input.normalized_value.trim().length === 0) {
    throw new ValidationError(
      "INVALID_OBJECT_REFERENCE",
      "value and normalized_value must be non-empty",
    );
  }
  return deepFreeze({
    ...input,
    value: input.value.trim(),
    normalized_value: input.normalized_value.trim(),
    entity_type_nullable:
      input.entity_type_nullable === null ? null : input.entity_type_nullable.trim(),
  });
};

export const createJurisdictionReference = (
  input: JurisdictionReference,
): JurisdictionReference => {
  if (!/^[A-Z]{2,8}$/.test(input.code)) {
    throw new ValidationError("INVALID_JURISDICTION_REFERENCE", "code must match /^[A-Z]{2,8}$/");
  }
  return deepFreeze({
    ...input,
    code: input.code,
    label_nullable: input.label_nullable === null ? null : input.label_nullable.trim(),
  });
};

export const createSimilarityScore = (input: SimilarityScore): SimilarityScore => {
  assertScore01(input.score, "score");
  return deepFreeze(input);
};

export const createGraphMetadata = (input: GraphMetadata): GraphMetadata => {
  if (!Number.isInteger(input.relation_count) || input.relation_count < 0) {
    throw new ValidationError(
      "INVALID_GRAPH_METADATA",
      "relation_count must be a non-negative integer",
      { relation_count: input.relation_count },
    );
  }
  return deepFreeze({
    ...input,
    created_from_candidate_ids: [...input.created_from_candidate_ids],
  });
};

export const createConflictDescriptor = (input: ConflictDescriptor): ConflictDescriptor => {
  if (input.field.trim().length === 0) {
    throw new ValidationError("INVALID_CONFLICT_DESCRIPTOR", "field must be non-empty");
  }
  return deepFreeze({
    ...input,
    field: input.field.trim(),
  });
};

export const createNormalizationMetadata = (input: NormalizationMetadata): NormalizationMetadata => {
  if (input.strategy_id.trim().length === 0 || input.resolver_version.trim().length === 0) {
    throw new ValidationError(
      "INVALID_NORMALIZATION_METADATA",
      "strategy_id and resolver_version must be non-empty",
    );
  }
  return deepFreeze({
    strategy_id: input.strategy_id.trim(),
    resolver_version: input.resolver_version.trim(),
  });
};

export const assertConfidence01 = assertScore01;

export type EventReferencePair = Readonly<{
  candidate_id: EventCandidateId;
  canonical_event_id: CanonicalEventIntelligenceId;
}>;
