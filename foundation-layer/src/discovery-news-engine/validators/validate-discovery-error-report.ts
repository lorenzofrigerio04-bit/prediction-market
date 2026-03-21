import {
  type ValidationReport,
} from "../../entities/validation-report.entity.js";
import {
  buildValidationReport,
  requireSchemaValidator,
  resolveGeneratedAt,
  type ValidationOptions,
  validateBySchema,
} from "../../validators/common/validation-result.js";
import { DISCOVERY_ERROR_REPORT_SCHEMA_ID } from "../schemas/discovery-error-report.schema.js";
import type { DiscoveryErrorReport } from "../entities/discovery-error-report.entity.js";

export const validateDiscoveryErrorReport = (
  input: DiscoveryErrorReport,
  options?: ValidationOptions,
): ValidationReport => {
  const schemaValidator = requireSchemaValidator(DISCOVERY_ERROR_REPORT_SCHEMA_ID);
  const schemaIssues = validateBySchema(schemaValidator, input);
  return buildValidationReport(
    "DiscoveryErrorReport",
    input.runId,
    schemaIssues,
    resolveGeneratedAt(options),
  );
};
