import { buildValidationReport, resolveGeneratedAt } from "../../validators/common/validation-result.js";
import { validateCreditAuditChain } from "./validate-credit-audit-chain.js";
import { validateCreditGovernanceInvariants } from "./validate-credit-governance-invariants.js";
export const validateVirtualCreditsFamilyAggregate = (aggregate, options) => {
    const auditReport = validateCreditAuditChain(aggregate.ledgerEntries, options);
    const governanceReport = validateCreditGovernanceInvariants({
        accounts: aggregate.accounts,
        grants: aggregate.grants,
        quotaPolicies: aggregate.quotaPolicies,
    }, options);
    return buildValidationReport("VirtualCreditsFamilyAggregate", "virtual-credits-family", [...auditReport.issues, ...governanceReport.issues], resolveGeneratedAt(options));
};
//# sourceMappingURL=validate-virtual-credits-family-aggregate.js.map