import { errorIssue } from "../../entities/validation-report.entity.js";
import { buildValidationReport, resolveGeneratedAt } from "../../validators/common/validation-result.js";
const collectIssues = (context) => {
    const issues = [];
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
export const validateCreditGovernanceInvariants = (context, options) => buildValidationReport("CreditGovernanceInvariants", "virtual-credits-governance", collectIssues(context), resolveGeneratedAt(options));
//# sourceMappingURL=validate-credit-governance-invariants.js.map