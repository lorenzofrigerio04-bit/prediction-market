import { errorIssue, type ValidationIssue, type ValidationReport } from "../../../entities/validation-report.entity.js";
import {
  buildValidationReport,
  requireSchemaValidator,
  resolveGeneratedAt,
  type ValidationOptions,
  validateBySchema,
} from "../../../validators/common/validation-result.js";
import { QuotaDecisionStatus } from "../../enums/quota-decision-status.enum.js";
import type { QuotaEvaluation } from "../entities/quota-evaluation.entity.js";
import { QUOTA_EVALUATION_SCHEMA_ID } from "../../schemas/quota-evaluation.schema.js";

const validateInvariants = (input: QuotaEvaluation): readonly ValidationIssue[] => {
  const issues: ValidationIssue[] = [];
  if (!Number.isFinite(input.current_usage)) {
    issues.push(errorIssue("QUOTA_EVAL_CURRENT_USAGE_INVALID", "/current_usage", "current_usage must be finite"));
  }
  if (!Number.isFinite(input.requested_usage)) {
    issues.push(errorIssue("QUOTA_EVAL_REQUESTED_USAGE_INVALID", "/requested_usage", "requested_usage must be finite"));
  }
  if (input.decision_status === QuotaDecisionStatus.DENIED && input.blocking_reasons.length === 0) {
    issues.push(errorIssue("QUOTA_EVAL_DENIED_REASONS_REQUIRED", "/blocking_reasons", "denied decision requires blocking_reasons"));
  }
  return issues;
};

export const validateQuotaEvaluation = (input: QuotaEvaluation, options?: ValidationOptions): ValidationReport => {
  const schemaValidator = requireSchemaValidator(QUOTA_EVALUATION_SCHEMA_ID);
  const schemaIssues = validateBySchema(schemaValidator, input);
  const invariantIssues = validateInvariants(input);
  return buildValidationReport("QuotaEvaluation", input.id, [...schemaIssues, ...invariantIssues], resolveGeneratedAt(options));
};
