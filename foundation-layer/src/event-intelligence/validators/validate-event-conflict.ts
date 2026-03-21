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
import type { EventConflict } from "../conflicts/entities/event-conflict.entity.js";
import { EVENT_CONFLICT_SCHEMA_ID } from "../schemas/event-conflict.schema.js";

const validateEventConflictInvariants = (input: EventConflict): readonly ValidationIssue[] => {
  const issues: ValidationIssue[] = [];
  if (input.canonical_event_id_nullable === null && input.candidate_id_nullable === null) {
    issues.push(
      errorIssue(
        "MISSING_CONFLICT_TARGET",
        "/canonical_event_id_nullable",
        "canonical_event_id_nullable or candidate_id_nullable must be provided",
      ),
    );
  }
  if (input.description.trim().length === 0) {
    issues.push(errorIssue("EMPTY_CONFLICT_DESCRIPTION", "/description", "description must be non-empty"));
  }
  return issues;
};

export const validateEventConflict = (
  input: EventConflict,
  options?: ValidationOptions,
): ValidationReport => {
  const schemaValidator = requireSchemaValidator(EVENT_CONFLICT_SCHEMA_ID);
  const schemaIssues = validateBySchema(schemaValidator, input);
  const issues = [...schemaIssues, ...validateEventConflictInvariants(input)];
  return buildValidationReport("EventConflict", input.id, issues, resolveGeneratedAt(options));
};
