import { errorIssue, } from "../../entities/validation-report.entity.js";
import { buildValidationReport, requireSchemaValidator, resolveGeneratedAt, validateBySchema, } from "../../validators/common/validation-result.js";
import { EVENT_CONFLICT_SCHEMA_ID } from "../schemas/event-conflict.schema.js";
const validateEventConflictInvariants = (input) => {
    const issues = [];
    if (input.canonical_event_id_nullable === null && input.candidate_id_nullable === null) {
        issues.push(errorIssue("MISSING_CONFLICT_TARGET", "/canonical_event_id_nullable", "canonical_event_id_nullable or candidate_id_nullable must be provided"));
    }
    if (input.description.trim().length === 0) {
        issues.push(errorIssue("EMPTY_CONFLICT_DESCRIPTION", "/description", "description must be non-empty"));
    }
    return issues;
};
export const validateEventConflict = (input, options) => {
    const schemaValidator = requireSchemaValidator(EVENT_CONFLICT_SCHEMA_ID);
    const schemaIssues = validateBySchema(schemaValidator, input);
    const issues = [...schemaIssues, ...validateEventConflictInvariants(input)];
    return buildValidationReport("EventConflict", input.id, issues, resolveGeneratedAt(options));
};
//# sourceMappingURL=validate-event-conflict.js.map