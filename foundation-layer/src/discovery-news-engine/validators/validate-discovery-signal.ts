import {
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
import { DISCOVERY_SIGNAL_SCHEMA_ID } from "../schemas/discovery-signal.schema.js";
import type { DiscoverySignal } from "../entities/discovery-signal.entity.js";

export const validateDiscoverySignal = (
  input: DiscoverySignal,
  options?: ValidationOptions,
): ValidationReport => {
  const schemaValidator = requireSchemaValidator(DISCOVERY_SIGNAL_SCHEMA_ID);
  const schemaIssues = validateBySchema(schemaValidator, input);
  const issues: ValidationIssue[] = [...schemaIssues];
  return buildValidationReport(
    "DiscoverySignal",
    input.id,
    issues,
    resolveGeneratedAt(options),
  );
};
