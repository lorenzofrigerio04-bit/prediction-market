import { errorIssue, type ValidationIssue, type ValidationReport } from "../../../entities/validation-report.entity.js";
import {
  buildValidationReport,
  requireSchemaValidator,
  resolveGeneratedAt,
  type ValidationOptions,
  validateBySchema,
} from "../../../validators/common/validation-result.js";
import type { CreditGrant } from "../entities/credit-grant.entity.js";
import { CREDIT_GRANT_SCHEMA_ID } from "../../schemas/credit-grant.schema.js";

const validateInvariants = (input: CreditGrant): readonly ValidationIssue[] => {
  const issues: ValidationIssue[] = [];
  if (!(input.amount > 0)) {
    issues.push(errorIssue("GRANT_AMOUNT_INVALID", "/amount", "amount must be greater than zero"));
  }
  if (input.grant_reason.length === 0) {
    issues.push(errorIssue("GRANT_REASON_REQUIRED", "/grant_reason", "grant_reason is required"));
  }
  if (input.expiration_nullable !== null && Date.parse(input.expiration_nullable) < Date.parse(input.issued_at)) {
    issues.push(errorIssue("GRANT_EXPIRATION_BEFORE_ISSUED", "/expiration_nullable", "expiration_nullable must be >= issued_at"));
  }
  return issues;
};

export const validateCreditGrant = (input: CreditGrant, options?: ValidationOptions): ValidationReport => {
  const schemaValidator = requireSchemaValidator(CREDIT_GRANT_SCHEMA_ID);
  const schemaIssues = validateBySchema(schemaValidator, input);
  const invariantIssues = validateInvariants(input);
  return buildValidationReport("CreditGrant", input.id, [...schemaIssues, ...invariantIssues], resolveGeneratedAt(options));
};
