import { VisibilityStatus } from "../enums/visibility-status.enum.js";
import { errorIssue } from "../../entities/validation-report.entity.js";
import { buildValidationReport, requireSchemaValidator, resolveGeneratedAt, validateBySchema, } from "../../validators/common/validation-result.js";
import { AUDIT_TIMELINE_VIEW_SCHEMA_ID } from "../schemas/audit-timeline-view.schema.js";
const validateAuditTimelineInvariants = (input) => {
    const issues = [];
    const itemRefs = input.timeline_items.map((item) => item.item_ref);
    if (new Set(itemRefs).size !== itemRefs.length) {
        issues.push(errorIssue("AUDIT_ITEM_REF_DUPLICATE", "/timeline_items", "timeline_items must have unique item_ref"));
    }
    for (const [index, item] of input.timeline_items.entries()) {
        if (item.timestamp.trim().length === 0) {
            issues.push(errorIssue("AUDIT_ITEM_TIMESTAMP_REQUIRED", `/timeline_items/${index}/timestamp`, "timestamp is required"));
        }
    }
    const sorted = [...input.timeline_items].sort((left, right) => left.timestamp.localeCompare(right.timestamp));
    if (JSON.stringify(sorted.map((item) => item.item_ref)) !== JSON.stringify(input.timeline_items.map((item) => item.item_ref))) {
        issues.push(errorIssue("AUDIT_TIMELINE_NOT_DETERMINISTICALLY_ORDERED", "/timeline_items", "timeline_items must be sorted by timestamp for deterministic rendering"));
    }
    if (input.visibility_status === VisibilityStatus.HIDDEN && input.timeline_items.length > 0) {
        issues.push(errorIssue("HIDDEN_AUDIT_TIMELINE_WITH_ITEMS", "/visibility_status", "hidden timeline cannot expose timeline_items"));
    }
    return issues;
};
export const validateAuditTimelineView = (input, options) => {
    const schemaValidator = requireSchemaValidator(AUDIT_TIMELINE_VIEW_SCHEMA_ID);
    const schemaIssues = validateBySchema(schemaValidator, input);
    const invariantIssues = validateAuditTimelineInvariants(input);
    return buildValidationReport("AuditTimelineView", input.id, [...schemaIssues, ...invariantIssues], resolveGeneratedAt(options));
};
//# sourceMappingURL=validate-audit-timeline-view.js.map