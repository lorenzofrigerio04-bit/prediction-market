import { PanelKey } from "../enums/panel-key.enum.js";
import { QueueScope } from "../enums/queue-scope.enum.js";
import { FilterOperator } from "../enums/filter-operator.enum.js";
import { SortDirection } from "../enums/sort-direction.enum.js";
import { VisibilityStatus } from "../enums/visibility-status.enum.js";
export declare const QUEUE_PANEL_VIEW_SCHEMA_ID = "https://market-design-engine.dev/schemas/operations-console/queue-panel-view.schema.json";
export declare const queuePanelViewSchema: {
    readonly $id: "https://market-design-engine.dev/schemas/operations-console/queue-panel-view.schema.json";
    readonly $schema: "https://json-schema.org/draft/2020-12/schema";
    readonly type: "object";
    readonly additionalProperties: false;
    readonly required: readonly ["id", "version", "panel_key", "queue_scope", "entries", "filters", "sort_config", "summary_counts", "visibility_rules"];
    readonly properties: {
        readonly id: {
            readonly type: "string";
            readonly pattern: "^qpv_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$";
        };
        readonly version: {
            readonly type: "string";
            readonly pattern: "^v\\d+\\.\\d+\\.\\d+$";
        };
        readonly panel_key: {
            readonly type: "string";
            readonly enum: PanelKey[];
        };
        readonly queue_scope: {
            readonly type: "string";
            readonly enum: QueueScope[];
        };
        readonly entries: {
            readonly type: "array";
            readonly items: {
                readonly $ref: "https://market-design-engine.dev/schemas/operations-console/queue-entry-view.schema.json";
            };
        };
        readonly filters: {
            readonly type: "array";
            readonly items: {
                readonly type: "object";
                readonly additionalProperties: false;
                readonly required: readonly ["field", "operator", "value"];
                readonly properties: {
                    readonly field: {
                        readonly type: "string";
                        readonly minLength: 1;
                    };
                    readonly operator: {
                        readonly type: "string";
                        readonly enum: FilterOperator[];
                    };
                    readonly value: {
                        readonly type: "string";
                        readonly minLength: 1;
                    };
                };
            };
        };
        readonly sort_config: {
            readonly type: "object";
            readonly additionalProperties: false;
            readonly required: readonly ["sort_field", "sort_direction"];
            readonly properties: {
                readonly sort_field: {
                    readonly type: "string";
                    readonly minLength: 1;
                };
                readonly sort_direction: {
                    readonly type: "string";
                    readonly enum: SortDirection[];
                };
            };
        };
        readonly summary_counts: {
            readonly type: "object";
            readonly additionalProperties: false;
            readonly required: readonly ["total", "ready", "blocked", "warnings"];
            readonly properties: {
                readonly total: {
                    readonly type: "integer";
                    readonly minimum: 0;
                };
                readonly ready: {
                    readonly type: "integer";
                    readonly minimum: 0;
                };
                readonly blocked: {
                    readonly type: "integer";
                    readonly minimum: 0;
                };
                readonly warnings: {
                    readonly type: "integer";
                    readonly minimum: 0;
                };
            };
        };
        readonly visibility_rules: {
            readonly type: "array";
            readonly items: {
                readonly type: "object";
                readonly additionalProperties: false;
                readonly required: readonly ["permission_key", "expected_visibility"];
                readonly properties: {
                    readonly permission_key: {
                        readonly type: "string";
                        readonly minLength: 1;
                    };
                    readonly expected_visibility: {
                        readonly type: "string";
                        readonly enum: VisibilityStatus[];
                    };
                };
            };
        };
    };
};
//# sourceMappingURL=queue-panel-view.schema.d.ts.map