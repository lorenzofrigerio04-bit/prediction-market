import { errorIssue, type ValidationIssue, type ValidationReport } from "../../entities/validation-report.entity.js";
import {
  buildValidationReport,
  requireSchemaValidator,
  resolveGeneratedAt,
  type ValidationOptions,
  validateBySchema,
} from "../../validators/common/validation-result.js";
import type { RejectionPattern } from "../editorial/entities/rejection-pattern.entity.js";
import { REJECTION_PATTERN_SCHEMA_ID } from "../schemas/rejection-pattern.schema.js";

const invariants = (input: RejectionPattern): readonly ValidationIssue[] => {
  const issues: ValidationIssue[] = [];
  if (input.supporting_refs.length === 0) {
    issues.push(
      errorIssue(
        "REJECTION_PATTERN_SUPPORTING_REFS_REQUIRED",
        "/supporting_refs",
        "supporting_refs must be non-empty",
      ),
    );
  }
  return issues;
};

export const validateRejectionPattern = (
  input: RejectionPattern,
  options?: ValidationOptions,
): ValidationReport => {
  const schemaValidator = requireSchemaValidator(REJECTION_PATTERN_SCHEMA_ID);
  const schemaIssues = validateBySchema(schemaValidator, input);
  return buildValidationReport(
    "RejectionPattern",
    input.id,
    [...schemaIssues, ...invariants(input)],
    resolveGeneratedAt(options),
  );
};
