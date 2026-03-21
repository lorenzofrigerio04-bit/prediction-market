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
import type { DeduplicationDecision } from "../deduplication/entities/deduplication-decision.entity.js";
import { DEDUPLICATION_DECISION_SCHEMA_ID } from "../schemas/deduplication-decision.schema.js";

const validateDeduplicationDecisionInvariants = (
  input: DeduplicationDecision,
): readonly ValidationIssue[] => {
  const issues: ValidationIssue[] = [];
  if (input.candidate_id.length === 0) {
    issues.push(errorIssue("MISSING_CANDIDATE_ID", "/candidate_id", "candidate_id must be present"));
  }
  if (input.canonical_event_id.length === 0) {
    issues.push(
      errorIssue("MISSING_CANONICAL_EVENT_ID", "/canonical_event_id", "canonical_event_id must be present"),
    );
  }
  return issues;
};

export const validateDeduplicationDecision = (
  input: DeduplicationDecision,
  options?: ValidationOptions,
): ValidationReport => {
  const schemaValidator = requireSchemaValidator(DEDUPLICATION_DECISION_SCHEMA_ID);
  const schemaIssues = validateBySchema(schemaValidator, input);
  const issues = [...schemaIssues, ...validateDeduplicationDecisionInvariants(input)];
  return buildValidationReport("DeduplicationDecision", input.candidate_id, issues, resolveGeneratedAt(options));
};
