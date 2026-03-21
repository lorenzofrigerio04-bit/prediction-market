import { type ValidationReport } from "../../entities/validation-report.entity.js";
import { type ValidationOptions } from "../../validators/common/validation-result.js";
import type { VirtualCreditAccount } from "../accounts/entities/virtual-credit-account.entity.js";
import type { CreditGrant } from "../grants/entities/credit-grant.entity.js";
import type { QuotaPolicy } from "../quotas/entities/quota-policy.entity.js";
export type CreditGovernanceContext = Readonly<{
    accounts: readonly VirtualCreditAccount[];
    grants: readonly CreditGrant[];
    quotaPolicies: readonly QuotaPolicy[];
}>;
export declare const validateCreditGovernanceInvariants: (context: CreditGovernanceContext, options?: ValidationOptions) => ValidationReport;
//# sourceMappingURL=validate-credit-governance-invariants.d.ts.map