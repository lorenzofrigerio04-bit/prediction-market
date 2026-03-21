import { VisibilityStatus } from "../enums/visibility-status.enum.js";
export const AUDIT_TIMELINE_VIEW_SCHEMA_ID = "https://market-design-engine.dev/schemas/operations-console/audit-timeline-view.schema.json";
export const auditTimelineViewSchema = {
    $id: AUDIT_TIMELINE_VIEW_SCHEMA_ID,
    $schema: "https://json-schema.org/draft/2020-12/schema",
    type: "object",
    additionalProperties: false,
    required: [
        "id",
        "version",
        "target_ref",
        "timeline_items",
        "correlation_groups",
        "filter_state",
        "visibility_status",
    ],
    properties: {
        id: { type: "string", pattern: "^atv_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$" },
        version: { type: "string", pattern: "^v\\d+\\.\\d+\\.\\d+$" },
        target_ref: { type: "string", minLength: 1 },
        timeline_items: {
            type: "array",
            items: { $ref: "https://market-design-engine.dev/schemas/operations-console/audit-timeline-item.schema.json" },
        },
        correlation_groups: {
            type: "array",
            items: {
                type: "object",
                additionalProperties: false,
                required: ["group_ref", "item_refs"],
                properties: {
                    group_ref: { type: "string", pattern: "^cgr_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$" },
                    item_refs: { type: "array", items: { type: "string", minLength: 1 }, uniqueItems: true },
                },
            },
        },
        filter_state: {
            type: "object",
            additionalProperties: false,
            required: ["actor_refs", "action_types", "severity_levels"],
            properties: {
                actor_refs: { type: "array", items: { type: "string", minLength: 1 }, uniqueItems: true },
                action_types: { type: "array", items: { type: "string", minLength: 1 }, uniqueItems: true },
                severity_levels: { type: "array", items: { type: "string", minLength: 1 }, uniqueItems: true },
            },
        },
        visibility_status: { type: "string", enum: Object.values(VisibilityStatus) },
    },
};
//# sourceMappingURL=audit-timeline-view.schema.js.map