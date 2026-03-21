import { errorIssue } from "../../entities/validation-report.entity.js";
import { buildValidationReport, requireSchemaValidator, resolveGeneratedAt, validateBySchema, } from "../../validators/common/validation-result.js";
import { AUDIT_RECORD_SCHEMA_ID } from "../schemas/audit-record.schema.js";
const validateAuditRecordInvariants = (input) => {
    const issues = [];
    if (input.correlation_id.trim().length === 0) {
        issues.push(errorIssue("MISSING_AUDIT_CORRELATION_ID", "/correlation_id", "correlation_id is required"));
    }
    return issues;
};
export const validateAuditRecord = (input, options) => {
    const schemaValidator = requireSchemaValidator(AUDIT_RECORD_SCHEMA_ID);
    const schemaIssues = validateBySchema(schemaValidator, input);
    const invariantIssues = validateAuditRecordInvariants(input);
    return buildValidationReport("AuditRecord", input.id, [...schemaIssues, ...invariantIssues], resolveGeneratedAt(options));
};
//# sourceMappingURL=validate-audit-record.js.map