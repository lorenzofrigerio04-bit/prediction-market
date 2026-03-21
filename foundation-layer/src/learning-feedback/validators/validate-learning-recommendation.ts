import { errorIssue, type ValidationIssue, type ValidationReport } from "../../entities/validation-report.entity.js";
import {
  buildValidationReport,
  requireSchemaValidator,
  resolveGeneratedAt,
  type ValidationOptions,
  validateBySchema,
} from "../../validators/common/validation-result.js";
import { RecommendationStatus } from "../enums/recommendation-status.enum.js";
import { LEARNING_RECOMMENDATION_SCHEMA_ID } from "../schemas/learning-recommendation.schema.js";
import type { LearningRecommendation } from "../recommendations/entities/learning-recommendation.entity.js";

const validateRecommendationInvariants = (input: LearningRecommendation): readonly ValidationIssue[] => {
  const issues: ValidationIssue[] = [];
  if (input.correlation_id.trim().length === 0) {
    issues.push(
      errorIssue("RECOMMENDATION_CORRELATION_ID_REQUIRED", "/correlation_id", "correlation_id is required"),
    );
  }
  if (input.status === RecommendationStatus.READY && input.blocking_dependency_refs.length > 0) {
    issues.push(
      errorIssue(
        "RECOMMENDATION_READY_WITH_BLOCKING_DEPENDENCIES",
        "/blocking_dependency_refs",
        "ready recommendation cannot have blocking_dependency_refs",
      ),
    );
  }
  return issues;
};

export const validateLearningRecommendation = (
  input: LearningRecommendation,
  options?: ValidationOptions,
): ValidationReport => {
  const schemaValidator = requireSchemaValidator(LEARNING_RECOMMENDATION_SCHEMA_ID);
  const schemaIssues = validateBySchema(schemaValidator, input);
  const invariantIssues = validateRecommendationInvariants(input);
  return buildValidationReport(
    "LearningRecommendation",
    input.id,
    [...schemaIssues, ...invariantIssues],
    resolveGeneratedAt(options),
  );
};
