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
import { DISCOVERY_JOB_DEFINITION_SCHEMA_ID } from "../schemas/discovery-job-definition.schema.js";
import type { DiscoveryJobDefinition } from "../entities/discovery-job-definition.entity.js";

export const validateDiscoveryJobDefinition = (
  input: DiscoveryJobDefinition,
  options?: ValidationOptions,
): ValidationReport => {
  const schemaValidator = requireSchemaValidator(DISCOVERY_JOB_DEFINITION_SCHEMA_ID);
  const schemaIssues = validateBySchema(schemaValidator, input);
  return buildValidationReport(
    "DiscoveryJobDefinition",
    input.jobId,
    schemaIssues,
    resolveGeneratedAt(options),
  );
};
