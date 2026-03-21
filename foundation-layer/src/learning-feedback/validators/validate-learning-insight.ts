import { errorIssue, type ValidationIssue, type ValidationReport } from "../../entities/validation-report.entity.js";
import {
  buildValidationReport,
  requireSchemaValidator,
  resolveGeneratedAt,
  type ValidationOptions,
  validateBySchema,
} from "../../validators/common/validation-result.js";
import { LEARNING_INSIGHT_SCHEMA_ID } from "../schemas/learning-insight.schema.js";
import type { LearningInsight } from "../insights/entities/learning-insight.entity.js";

const validateInsightInvariants = (input: LearningInsight): readonly ValidationIssue[] => {
  const issues: ValidationIssue[] = [];
  if (input.correlation_id.trim().length === 0) {
    issues.push(errorIssue("INSIGHT_CORRELATION_ID_REQUIRED", "/correlation_id", "correlation_id is required"));
  }
  if (input.supporting_refs.length === 0) {
    issues.push(
      errorIssue(
        "INSIGHT_SUPPORTING_REFS_REQUIRED",
        "/supporting_refs",
        "supporting_refs must be non-empty",
      ),
    );
  }
  return issues;
};

export const validateLearningInsight = (
  input: LearningInsight,
  options?: ValidationOptions,
): ValidationReport => {
  const schemaValidator = requireSchemaValidator(LEARNING_INSIGHT_SCHEMA_ID);
  const schemaIssues = validateBySchema(schemaValidator, input);
  const invariantIssues = validateInsightInvariants(input);
  return buildValidationReport(
    "LearningInsight",
    input.id,
    [...schemaIssues, ...invariantIssues],
    resolveGeneratedAt(options),
  );
};
