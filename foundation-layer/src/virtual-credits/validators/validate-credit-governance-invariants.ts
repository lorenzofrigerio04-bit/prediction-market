import { errorIssue, type ValidationIssue, type ValidationReport } from "../../entities/validation-report.entity.js";
import { buildValidationReport, resolveGeneratedAt, type ValidationOptions } from "../../validators/common/validation-result.js";
import type { VirtualCreditAccount } from "../accounts/entities/virtual-credit-account.entity.js";
import type { CreditGrant } from "../grants/entities/credit-grant.entity.js";
import type { QuotaPolicy } from "../quotas/entities/quota-policy.entity.js";

export type CreditGovernanceContext = Readonly<{
  accounts: readonly VirtualCreditAccount[];
  grants: readonly CreditGrant[];
  quotaPolicies: readonly QuotaPolicy[];
}>;

const collectIssues = (context: CreditGovernanceContext): readonly ValidationIssue[] => {
  const issues: ValidationIssue[] = [];
  const accountIds = new Set(context.accounts.map((item) => item.id));
  for (const [index, grant] of context.grants.entries()) {
    if (!accountIds.has(grant.target_account_id)) {
      issues.push(errorIssue("GOVERNANCE_GRANT_ACCOUNT_MISSING", `/grants/${index}/target_account_id`, "grant target account must exist"));
    }
  }
  for (const [index, policy] of context.quotaPolicies.entries()) {
    if (policy.active && policy.max_amount <= 0) {
      issues.push(errorIssue("GOVERNANCE_ACTIVE_POLICY_MAX_INVALID", `/quotaPolicies/${index}/max_amount`, "active policy max_amount must be greater than zero"));
    }
  }
  return issues;
};

export const validateCreditGovernanceInvariants = (
  context: CreditGovernanceContext,
  options?: ValidationOptions,
): ValidationReport =>
  buildValidationReport(
    "CreditGovernanceInvariants",
    "virtual-credits-governance",
    collectIssues(context),
    resolveGeneratedAt(options),
  );
