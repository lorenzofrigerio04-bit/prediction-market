import { errorIssue } from "../../../entities/validation-report.entity.js";
import { buildValidationReport, requireSchemaValidator, resolveGeneratedAt, validateBySchema, } from "../../../validators/common/validation-result.js";
import { CREDITS_COMPATIBILITY_VIEW_SCHEMA_ID } from "../../schemas/credits-compatibility-view.schema.js";
const validateInvariants = (input, context) => {
    const issues = [];
    if (new Set(input.allowed_actions).size !== input.allowed_actions.length) {
        issues.push(errorIssue("COMPATIBILITY_ALLOWED_ACTIONS_DUPLICATE", "/allowed_actions", "allowed_actions must be unique"));
    }
    if (context !== undefined) {
        for (const action of input.allowed_actions) {
            if (!context.allowed_actions.includes(action)) {
                issues.push(errorIssue("COMPATIBILITY_ACTION_ESCALATION", "/allowed_actions", "deny-first adapter cannot escalate action permissions"));
                break;
            }
        }
        if (context.visible_balance_nullable === null && input.visible_balance_nullable !== null) {
            issues.push(errorIssue("COMPATIBILITY_BALANCE_ESCALATION", "/visible_balance_nullable", "cannot expose a balance when source has none"));
        }
    }
    return issues;
};
export const validateCreditsCompatibility = (input, options, context) => {
    const schemaValidator = requireSchemaValidator(CREDITS_COMPATIBILITY_VIEW_SCHEMA_ID);
    const schemaIssues = validateBySchema(schemaValidator, input);
    const invariantIssues = validateInvariants(input, context);
    return buildValidationReport("CreditsCompatibilityView", input.id, [...schemaIssues, ...invariantIssues], resolveGeneratedAt(options));
};
//# sourceMappingURL=validate-credits-compatibility.js.map