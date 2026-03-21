import { errorIssue } from "../../entities/validation-report.entity.js";
import { buildValidationReport, requireSchemaValidator, resolveGeneratedAt, validateBySchema, } from "../../validators/common/validation-result.js";
import { MANUAL_OVERRIDE_SCHEMA_ID } from "../schemas/manual-override.schema.js";
const validateManualOverrideInvariants = (input) => {
    const issues = [];
    if (input.override_reason.trim().length === 0) {
        issues.push(errorIssue("MISSING_OVERRIDE_REASON", "/override_reason", "override_reason is required"));
    }
    if (input.audit_reference_id.trim().length === 0) {
        issues.push(errorIssue("MISSING_OVERRIDE_AUDIT_REFERENCE", "/audit_reference_id", "audit_reference_id is required"));
    }
    if (input.expiration_nullable !== null &&
        Date.parse(input.expiration_nullable) <= Date.parse(input.initiated_at)) {
        issues.push(errorIssue("INVALID_OVERRIDE_EXPIRATION", "/expiration_nullable", "expiration_nullable must be greater than initiated_at"));
    }
    return issues;
};
export const validateManualOverride = (input, options) => {
    const schemaValidator = requireSchemaValidator(MANUAL_OVERRIDE_SCHEMA_ID);
    const schemaIssues = validateBySchema(schemaValidator, input);
    const invariantIssues = validateManualOverrideInvariants(input);
    return buildValidationReport("ManualOverride", input.id, [...schemaIssues, ...invariantIssues], resolveGeneratedAt(options));
};
//# sourceMappingURL=validate-manual-override.js.map