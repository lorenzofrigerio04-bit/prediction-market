import { errorIssue } from "../../entities/validation-report.entity.js";
import { buildValidationReport, resolveGeneratedAt } from "../../validators/common/validation-result.js";
export const validateAdminGovernanceDenyFirstInvariants = (views, options) => {
    const issues = [];
    for (const view of views) {
        for (const operation of view.allowed_operations) {
            if (view.denied_operations.includes(operation)) {
                issues.push(errorIssue("AGGREGATE_DENY_FIRST_CONFLICT", "/allowed_operations", "allowed operation cannot also exist in denied_operations", { compatibilityViewId: view.id, operation }));
            }
        }
    }
    return buildValidationReport("AdminGovernanceDenyFirstInvariants", "admin-governance-deny-first", issues, resolveGeneratedAt(options));
};
//# sourceMappingURL=validate-admin-governance-deny-first-invariants.js.map