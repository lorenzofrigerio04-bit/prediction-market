import { ActionKey } from "../enums/action-key.enum.js";
import { VisibilityStatus } from "../enums/visibility-status.enum.js";
export declare const PERMISSION_AWARE_VIEW_STATE_SCHEMA_ID = "https://market-design-engine.dev/schemas/operations-console/permission-aware-view-state.schema.json";
export declare const permissionAwareViewStateSchema: {
    readonly $id: "https://market-design-engine.dev/schemas/operations-console/permission-aware-view-state.schema.json";
    readonly $schema: "https://json-schema.org/draft/2020-12/schema";
    readonly type: "object";
    readonly additionalProperties: false;
    readonly required: readonly ["id", "version", "user_id", "workspace_id_nullable", "target_view_key", "visibility_status", "allowed_actions", "denied_actions", "evaluation_basis"];
    readonly properties: {
        readonly id: {
            readonly type: "string";
            readonly pattern: "^pvs_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$";
        };
        readonly version: {
            readonly type: "string";
            readonly pattern: "^v\\d+\\.\\d+\\.\\d+$";
        };
        readonly user_id: {
            readonly type: "string";
            readonly minLength: 1;
        };
        readonly workspace_id_nullable: {
            readonly anyOf: readonly [{
                readonly type: "string";
                readonly minLength: 1;
            }, {
                readonly type: "null";
            }];
        };
        readonly target_view_key: {
            readonly type: "string";
            readonly minLength: 1;
        };
        readonly visibility_status: {
            readonly type: "string";
            readonly enum: VisibilityStatus[];
        };
        readonly allowed_actions: {
            readonly type: "array";
            readonly items: {
                readonly type: "string";
                readonly enum: ActionKey[];
            };
            readonly uniqueItems: true;
        };
        readonly denied_actions: {
            readonly type: "array";
            readonly items: {
                readonly type: "string";
                readonly enum: ActionKey[];
            };
            readonly uniqueItems: true;
        };
        readonly evaluation_basis: {
            readonly type: "object";
            readonly additionalProperties: false;
            readonly required: readonly ["source_module", "evaluated_roles", "matched_rules", "deny_reasons"];
            readonly properties: {
                readonly source_module: {
                    readonly type: "string";
                    readonly minLength: 1;
                };
                readonly evaluated_roles: {
                    readonly type: "array";
                    readonly items: {
                        readonly type: "string";
                        readonly minLength: 1;
                    };
                    readonly uniqueItems: true;
                };
                readonly matched_rules: {
                    readonly type: "array";
                    readonly items: {
                        readonly type: "string";
                        readonly minLength: 1;
                    };
                    readonly uniqueItems: true;
                };
                readonly deny_reasons: {
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
};
//# sourceMappingURL=permission-aware-view-state.schema.d.ts.map