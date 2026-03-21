import { errorIssue } from "../../entities/validation-report.entity.js";
import { buildValidationReport, requireSchemaValidator, resolveGeneratedAt, validateBySchema, } from "../../validators/common/validation-result.js";
import { DecisionStatus } from "../enums/decision-status.enum.js";
import { AUTHORIZATION_DECISION_SCHEMA_ID } from "../schemas/authorization-decision.schema.js";
const validateDecisionInvariants = (input) => {
    const issues = [];
    if (input.decision_status === DecisionStatus.DENIED && input.blocking_reasons.length === 0) {
        issues.push(errorIssue("AUTHORIZATION_DENIED_REQUIRES_REASON", "/blocking_reasons", "DENIED decision must include at least one blocking reason"));
    }
    if (input.decision_status === DecisionStatus.ALLOWED && input.blocking_reasons.length > 0) {
        issues.push(errorIssue("AUTHORIZATION_ALLOWED_REQUIRES_EMPTY_REASONS", "/blocking_reasons", "ALLOWED decision must not include blocking reasons"));
    }
    return issues;
};
export const validateAuthorizationDecision = (input, options) => {
    const schemaValidator = requireSchemaValidator(AUTHORIZATION_DECISION_SCHEMA_ID);
    const schemaIssues = validateBySchema(schemaValidator, input);
    const invariantIssues = validateDecisionInvariants(input);
    return buildValidationReport("AuthorizationDecision", input.id, [...schemaIssues, ...invariantIssues], resolveGeneratedAt(options));
};
//# sourceMappingURL=validate-authorization-decision.js.map