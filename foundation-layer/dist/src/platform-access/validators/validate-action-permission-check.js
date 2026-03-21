import { errorIssue } from "../../entities/validation-report.entity.js";
import { buildValidationReport, requireSchemaValidator, resolveGeneratedAt, validateBySchema, } from "../../validators/common/validation-result.js";
import { CheckStatus } from "../enums/check-status.enum.js";
import { DecisionStatus } from "../enums/decision-status.enum.js";
import { ACTION_PERMISSION_CHECK_SCHEMA_ID } from "../schemas/action-permission-check.schema.js";
const validateActionPermissionInvariants = (input, context) => {
    const issues = [];
    if (input.check_status === CheckStatus.PASSED && context?.decision === undefined) {
        issues.push(errorIssue("ACTION_CHECK_PASSED_REQUIRES_DECISION_CONTEXT", "/decision_ref", "PASSED check requires decision context to verify ALLOWED status"));
    }
    if (context?.decision !== undefined) {
        if (input.decision_ref !== context.decision.id) {
            issues.push(errorIssue("ACTION_CHECK_DECISION_ID_MISMATCH", "/decision_ref", "decision_ref does not match context decision id"));
        }
        if (input.check_status === CheckStatus.PASSED && context.decision.decision_status !== DecisionStatus.ALLOWED) {
            issues.push(errorIssue("ACTION_CHECK_CONTEXT_DECISION_MISMATCH", "/check_status", "PASSED check is not coherent with DENIED context decision"));
        }
        if (input.action_key !== context.decision.requested_action) {
            issues.push(errorIssue("ACTION_CHECK_ACTION_MISMATCH", "/action_key", "action_key must match decision.requested_action"));
        }
    }
    return issues;
};
export const validateActionPermissionCheck = (input, options, context) => {
    const schemaValidator = requireSchemaValidator(ACTION_PERMISSION_CHECK_SCHEMA_ID);
    const schemaIssues = validateBySchema(schemaValidator, input);
    const invariantIssues = validateActionPermissionInvariants(input, context);
    return buildValidationReport("ActionPermissionCheck", input.id, [...schemaIssues, ...invariantIssues], resolveGeneratedAt(options));
};
//# sourceMappingURL=validate-action-permission-check.js.map