import { errorIssue, type ValidationIssue, type ValidationReport } from "../../../entities/validation-report.entity.js";
import {
  buildValidationReport,
  requireSchemaValidator,
  resolveGeneratedAt,
  type ValidationOptions,
  validateBySchema,
} from "../../../validators/common/validation-result.js";
import type { QuotaPolicy } from "../entities/quota-policy.entity.js";
import { QUOTA_POLICY_SCHEMA_ID } from "../../schemas/quota-policy.schema.js";

const validateInvariants = (input: QuotaPolicy): readonly ValidationIssue[] => {
  const issues: ValidationIssue[] = [];
  if (input.active && !(input.max_amount > 0)) {
    issues.push(errorIssue("QUOTA_MAX_AMOUNT_INVALID", "/max_amount", "active quota policies require max_amount > 0"));
  }
  if (input.active && (!Number.isInteger(input.window_definition.size) || input.window_definition.size <= 0)) {
    issues.push(errorIssue("QUOTA_WINDOW_INVALID", "/window_definition/size", "active quota policies require a valid positive window size"));
  }
  return issues;
};

export const validateQuotaPolicy = (input: QuotaPolicy, options?: ValidationOptions): ValidationReport => {
  const schemaValidator = requireSchemaValidator(QUOTA_POLICY_SCHEMA_ID);
  const schemaIssues = validateBySchema(schemaValidator, input);
  const invariantIssues = validateInvariants(input);
  return buildValidationReport("QuotaPolicy", input.id, [...schemaIssues, ...invariantIssues], resolveGeneratedAt(options));
};
