import { errorIssue, type ValidationIssue, type ValidationReport } from "../../entities/validation-report.entity.js";
import {
  buildValidationReport,
  requireSchemaValidator,
  resolveGeneratedAt,
  type ValidationOptions,
  validateBySchema,
} from "../../validators/common/validation-result.js";
import type { RejectionDecision } from "../decisions/entities/rejection-decision.entity.js";
import { REJECTION_DECISION_SCHEMA_ID } from "../schemas/rejection-decision.schema.js";

const validateRejectionInvariants = (input: RejectionDecision): readonly ValidationIssue[] => {
  const issues: ValidationIssue[] = [];
  if (input.rejection_reason_codes.length === 0) {
    issues.push(
      errorIssue(
        "MISSING_REJECTION_REASON_CODE",
        "/rejection_reason_codes",
        "rejection_reason_codes must contain at least one reason code",
      ),
    );
  }
  return issues;
};

export const validateRejectionDecision = (
  input: RejectionDecision,
  options?: ValidationOptions,
): ValidationReport => {
  const schemaValidator = requireSchemaValidator(REJECTION_DECISION_SCHEMA_ID);
  const schemaIssues = validateBySchema(schemaValidator, input);
  const invariantIssues = validateRejectionInvariants(input);
  return buildValidationReport(
    "RejectionDecision",
    input.id,
    [...schemaIssues, ...invariantIssues],
    resolveGeneratedAt(options),
  );
};
