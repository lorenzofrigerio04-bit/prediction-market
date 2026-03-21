import { type ValidationReport } from "../../entities/validation-report.entity.js";
import { buildValidationReport, resolveGeneratedAt, type ValidationOptions } from "../../validators/common/validation-result.js";
import type { VirtualCreditAccount } from "../accounts/entities/virtual-credit-account.entity.js";
import type { CreditGrant } from "../grants/entities/credit-grant.entity.js";
import type { CreditLedgerEntry } from "../ledger/entities/credit-ledger-entry.entity.js";
import type { QuotaPolicy } from "../quotas/entities/quota-policy.entity.js";
import { validateCreditAuditChain } from "./validate-credit-audit-chain.js";
import { validateCreditGovernanceInvariants } from "./validate-credit-governance-invariants.js";

export type VirtualCreditsFamilyAggregate = Readonly<{
  accounts: readonly VirtualCreditAccount[];
  grants: readonly CreditGrant[];
  ledgerEntries: readonly CreditLedgerEntry[];
  quotaPolicies: readonly QuotaPolicy[];
}>;

export const validateVirtualCreditsFamilyAggregate = (
  aggregate: VirtualCreditsFamilyAggregate,
  options?: ValidationOptions,
): ValidationReport => {
  const auditReport = validateCreditAuditChain(aggregate.ledgerEntries, options);
  const governanceReport = validateCreditGovernanceInvariants(
    {
      accounts: aggregate.accounts,
      grants: aggregate.grants,
      quotaPolicies: aggregate.quotaPolicies,
    },
    options,
  );
  return buildValidationReport(
    "VirtualCreditsFamilyAggregate",
    "virtual-credits-family",
    [...auditReport.issues, ...governanceReport.issues],
    resolveGeneratedAt(options),
  );
};
