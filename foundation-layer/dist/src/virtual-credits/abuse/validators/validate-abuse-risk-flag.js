import { errorIssue } from "../../../entities/validation-report.entity.js";
import { buildValidationReport, requireSchemaValidator, resolveGeneratedAt, validateBySchema, } from "../../../validators/common/validation-result.js";
import { ABUSE_RISK_FLAG_SCHEMA_ID } from "../../schemas/abuse-risk-flag.schema.js";
const validateInvariants = (input) => {
    const issues = [];
    if (input.active && input.related_refs.length === 0) {
        issues.push(errorIssue("ABUSE_ACTIVE_RELATED_REFS_REQUIRED", "/related_refs", "active abuse flags should include related_refs"));
    }
    return issues;
};
export const validateAbuseRiskFlag = (input, options) => {
    const schemaValidator = requireSchemaValidator(ABUSE_RISK_FLAG_SCHEMA_ID);
    const schemaIssues = validateBySchema(schemaValidator, input);
    const invariantIssues = validateInvariants(input);
    return buildValidationReport("AbuseRiskFlag", input.id, [...schemaIssues, ...invariantIssues], resolveGeneratedAt(options));
};
//# sourceMappingURL=validate-abuse-risk-flag.js.map