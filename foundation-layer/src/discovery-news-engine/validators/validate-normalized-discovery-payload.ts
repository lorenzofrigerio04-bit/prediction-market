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
import { NORMALIZED_DISCOVERY_PAYLOAD_SCHEMA_ID } from "../schemas/normalized-discovery-payload.schema.js";
import type { NormalizedDiscoveryPayload } from "../entities/normalized-discovery-payload.entity.js";

const validateNormalizedDiscoveryPayloadInvariants = (
  input: NormalizedDiscoveryPayload,
): readonly ValidationIssue[] => {
  const issues: ValidationIssue[] = [];
  if (input.items.length === 0) {
    issues.push(
      errorIssue(
        "INVALID_NORMALIZED_DISCOVERY_PAYLOAD",
        "/items",
        "items must contain at least one item",
      ),
    );
  }
  return issues;
};

export const validateNormalizedDiscoveryPayload = (
  input: NormalizedDiscoveryPayload,
  options?: ValidationOptions,
): ValidationReport => {
  const schemaValidator = requireSchemaValidator(NORMALIZED_DISCOVERY_PAYLOAD_SCHEMA_ID);
  const schemaIssues = validateBySchema(schemaValidator, input);
  const issues = [
    ...schemaIssues,
    ...validateNormalizedDiscoveryPayloadInvariants(input),
  ];
  return buildValidationReport(
    "NormalizedDiscoveryPayload",
    input.sourceId,
    issues,
    resolveGeneratedAt(options),
  );
};
