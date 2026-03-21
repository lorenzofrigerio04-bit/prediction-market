import { ActionKey } from "../enums/action-key.enum.js";
import { ReadinessStatus } from "../enums/readiness-status.enum.js";
import { errorIssue } from "../../entities/validation-report.entity.js";
import { buildValidationReport, requireSchemaValidator, resolveGeneratedAt, validateBySchema, } from "../../validators/common/validation-result.js";
import { READINESS_PANEL_VIEW_SCHEMA_ID } from "../schemas/readiness-panel-view.schema.js";
const validateReadinessPanelInvariants = (input) => {
    const issues = [];
    if (input.readiness_status === ReadinessStatus.READY && input.blocking_issues.length > 0) {
        issues.push(errorIssue("READY_STATE_CANNOT_HAVE_BLOCKING_ISSUES", "/blocking_issues", "ready readiness_status cannot contain blocking_issues"));
    }
    if (input.readiness_status === ReadinessStatus.READY && input.gating_items.some((item) => item.satisfied === false)) {
        issues.push(errorIssue("READY_STATE_REQUIRES_SATISFIED_GATES", "/gating_items", "ready readiness_status requires all gating_items to be satisfied"));
    }
    const impossibleActions = input.readiness_status === ReadinessStatus.BLOCKED ? [ActionKey.PUBLISH] : [];
    for (const [index, recommended] of input.recommended_next_actions.entries()) {
        if (impossibleActions.includes(recommended.action_key)) {
            issues.push(errorIssue("READINESS_RECOMMENDED_ACTION_IMPOSSIBLE", `/recommended_next_actions/${index}/action_key`, `action ${recommended.action_key} is impossible for status ${input.readiness_status}`));
        }
    }
    return issues;
};
export const validateReadinessPanelView = (input, options) => {
    const schemaValidator = requireSchemaValidator(READINESS_PANEL_VIEW_SCHEMA_ID);
    const schemaIssues = validateBySchema(schemaValidator, input);
    const invariantIssues = validateReadinessPanelInvariants(input);
    return buildValidationReport("ReadinessPanelView", input.id, [...schemaIssues, ...invariantIssues], resolveGeneratedAt(options));
};
//# sourceMappingURL=validate-readiness-panel-view.js.map