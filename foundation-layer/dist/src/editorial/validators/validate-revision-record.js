import { errorIssue } from "../../entities/validation-report.entity.js";
import { buildValidationReport, requireSchemaValidator, resolveGeneratedAt, validateBySchema, } from "../../validators/common/validation-result.js";
import { REVISION_RECORD_SCHEMA_ID } from "../schemas/revision-record.schema.js";
const validateRevisionRecordInvariants = (input) => {
    const issues = [];
    if (input.changed_fields.length === 0) {
        issues.push(errorIssue("MISSING_CHANGED_FIELDS", "/changed_fields", "changed_fields must not be empty"));
    }
    return issues;
};
export const validateRevisionRecord = (input, options) => {
    const schemaValidator = requireSchemaValidator(REVISION_RECORD_SCHEMA_ID);
    const schemaIssues = validateBySchema(schemaValidator, input);
    const invariantIssues = validateRevisionRecordInvariants(input);
    return buildValidationReport("RevisionRecord", input.id, [...schemaIssues, ...invariantIssues], resolveGeneratedAt(options));
};
//# sourceMappingURL=validate-revision-record.js.map