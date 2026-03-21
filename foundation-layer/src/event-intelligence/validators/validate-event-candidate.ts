import {
  errorIssue,
  type ValidationIssue,
  type ValidationReport,
} from "../../entities/validation-report.entity.js";
import {
  buildValidationReport,
  requireSchemaValidator,
  resolveGeneratedAt,
  type ValidationOptions,
  validateBySchema,
} from "../../validators/common/validation-result.js";
import type { EventCandidate } from "../candidates/entities/event-candidate.entity.js";
import { EVENT_CANDIDATE_SCHEMA_ID } from "../schemas/event-candidate.schema.js";

const validateEventCandidateInvariants = (input: EventCandidate): readonly ValidationIssue[] => {
  const issues: ValidationIssue[] = [];
  if (input.observation_ids.length === 0) {
    issues.push(
      errorIssue(
        "MISSING_OBSERVATION_IDS",
        "/observation_ids",
        "observation_ids must contain at least one observation id",
      ),
    );
  }
  if (new Set(input.observation_ids).size !== input.observation_ids.length) {
    issues.push(
      errorIssue("DUPLICATE_OBSERVATION_IDS", "/observation_ids", "observation_ids must be unique"),
    );
  }
  if (input.evidence_spans.length === 0) {
    issues.push(
      errorIssue("MISSING_EVIDENCE_SPANS", "/evidence_spans", "evidence_spans must be non-empty"),
    );
  }
  if (
    input.temporal_window_candidate.start_at !== undefined &&
    Date.parse(input.temporal_window_candidate.start_at) >
      Date.parse(input.temporal_window_candidate.end_at)
  ) {
    issues.push(
      errorIssue(
        "INVALID_TEMPORAL_WINDOW",
        "/temporal_window_candidate",
        "temporal window must satisfy start_at <= end_at",
      ),
    );
  }
  return issues;
};

export const validateEventCandidate = (
  input: EventCandidate,
  options?: ValidationOptions,
): ValidationReport => {
  const schemaValidator = requireSchemaValidator(EVENT_CANDIDATE_SCHEMA_ID);
  const schemaIssues = validateBySchema(schemaValidator, input);
  const issues = [...schemaIssues, ...validateEventCandidateInvariants(input)];
  return buildValidationReport("EventCandidate", input.id, issues, resolveGeneratedAt(options));
};
