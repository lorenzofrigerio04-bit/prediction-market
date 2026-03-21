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
import type { EntityNormalizationResult } from "../normalization/entities/entity-normalization-result.entity.js";
import { ENTITY_NORMALIZATION_RESULT_SCHEMA_ID } from "../schemas/entity-normalization-result.schema.js";

const validateEntityNormalizationResultInvariants = (
  input: EntityNormalizationResult,
): readonly ValidationIssue[] => {
  const issues: ValidationIssue[] = [];
  if (input.normalized_entities.length === 0 && input.unresolved_entities.length === 0) {
    issues.push(
      errorIssue(
        "EMPTY_NORMALIZATION_RESULT",
        "/normalized_entities",
        "at least one entity must be present in normalized_entities or unresolved_entities",
      ),
    );
  }
  return issues;
};

export const validateEntityNormalizationResult = (
  input: EntityNormalizationResult,
  options?: ValidationOptions,
): ValidationReport => {
  const schemaValidator = requireSchemaValidator(ENTITY_NORMALIZATION_RESULT_SCHEMA_ID);
  const schemaIssues = validateBySchema(schemaValidator, input);
  const issues = [...schemaIssues, ...validateEntityNormalizationResultInvariants(input)];
  return buildValidationReport(
    "EntityNormalizationResult",
    "entity-normalization-result",
    issues,
    resolveGeneratedAt(options),
  );
};
