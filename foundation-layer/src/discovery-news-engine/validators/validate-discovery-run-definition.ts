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
import { DISCOVERY_RUN_DEFINITION_SCHEMA_ID } from "../schemas/discovery-run-definition.schema.js";
import type { DiscoveryRunDefinition } from "../entities/discovery-run-definition.entity.js";

const validateDiscoveryRunDefinitionInvariants = (
  input: DiscoveryRunDefinition,
): readonly ValidationIssue[] => {
  const issues: ValidationIssue[] = [];
  if (input.sourceIds.length === 0) {
    issues.push(
      errorIssue(
        "INVALID_DISCOVERY_RUN_DEFINITION",
        "/sourceIds",
        "sourceIds must contain at least one source",
      ),
    );
  }
  return issues;
};

export const validateDiscoveryRunDefinition = (
  input: DiscoveryRunDefinition,
  options?: ValidationOptions,
): ValidationReport => {
  const schemaValidator = requireSchemaValidator(DISCOVERY_RUN_DEFINITION_SCHEMA_ID);
  const schemaIssues = validateBySchema(schemaValidator, input);
  const issues = [
    ...schemaIssues,
    ...validateDiscoveryRunDefinitionInvariants(input),
  ];
  return buildValidationReport(
    "DiscoveryRunDefinition",
    input.runId,
    issues,
    resolveGeneratedAt(options),
  );
};
