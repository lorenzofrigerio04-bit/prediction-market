import { errorIssue, type ValidationIssue, type ValidationReport } from "../../entities/validation-report.entity.js";
import {
  buildValidationReport,
  requireSchemaValidator,
  resolveGeneratedAt,
  type ValidationOptions,
  validateBySchema,
} from "../../validators/common/validation-result.js";
import { ExpansionValidationStatus } from "../enums/expansion-validation-status.enum.js";
import { EXPANSION_VALIDATION_REPORT_SCHEMA_ID } from "../schemas/expansion-validation-report.schema.js";
import type { ExpansionValidationReport } from "../validation/entities/expansion-validation-report.entity.js";

const validateInvariants = (input: ExpansionValidationReport): readonly ValidationIssue[] => {
  const issues: ValidationIssue[] = [];
  if (
    input.validation_status === ExpansionValidationStatus.INVALID &&
    input.blocking_issues.length === 0
  ) {
    issues.push(
      errorIssue(
        "EXPANSION_REPORT_INVALID_EMPTY_BLOCKING",
        "/blocking_issues",
        "invalid status requires blocking issues",
      ),
    );
  }
  return issues;
};

export const validateExpansionValidationReport = (
  input: ExpansionValidationReport,
  options?: ValidationOptions,
): ValidationReport => {
  const schemaValidator = requireSchemaValidator(EXPANSION_VALIDATION_REPORT_SCHEMA_ID);
  const schemaIssues = validateBySchema(schemaValidator, input);
  const invariantIssues = validateInvariants(input);
  return buildValidationReport(
    "ExpansionValidationReport",
    input.id,
    [...schemaIssues, ...invariantIssues],
    resolveGeneratedAt(options),
  );
};
