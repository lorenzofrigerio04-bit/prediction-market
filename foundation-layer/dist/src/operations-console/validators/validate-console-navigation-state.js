import { PanelKey } from "../enums/panel-key.enum.js";
import { PersistedStatePolicy } from "../enums/persisted-state-policy.enum.js";
import { errorIssue } from "../../entities/validation-report.entity.js";
import { buildValidationReport, requireSchemaValidator, resolveGeneratedAt, validateBySchema, } from "../../validators/common/validation-result.js";
import { CONSOLE_NAVIGATION_STATE_SCHEMA_ID } from "../schemas/console-navigation-state.schema.js";
const validateNavigationInvariants = (input) => {
    const issues = [];
    if (!Object.values(PanelKey).includes(input.active_panel)) {
        issues.push(errorIssue("ACTIVE_PANEL_INVALID", "/active_panel", "active_panel must be a known PanelKey"));
    }
    const firstBreadcrumb = input.breadcrumb_state.items.at(0);
    if (firstBreadcrumb === undefined || firstBreadcrumb.includes(input.active_panel) === false) {
        issues.push(errorIssue("BREADCRUMB_PANEL_MISMATCH", "/breadcrumb_state", "breadcrumb_state must include active_panel as first breadcrumb item"));
    }
    if (input.persisted_state_policy === PersistedStatePolicy.NONE &&
        input.selected_entity_ref_nullable !== null) {
        issues.push(errorIssue("NON_PERSISTED_STATE_CANNOT_KEEP_SELECTION", "/selected_entity_ref_nullable", "selected_entity_ref_nullable must be null when persisted_state_policy is none"));
    }
    if (input.active_panel === PanelKey.CANDIDATE_DETAIL &&
        (input.selected_entity_ref_nullable === null || input.selected_entity_ref_nullable.trim().length === 0)) {
        issues.push(errorIssue("DETAIL_PANEL_REQUIRES_SELECTION", "/selected_entity_ref_nullable", "candidate detail panel requires selected_entity_ref_nullable"));
    }
    return issues;
};
export const validateConsoleNavigationState = (input, options) => {
    const schemaValidator = requireSchemaValidator(CONSOLE_NAVIGATION_STATE_SCHEMA_ID);
    const schemaIssues = validateBySchema(schemaValidator, input);
    const invariantIssues = validateNavigationInvariants(input);
    return buildValidationReport("ConsoleNavigationState", input.id, [...schemaIssues, ...invariantIssues], resolveGeneratedAt(options));
};
//# sourceMappingURL=validate-console-navigation-state.js.map