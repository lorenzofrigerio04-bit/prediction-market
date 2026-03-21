import { errorIssue, type ValidationIssue, type ValidationReport } from "../../../entities/validation-report.entity.js";
import {
  buildValidationReport,
  requireSchemaValidator,
  resolveGeneratedAt,
  type ValidationOptions,
  validateBySchema,
} from "../../../validators/common/validation-result.js";
import { ConsistencyStatus } from "../../enums/consistency-status.enum.js";
import type { CreditBalanceSnapshot } from "../entities/credit-balance-snapshot.entity.js";
import { CREDIT_BALANCE_SNAPSHOT_SCHEMA_ID } from "../../schemas/credit-balance-snapshot.schema.js";

const validateInvariants = (input: CreditBalanceSnapshot): readonly ValidationIssue[] => {
  const issues: ValidationIssue[] = [];
  if (!Number.isFinite(input.snapshot_balance)) {
    issues.push(errorIssue("SNAPSHOT_BALANCE_INVALID", "/snapshot_balance", "snapshot_balance must be finite"));
  }
  if (input.consistency_status === ConsistencyStatus.CONSISTENT && input.included_ledger_refs.length === 0) {
    issues.push(errorIssue("SNAPSHOT_CONSISTENT_EMPTY_REFS", "/included_ledger_refs", "consistent snapshots require included_ledger_refs"));
  }
  return issues;
};

export const validateCreditBalanceSnapshot = (
  input: CreditBalanceSnapshot,
  options?: ValidationOptions,
): ValidationReport => {
  const schemaValidator = requireSchemaValidator(CREDIT_BALANCE_SNAPSHOT_SCHEMA_ID);
  const schemaIssues = validateBySchema(schemaValidator, input);
  const invariantIssues = validateInvariants(input);
  return buildValidationReport("CreditBalanceSnapshot", input.id, [...schemaIssues, ...invariantIssues], resolveGeneratedAt(options));
};
