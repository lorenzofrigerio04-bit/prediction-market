import { type ValidationReport } from "../../entities/validation-report.entity.js";
import { type ValidationOptions } from "../../validators/common/validation-result.js";
import type { VirtualCreditAccount } from "../accounts/entities/virtual-credit-account.entity.js";
import type { CreditGrant } from "../grants/entities/credit-grant.entity.js";
import type { CreditLedgerEntry } from "../ledger/entities/credit-ledger-entry.entity.js";
import type { QuotaPolicy } from "../quotas/entities/quota-policy.entity.js";
export type VirtualCreditsFamilyAggregate = Readonly<{
    accounts: readonly VirtualCreditAccount[];
    grants: readonly CreditGrant[];
    ledgerEntries: readonly CreditLedgerEntry[];
    quotaPolicies: readonly QuotaPolicy[];
}>;
export declare const validateVirtualCreditsFamilyAggregate: (aggregate: VirtualCreditsFamilyAggregate, options?: ValidationOptions) => ValidationReport;
//# sourceMappingURL=validate-virtual-credits-family-aggregate.d.ts.map