import { errorIssue } from "../../../entities/validation-report.entity.js";
import { buildValidationReport, requireSchemaValidator, resolveGeneratedAt, validateBySchema, } from "../../../validators/common/validation-result.js";
import { GOVERNANCE_AUDIT_LINK_SCHEMA_ID } from "../../schemas/governance-audit-link.schema.js";
const validateInvariants = (input) => {
    const issues = [];
    if (input.decision_ref_nullable === null && input.override_ref_nullable === null) {
        issues.push(errorIssue("AUDIT_LINK_TARGET_REQUIRED", "/decision_ref_nullable", "either decision_ref_nullable or override_ref_nullable must be set"));
    }
    return issues;
};
export const validateGovernanceAuditLink = (input, options) => {
    const schemaValidator = requireSchemaValidator(GOVERNANCE_AUDIT_LINK_SCHEMA_ID);
    const schemaIssues = validateBySchema(schemaValidator, input);
    const invariantIssues = validateInvariants(input);
    return buildValidationReport("GovernanceAuditLink", input.id, [...schemaIssues, ...invariantIssues], resolveGeneratedAt(options));
};
//# sourceMappingURL=validate-governance-audit-link.js.map