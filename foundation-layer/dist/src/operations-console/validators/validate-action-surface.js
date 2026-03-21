import { errorIssue } from "../../entities/validation-report.entity.js";
import { buildValidationReport, requireSchemaValidator, resolveGeneratedAt, validateBySchema, } from "../../validators/common/validation-result.js";
import { ACTION_SURFACE_SCHEMA_ID } from "../schemas/action-surface.schema.js";
const validateActionSurfaceInvariants = (input) => {
    const issues = [];
    const deniedSet = new Set(input.permission_basis.explicit_deny_actions);
    for (const [index, action] of input.available_action_keys.entries()) {
        if (deniedSet.has(action)) {
            issues.push(errorIssue("ACTION_SURFACE_EXPOSES_DENIED_ACTION", `/available_action_keys/${index}`, `action ${action} is denied by permission_basis`));
        }
    }
    const allSets = new Map();
    const add = (bucket, values) => {
        for (const value of values) {
            const current = allSets.get(value) ?? [];
            current.push(bucket);
            allSets.set(value, current);
        }
    };
    add("available_action_keys", input.available_action_keys);
    add("hidden_action_keys", input.hidden_action_keys);
    add("disabled_action_keys", input.disabled_action_keys);
    for (const [action, buckets] of allSets.entries()) {
        if (buckets.length > 1) {
            issues.push(errorIssue("ACTION_SURFACE_OVERLAPPING_BUCKETS", "/", `action ${action} appears in multiple buckets: ${buckets.join(",")}`));
        }
    }
    if (!input.permission_basis.deny_first) {
        issues.push(errorIssue("ACTION_SURFACE_DENY_FIRST_REQUIRED", "/permission_basis/deny_first", "permission_basis must preserve deny-first semantics"));
    }
    return issues;
};
export const validateActionSurface = (input, options) => {
    const schemaValidator = requireSchemaValidator(ACTION_SURFACE_SCHEMA_ID);
    const schemaIssues = validateBySchema(schemaValidator, input);
    const invariantIssues = validateActionSurfaceInvariants(input);
    return buildValidationReport("ActionSurface", input.id, [...schemaIssues, ...invariantIssues], resolveGeneratedAt(options));
};
//# sourceMappingURL=validate-action-surface.js.map