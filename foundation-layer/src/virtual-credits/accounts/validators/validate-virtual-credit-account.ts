import { errorIssue, type ValidationIssue, type ValidationReport } from "../../../entities/validation-report.entity.js";
import {
  buildValidationReport,
  requireSchemaValidator,
  resolveGeneratedAt,
  type ValidationOptions,
  validateBySchema,
} from "../../../validators/common/validation-result.js";
import type { VirtualCreditAccount } from "../entities/virtual-credit-account.entity.js";
import { VIRTUAL_CREDIT_ACCOUNT_SCHEMA_ID } from "../../schemas/virtual-credit-account.schema.js";

const validateInvariants = (input: VirtualCreditAccount): readonly ValidationIssue[] => {
  const issues: ValidationIssue[] = [];
  if (input.owner_ref.length === 0) {
    issues.push(errorIssue("OWNER_REF_REQUIRED", "/owner_ref", "owner_ref is required"));
  }
  if (input.currency_key.length === 0) {
    issues.push(errorIssue("CURRENCY_KEY_REQUIRED", "/currency_key", "currency_key is required"));
  }
  if (input.current_balance_nullable !== null && !Number.isFinite(input.current_balance_nullable)) {
    issues.push(errorIssue("BALANCE_INVALID", "/current_balance_nullable", "current_balance_nullable must be finite when provided"));
  }
  return issues;
};

export const validateVirtualCreditAccount = (
  input: VirtualCreditAccount,
  options?: ValidationOptions,
): ValidationReport => {
  const schemaValidator = requireSchemaValidator(VIRTUAL_CREDIT_ACCOUNT_SCHEMA_ID);
  const schemaIssues = validateBySchema(schemaValidator, input);
  const invariantIssues = validateInvariants(input);
  return buildValidationReport("VirtualCreditAccount", input.id, [...schemaIssues, ...invariantIssues], resolveGeneratedAt(options));
};
