import { errorIssue, type ValidationIssue, type ValidationReport } from "../../entities/validation-report.entity.js";
import {
  buildValidationReport,
  requireSchemaValidator,
  resolveGeneratedAt,
  type ValidationOptions,
  validateBySchema,
} from "../../validators/common/validation-result.js";
import type { OverridePattern } from "../editorial/entities/override-pattern.entity.js";
import { OVERRIDE_PATTERN_SCHEMA_ID } from "../schemas/override-pattern.schema.js";

const invariants = (input: OverridePattern): readonly ValidationIssue[] => {
  const issues: ValidationIssue[] = [];
  if (input.supporting_refs.length === 0) {
    issues.push(
      errorIssue(
        "OVERRIDE_PATTERN_SUPPORTING_REFS_REQUIRED",
        "/supporting_refs",
        "supporting_refs must be non-empty",
      ),
    );
  }
  return issues;
};

export const validateOverridePattern = (
  input: OverridePattern,
  options?: ValidationOptions,
): ValidationReport => {
  const schemaValidator = requireSchemaValidator(OVERRIDE_PATTERN_SCHEMA_ID);
  const schemaIssues = validateBySchema(schemaValidator, input);
  return buildValidationReport(
    "OverridePattern",
    input.id,
    [...schemaIssues, ...invariants(input)],
    resolveGeneratedAt(options),
  );
};
