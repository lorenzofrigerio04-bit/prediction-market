import { errorIssue, type ValidationIssue, type ValidationReport } from "../../../entities/validation-report.entity.js";
import {
  buildValidationReport,
  requireSchemaValidator,
  resolveGeneratedAt,
  type ValidationOptions,
  validateBySchema,
} from "../../../validators/common/validation-result.js";
import type { AdminCreditAdjustment } from "../entities/admin-credit-adjustment.entity.js";
import { ADMIN_CREDIT_ADJUSTMENT_SCHEMA_ID } from "../../schemas/admin-credit-adjustment.schema.js";

const validateInvariants = (input: AdminCreditAdjustment): readonly ValidationIssue[] => {
  const issues: ValidationIssue[] = [];
  if (!Number.isFinite(input.amount_delta) || input.amount_delta === 0) {
    issues.push(errorIssue("ADJUSTMENT_AMOUNT_DELTA_INVALID", "/amount_delta", "amount_delta must be finite and non-zero"));
  }
  if (input.audit_ref.length === 0) {
    issues.push(errorIssue("ADJUSTMENT_AUDIT_REF_REQUIRED", "/audit_ref", "audit_ref is required"));
  }
  if (input.adjustment_reason.length === 0) {
    issues.push(errorIssue("ADJUSTMENT_REASON_REQUIRED", "/adjustment_reason", "adjustment_reason is required"));
  }
  return issues;
};

export const validateAdminCreditAdjustment = (
  input: AdminCreditAdjustment,
  options?: ValidationOptions,
): ValidationReport => {
  const schemaValidator = requireSchemaValidator(ADMIN_CREDIT_ADJUSTMENT_SCHEMA_ID);
  const schemaIssues = validateBySchema(schemaValidator, input);
  const invariantIssues = validateInvariants(input);
  return buildValidationReport(
    "AdminCreditAdjustment",
    input.id,
    [...schemaIssues, ...invariantIssues],
    resolveGeneratedAt(options),
  );
};
