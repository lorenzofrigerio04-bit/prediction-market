import { errorIssue, type ValidationIssue, type ValidationReport } from "../../entities/validation-report.entity.js";
import {
  buildValidationReport,
  requireSchemaValidator,
  resolveGeneratedAt,
  type ValidationOptions,
  validateBySchema,
} from "../../validators/common/validation-result.js";
import { FeedbackReasonCode } from "../enums/feedback-reason-code.enum.js";
import { FeedbackType } from "../enums/feedback-type.enum.js";
import { EDITORIAL_FEEDBACK_SIGNAL_SCHEMA_ID } from "../schemas/editorial-feedback-signal.schema.js";
import type { EditorialFeedbackSignal } from "../signals/editorial/entities/editorial-feedback-signal.entity.js";

const validateEditorialInvariants = (input: EditorialFeedbackSignal): readonly ValidationIssue[] => {
  const issues: ValidationIssue[] = [];
  if (input.feedback_type === FeedbackType.REJECTION && input.reason_codes.length === 0) {
    issues.push(
      errorIssue(
        "EDITORIAL_REJECTION_REQUIRES_REASON_CODE",
        "/reason_codes",
        "rejection feedback_type requires reason_codes",
      ),
    );
  }
  if (
    input.feedback_type === FeedbackType.APPROVAL &&
    input.reason_codes.some(
      (item) =>
        item === FeedbackReasonCode.BLOCKING_DEPENDENCY || item === FeedbackReasonCode.SAFETY_RISK,
    )
  ) {
    issues.push(
      errorIssue(
        "EDITORIAL_APPROVAL_HAS_BLOCKING_REASON",
        "/reason_codes",
        "approval feedback_type cannot contain blocking reason codes",
      ),
    );
  }
  if (
    input.feedback_type === FeedbackType.REVISION_REQUEST &&
    (input.decision_refs.length === 0 || input.reason_codes.length === 0)
  ) {
    issues.push(
      errorIssue(
        "EDITORIAL_REVISION_REQUEST_INCOMPLETE",
        "/",
        "revision_request feedback_type requires decision_refs and reason_codes",
      ),
    );
  }
  if (input.correlation_id.trim().length === 0) {
    issues.push(errorIssue("EDITORIAL_CORRELATION_ID_REQUIRED", "/correlation_id", "correlation_id is required"));
  }
  return issues;
};

export const validateEditorialFeedbackSignal = (
  input: EditorialFeedbackSignal,
  options?: ValidationOptions,
): ValidationReport => {
  const schemaValidator = requireSchemaValidator(EDITORIAL_FEEDBACK_SIGNAL_SCHEMA_ID);
  const schemaIssues = validateBySchema(schemaValidator, input);
  const invariantIssues = validateEditorialInvariants(input);
  return buildValidationReport(
    "EditorialFeedbackSignal",
    input.id,
    [...schemaIssues, ...invariantIssues],
    resolveGeneratedAt(options),
  );
};
