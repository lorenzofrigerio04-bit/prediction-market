import { errorIssue } from "../../entities/validation-report.entity.js";
import { buildValidationReport, requireSchemaValidator, resolveGeneratedAt, validateBySchema, } from "../../validators/common/validation-result.js";
import { FRESHNESS_PROFILE_SCHEMA_ID } from "../schemas/freshness-profile.schema.js";
const validateFreshnessProfileInvariants = (input) => {
    const issues = [];
    if (input.expectedUpdateFrequency.trim().length === 0) {
        issues.push(errorIssue("INVALID_EXPECTED_UPDATE_FREQUENCY", "/expectedUpdateFrequency", "expectedUpdateFrequency must be non-empty"));
    }
    if (!Number.isInteger(input.freshnessTtl) || input.freshnessTtl < 0) {
        issues.push(errorIssue("INVALID_FRESHNESS_TTL", "/freshnessTtl", "freshnessTtl must be a non-negative integer"));
    }
    return issues;
};
export const validateFreshnessProfile = (input, options) => {
    const schemaValidator = requireSchemaValidator(FRESHNESS_PROFILE_SCHEMA_ID);
    const schemaIssues = validateBySchema(schemaValidator, input);
    const issues = [...schemaIssues, ...validateFreshnessProfileInvariants(input)];
    return buildValidationReport("FreshnessProfile", "freshness-profile", issues, resolveGeneratedAt(options));
};
//# sourceMappingURL=validate-freshness-profile.js.map