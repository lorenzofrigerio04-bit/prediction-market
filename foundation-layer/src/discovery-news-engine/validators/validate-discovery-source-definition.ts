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
import { DISCOVERY_SOURCE_DEFINITION_SCHEMA_ID } from "../schemas/discovery-source-definition.schema.js";
import type { DiscoverySourceDefinition } from "../entities/discovery-source-definition.entity.js";

const validateDiscoverySourceDefinitionInvariants = (
  input: DiscoverySourceDefinition,
): readonly ValidationIssue[] => {
  const issues: ValidationIssue[] = [];
  if (input.endpoint.url.trim().length === 0) {
    issues.push(
      errorIssue(
        "INVALID_DISCOVERY_SOURCE_DEFINITION",
        "/endpoint/url",
        "endpoint url must be non-empty",
      ),
    );
  }
  return issues;
};

export const validateDiscoverySourceDefinition = (
  input: DiscoverySourceDefinition,
  options?: ValidationOptions,
): ValidationReport => {
  const schemaValidator = requireSchemaValidator(DISCOVERY_SOURCE_DEFINITION_SCHEMA_ID);
  const schemaIssues = validateBySchema(schemaValidator, input);
  const issues = [
    ...schemaIssues,
    ...validateDiscoverySourceDefinitionInvariants(input),
  ];
  return buildValidationReport(
    "DiscoverySourceDefinition",
    input.id,
    issues,
    resolveGeneratedAt(options),
  );
};
