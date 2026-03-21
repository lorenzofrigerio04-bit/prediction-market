import { errorIssue } from "../../../entities/validation-report.entity.js";
import { buildValidationReport, requireSchemaValidator, resolveGeneratedAt, validateBySchema, } from "../../../validators/common/validation-result.js";
import { DEADLINE_RESOLUTION_SCHEMA_ID } from "../../schemas/deadline-resolution.schema.js";
const validateDeadlineResolutionInvariants = (input) => {
    const issues = [];
    if (input.timezone.trim().length === 0) {
        issues.push(errorIssue("MISSING_TIMEZONE", "/timezone", "timezone is required"));
    }
    if (Date.parse(input.market_close_time) > Date.parse(input.event_deadline)) {
        issues.push(errorIssue("INVALID_DEADLINE_ORDERING", "/market_close_time", "market_close_time must be <= event_deadline"));
    }
    if (input.resolution_cutoff_nullable !== null &&
        Date.parse(input.market_close_time) > Date.parse(input.resolution_cutoff_nullable)) {
        issues.push(errorIssue("INVALID_DEADLINE_ORDERING", "/resolution_cutoff_nullable", "market_close_time must be <= resolution_cutoff_nullable"));
    }
    return issues;
};
export const validateDeadlineResolution = (input, options) => {
    const schemaValidator = requireSchemaValidator(DEADLINE_RESOLUTION_SCHEMA_ID);
    const schemaIssues = validateBySchema(schemaValidator, input);
    const issues = [...schemaIssues, ...validateDeadlineResolutionInvariants(input)];
    return buildValidationReport("DeadlineResolution", input.id, issues, resolveGeneratedAt(options));
};
//# sourceMappingURL=validate-deadline-resolution.js.map