import { errorIssue } from "../../entities/validation-report.entity.js";
import { buildValidationReport, resolveGeneratedAt, } from "../../validators/common/validation-result.js";
const visibilityRank = {
    hidden: 0,
    partial: 1,
    visible: 2,
};
const validateCompatibilityInvariants = (input, context) => {
    const issues = [];
    const allowed = new Set(input.propagated_allowed_actions);
    for (const denied of input.propagated_denied_actions) {
        if (allowed.has(denied)) {
            issues.push(errorIssue("COMPATIBILITY_ACTION_OVERLAP", "/", "propagated_allowed_actions and propagated_denied_actions must not overlap"));
            break;
        }
    }
    if (context !== undefined) {
        if (visibilityRank[input.propagated_visibility] > visibilityRank[context.source_visibility]) {
            issues.push(errorIssue("COMPATIBILITY_VISIBILITY_ESCALATION", "/propagated_visibility", "adapter cannot promote visibility beyond source module"));
        }
        for (const action of input.propagated_allowed_actions) {
            if (!context.source_allowed_actions.includes(action) || context.source_denied_actions.includes(action)) {
                issues.push(errorIssue("COMPATIBILITY_ACTION_ESCALATION", "/propagated_allowed_actions", "adapter cannot invent or elevate allowed actions"));
                break;
            }
        }
    }
    return issues;
};
export const validateOperationsConsoleCompatibility = (input, options, context) => {
    const invariantIssues = validateCompatibilityInvariants(input, context);
    return buildValidationReport("OperationsConsoleCompatibilityResult", input.id, invariantIssues, resolveGeneratedAt(options));
};
//# sourceMappingURL=validate-operations-console-compatibility.js.map