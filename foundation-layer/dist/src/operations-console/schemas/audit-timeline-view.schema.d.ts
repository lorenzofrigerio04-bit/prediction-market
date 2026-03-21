import { VisibilityStatus } from "../enums/visibility-status.enum.js";
export declare const AUDIT_TIMELINE_VIEW_SCHEMA_ID = "https://market-design-engine.dev/schemas/operations-console/audit-timeline-view.schema.json";
export declare const auditTimelineViewSchema: {
    readonly $id: "https://market-design-engine.dev/schemas/operations-console/audit-timeline-view.schema.json";
    readonly $schema: "https://json-schema.org/draft/2020-12/schema";
    readonly type: "object";
    readonly additionalProperties: false;
    readonly required: readonly ["id", "version", "target_ref", "timeline_items", "correlation_groups", "filter_state", "visibility_status"];
    readonly properties: {
        readonly id: {
            readonly type: "string";
            readonly pattern: "^atv_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$";
        };
        readonly version: {
            readonly type: "string";
            readonly pattern: "^v\\d+\\.\\d+\\.\\d+$";
        };
        readonly target_ref: {
            readonly type: "string";
            readonly minLength: 1;
        };
        readonly timeline_items: {
            readonly type: "array";
            readonly items: {
                readonly $ref: "https://market-design-engine.dev/schemas/operations-console/audit-timeline-item.schema.json";
            };
        };
        readonly correlation_groups: {
            readonly type: "array";
            readonly items: {
                readonly type: "object";
                readonly additionalProperties: false;
                readonly required: readonly ["group_ref", "item_refs"];
                readonly properties: {
                    readonly group_ref: {
                        readonly type: "string";
                        readonly pattern: "^cgr_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$";
                    };
                    readonly item_refs: {
                        readonly type: "array";
                        readonly items: {
                            readonly type: "string";
                            readonly minLength: 1;
                        };
                        readonly uniqueItems: true;
                    };
                };
            };
        };
        readonly filter_state: {
            readonly type: "object";
            readonly additionalProperties: false;
            readonly required: readonly ["actor_refs", "action_types", "severity_levels"];
            readonly properties: {
                readonly actor_refs: {
                    readonly type: "array";
                    readonly items: {
                        readonly type: "string";
                        readonly minLength: 1;
                    };
                    readonly uniqueItems: true;
                };
                readonly action_types: {
                    readonly type: "array";
                    readonly items: {
                        readonly type: "string";
                        readonly minLength: 1;
                    };
                    readonly uniqueItems: true;
                };
                readonly severity_levels: {
                    readonly type: "array";
                    readonly items: {
                        readonly type: "string";
                        readonly minLength: 1;
                    };
                    readonly uniqueItems: true;
                };
            };
        };
        readonly visibility_status: {
            readonly type: "string";
            readonly enum: VisibilityStatus[];
        };
    };
};
//# sourceMappingURL=audit-timeline-view.schema.d.ts.map