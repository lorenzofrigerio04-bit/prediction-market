import { SeverityLevel } from "../enums/severity-level.enum.js";
import { TimelineActionType } from "../enums/timeline-action-type.enum.js";
export declare const AUDIT_TIMELINE_ITEM_SCHEMA_ID = "https://market-design-engine.dev/schemas/operations-console/audit-timeline-item.schema.json";
export declare const auditTimelineItemSchema: {
    readonly $id: "https://market-design-engine.dev/schemas/operations-console/audit-timeline-item.schema.json";
    readonly $schema: "https://json-schema.org/draft/2020-12/schema";
    readonly type: "object";
    readonly additionalProperties: false;
    readonly required: readonly ["item_ref", "timestamp", "actor_ref", "action_type", "summary", "severity", "linked_entity_refs"];
    readonly properties: {
        readonly item_ref: {
            readonly type: "string";
            readonly minLength: 1;
        };
        readonly timestamp: {
            readonly type: "string";
            readonly format: "date-time";
        };
        readonly actor_ref: {
            readonly type: "string";
            readonly pattern: "^act_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$";
        };
        readonly action_type: {
            readonly type: "string";
            readonly enum: TimelineActionType[];
        };
        readonly summary: {
            readonly type: "string";
            readonly minLength: 1;
        };
        readonly severity: {
            readonly type: "string";
            readonly enum: SeverityLevel[];
        };
        readonly linked_entity_refs: {
            readonly type: "array";
            readonly items: {
                readonly type: "string";
                readonly minLength: 1;
            };
            readonly uniqueItems: true;
        };
    };
};
//# sourceMappingURL=audit-timeline-item.schema.d.ts.map