import { ActionKey } from "../enums/action-key.enum.js";
import { ReadinessStatus } from "../enums/readiness-status.enum.js";
export declare const READINESS_PANEL_VIEW_SCHEMA_ID = "https://market-design-engine.dev/schemas/operations-console/readiness-panel-view.schema.json";
export declare const readinessPanelViewSchema: {
    readonly $id: "https://market-design-engine.dev/schemas/operations-console/readiness-panel-view.schema.json";
    readonly $schema: "https://json-schema.org/draft/2020-12/schema";
    readonly type: "object";
    readonly additionalProperties: false;
    readonly required: readonly ["id", "version", "target_ref", "readiness_status", "gating_items", "blocking_issues", "warnings", "recommended_next_actions"];
    readonly properties: {
        readonly id: {
            readonly type: "string";
            readonly pattern: "^rpv_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$";
        };
        readonly version: {
            readonly type: "string";
            readonly pattern: "^v\\d+\\.\\d+\\.\\d+$";
        };
        readonly target_ref: {
            readonly type: "string";
            readonly minLength: 1;
        };
        readonly readiness_status: {
            readonly type: "string";
            readonly enum: ReadinessStatus[];
        };
        readonly gating_items: {
            readonly type: "array";
            readonly items: {
                readonly type: "object";
                readonly additionalProperties: false;
                readonly required: readonly ["key", "satisfied", "reason_nullable"];
                readonly properties: {
                    readonly key: {
                        readonly type: "string";
                        readonly minLength: 1;
                    };
                    readonly satisfied: {
                        readonly type: "boolean";
                    };
                    readonly reason_nullable: {
                        readonly anyOf: readonly [{
                            readonly type: "string";
                            readonly minLength: 1;
                        }, {
                            readonly type: "null";
                        }];
                    };
                };
            };
        };
        readonly blocking_issues: {
            readonly type: "array";
            readonly items: {
                readonly type: "string";
                readonly minLength: 1;
            };
        };
        readonly warnings: {
            readonly type: "array";
            readonly items: {
                readonly type: "string";
                readonly minLength: 1;
            };
        };
        readonly recommended_next_actions: {
            readonly type: "array";
            readonly items: {
                readonly type: "object";
                readonly additionalProperties: false;
                readonly required: readonly ["action_key", "reason"];
                readonly properties: {
                    readonly action_key: {
                        readonly type: "string";
                        readonly enum: ActionKey[];
                    };
                    readonly reason: {
                        readonly type: "string";
                        readonly minLength: 1;
                    };
                };
            };
        };
    };
};
//# sourceMappingURL=readiness-panel-view.schema.d.ts.map