import { SeverityLevel } from "../enums/severity-level.enum.js";
import { TimelineActionType } from "../enums/timeline-action-type.enum.js";
export const AUDIT_TIMELINE_ITEM_SCHEMA_ID = "https://market-design-engine.dev/schemas/operations-console/audit-timeline-item.schema.json";
export const auditTimelineItemSchema = {
    $id: AUDIT_TIMELINE_ITEM_SCHEMA_ID,
    $schema: "https://json-schema.org/draft/2020-12/schema",
    type: "object",
    additionalProperties: false,
    required: ["item_ref", "timestamp", "actor_ref", "action_type", "summary", "severity", "linked_entity_refs"],
    properties: {
        item_ref: { type: "string", minLength: 1 },
        timestamp: { type: "string", format: "date-time" },
        actor_ref: { type: "string", pattern: "^act_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$" },
        action_type: { type: "string", enum: Object.values(TimelineActionType) },
        summary: { type: "string", minLength: 1 },
        severity: { type: "string", enum: Object.values(SeverityLevel) },
        linked_entity_refs: { type: "array", items: { type: "string", minLength: 1 }, uniqueItems: true },
    },
};
//# sourceMappingURL=audit-timeline-item.schema.js.map