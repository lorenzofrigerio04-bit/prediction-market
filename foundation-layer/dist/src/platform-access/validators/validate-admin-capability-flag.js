import { errorIssue } from "../../entities/validation-report.entity.js";
import { buildValidationReport, requireSchemaValidator, resolveGeneratedAt, validateBySchema, } from "../../validators/common/validation-result.js";
import { ADMIN_CAPABILITY_FLAG_SCHEMA_ID } from "../schemas/admin-capability-flag.schema.js";
const validateAdminCapabilitySafety = (input) => {
    const issues = [];
    if (input.sensitive && input.default_enabled) {
        issues.push(errorIssue("SENSITIVE_CAPABILITY_DEFAULT_DISABLED", "/default_enabled", "sensitive capability flags must never be default enabled"));
    }
    return issues;
};
export const validateAdminCapabilityFlag = (input, options) => {
    const schemaValidator = requireSchemaValidator(ADMIN_CAPABILITY_FLAG_SCHEMA_ID);
    const schemaIssues = validateBySchema(schemaValidator, input);
    const invariantIssues = validateAdminCapabilitySafety(input);
    return buildValidationReport("AdminCapabilityFlag", input.flag_key, [...schemaIssues, ...invariantIssues], resolveGeneratedAt(options));
};
//# sourceMappingURL=validate-admin-capability-flag.js.map