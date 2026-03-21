import { buildValidationReport, requireSchemaValidator, resolveGeneratedAt, validateBySchema, } from "../../validators/common/validation-result.js";
import { AUDIT_TIMELINE_ITEM_SCHEMA_ID } from "../schemas/audit-timeline-item.schema.js";
export const validateAuditTimelineItem = (input, options) => {
    const schemaValidator = requireSchemaValidator(AUDIT_TIMELINE_ITEM_SCHEMA_ID);
    const schemaIssues = validateBySchema(schemaValidator, input);
    return buildValidationReport("AuditTimelineItem", input.item_ref, schemaIssues, resolveGeneratedAt(options));
};
//# sourceMappingURL=validate-audit-timeline-item.js.map