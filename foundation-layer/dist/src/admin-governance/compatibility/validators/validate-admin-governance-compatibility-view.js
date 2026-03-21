import { errorIssue } from "../../../entities/validation-report.entity.js";
import { buildValidationReport, requireSchemaValidator, resolveGeneratedAt, validateBySchema, } from "../../../validators/common/validation-result.js";
import { ADMIN_GOVERNANCE_COMPATIBILITY_VIEW_SCHEMA_ID } from "../../schemas/admin-governance-compatibility-view.schema.js";
const unique = (values) => new Set(values).size === values.length;
const validateInvariants = (input, context) => {
    const issues = [];
    if (!unique(input.allowed_operations)) {
        issues.push(errorIssue("COMPAT_ALLOWED_DUPLICATE", "/allowed_operations", "allowed_operations must be unique"));
    }
    if (!unique(input.denied_operations)) {
        issues.push(errorIssue("COMPAT_DENIED_DUPLICATE", "/denied_operations", "denied_operations must be unique"));
    }
    if (input.allowed_operations.some((operation) => input.denied_operations.includes(operation))) {
        issues.push(errorIssue("COMPAT_DENY_FIRST_VIOLATION", "/allowed_operations", "deny-first semantics require disjoint allowed/denied sets"));
    }
    if (context !== undefined) {
        for (const operation of input.allowed_operations) {
            if (!context.requested_operations.includes(operation)) {
                issues.push(errorIssue("COMPAT_ESCALATION_NOT_ALLOWED", "/allowed_operations", "compatibility view cannot escalate operations beyond requested_operations"));
                break;
            }
        }
        for (const operation of context.denied_operations) {
            if (!input.denied_operations.includes(operation)) {
                issues.push(errorIssue("COMPAT_INCOMPLETE_DENY", "/denied_operations", "compatibility view must preserve all denied operations from context"));
                break;
            }
        }
    }
    return issues;
};
export const validateAdminGovernanceCompatibilityView = (input, options, context) => {
    const schemaValidator = requireSchemaValidator(ADMIN_GOVERNANCE_COMPATIBILITY_VIEW_SCHEMA_ID);
    const schemaIssues = validateBySchema(schemaValidator, input);
    const invariantIssues = validateInvariants(input, context);
    return buildValidationReport("AdminGovernanceCompatibilityView", input.id, [...schemaIssues, ...invariantIssues], resolveGeneratedAt(options));
};
//# sourceMappingURL=validate-admin-governance-compatibility-view.js.map