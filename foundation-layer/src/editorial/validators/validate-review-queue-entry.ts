import { errorIssue, type ValidationIssue, type ValidationReport } from "../../entities/validation-report.entity.js";
import {
  buildValidationReport,
  requireSchemaValidator,
  resolveGeneratedAt,
  type ValidationOptions,
  validateBySchema,
} from "../../validators/common/validation-result.js";
import type { ReviewQueueEntry } from "../queue/entities/review-queue-entry.entity.js";
import { REVIEW_QUEUE_ENTRY_SCHEMA_ID } from "../schemas/review-queue-entry.schema.js";

const validateReviewQueueEntryInvariants = (input: ReviewQueueEntry): readonly ValidationIssue[] => {
  const issues: ValidationIssue[] = [];
  if (input.publishable_candidate_id.trim().length === 0) {
    issues.push(
      errorIssue(
        "MISSING_PUBLISHABLE_CANDIDATE_REFERENCE",
        "/publishable_candidate_id",
        "publishable_candidate_id is required",
      ),
    );
  }
  return issues;
};

export const validateReviewQueueEntry = (
  input: ReviewQueueEntry,
  options?: ValidationOptions,
): ValidationReport => {
  const schemaValidator = requireSchemaValidator(REVIEW_QUEUE_ENTRY_SCHEMA_ID);
  const schemaIssues = validateBySchema(schemaValidator, input);
  const invariantIssues = validateReviewQueueEntryInvariants(input);
  return buildValidationReport(
    "ReviewQueueEntry",
    input.id,
    [...schemaIssues, ...invariantIssues],
    resolveGeneratedAt(options),
  );
};
