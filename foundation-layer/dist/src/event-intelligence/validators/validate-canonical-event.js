import { errorIssue, } from "../../entities/validation-report.entity.js";
import { buildValidationReport, requireSchemaValidator, resolveGeneratedAt, validateBySchema, } from "../../validators/common/validation-result.js";
import { CANONICAL_EVENT_INTELLIGENCE_SCHEMA_ID } from "../schemas/canonical-event.schema.js";
const validateCanonicalEventInvariants = (input) => {
    const issues = [];
    if (input.supporting_candidates.length === 0) {
        issues.push(errorIssue("MISSING_SUPPORTING_CANDIDATES", "/supporting_candidates", "supporting_candidates must contain at least one candidate id"));
    }
    if (input.supporting_observations.length === 0) {
        issues.push(errorIssue("MISSING_SUPPORTING_OBSERVATIONS", "/supporting_observations", "supporting_observations must contain at least one observation id"));
    }
    if (new Set(input.supporting_candidates).size !== input.supporting_candidates.length) {
        issues.push(errorIssue("DUPLICATE_SUPPORTING_CANDIDATES", "/supporting_candidates", "supporting_candidates must be unique"));
    }
    if (new Set(input.supporting_observations).size !== input.supporting_observations.length) {
        issues.push(errorIssue("DUPLICATE_SUPPORTING_OBSERVATIONS", "/supporting_observations", "supporting_observations must be unique"));
    }
    if (Date.parse(input.time_window.start_at) > Date.parse(input.time_window.end_at)) {
        issues.push(errorIssue("INVALID_TIME_WINDOW", "/time_window", "time_window must satisfy start_at <= end_at"));
    }
    return issues;
};
export const validateCanonicalEvent = (input, options) => {
    const schemaValidator = requireSchemaValidator(CANONICAL_EVENT_INTELLIGENCE_SCHEMA_ID);
    const schemaIssues = validateBySchema(schemaValidator, input);
    const issues = [...schemaIssues, ...validateCanonicalEventInvariants(input)];
    return buildValidationReport("CanonicalEvent", input.id, issues, resolveGeneratedAt(options));
};
//# sourceMappingURL=validate-canonical-event.js.map