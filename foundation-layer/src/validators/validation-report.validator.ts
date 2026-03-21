import type { ValidationReport } from "../entities/validation-report.entity.js";
import { VALIDATION_REPORT_SCHEMA_ID } from "../schemas/entities/validation-report.schema.js";
import {
  buildValidationReport,
  requireSchemaValidator,
  resolveGeneratedAt,
  type ValidationOptions,
  validateBySchema,
} from "./common/validation-result.js";

export const validateValidationReport = (
  input: ValidationReport,
  options?: ValidationOptions,
): ValidationReport => {
  const schemaValidator = requireSchemaValidator(VALIDATION_REPORT_SCHEMA_ID);
  const schemaIssues = validateBySchema(schemaValidator, input);
  return buildValidationReport(
    "ValidationReport",
    input.targetId,
    schemaIssues,
    resolveGeneratedAt(options),
  );
};
