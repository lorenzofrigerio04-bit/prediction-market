import { ActionKey } from "../enums/action-key.enum.js";
export declare const ACTION_SURFACE_SCHEMA_ID = "https://market-design-engine.dev/schemas/operations-console/action-surface.schema.json";
export declare const actionSurfaceSchema: {
    readonly $id: "https://market-design-engine.dev/schemas/operations-console/action-surface.schema.json";
    readonly $schema: "https://json-schema.org/draft/2020-12/schema";
    readonly type: "object";
    readonly additionalProperties: false;
    readonly required: readonly ["id", "version", "target_ref", "available_action_keys", "hidden_action_keys", "disabled_action_keys", "action_constraints", "permission_basis"];
    readonly properties: {
        readonly id: {
            readonly type: "string";
            readonly pattern: "^asf_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$";
        };
        readonly version: {
            readonly type: "string";
            readonly pattern: "^v\\d+\\.\\d+\\.\\d+$";
        };
        readonly target_ref: {
            readonly type: "string";
            readonly minLength: 1;
        };
        readonly available_action_keys: {
            readonly type: "array";
            readonly items: {
                readonly type: "string";
                readonly enum: ActionKey[];
            };
            readonly uniqueItems: true;
        };
        readonly hidden_action_keys: {
            readonly type: "array";
            readonly items: {
                readonly type: "string";
                readonly enum: ActionKey[];
            };
            readonly uniqueItems: true;
        };
        readonly disabled_action_keys: {
            readonly type: "array";
            readonly items: {
                readonly type: "string";
                readonly enum: ActionKey[];
            };
            readonly uniqueItems: true;
        };
        readonly action_constraints: {
            readonly type: "array";
            readonly items: {
                readonly type: "object";
                readonly additionalProperties: false;
                readonly required: readonly ["constraint_ref", "description", "is_blocking"];
                readonly properties: {
                    readonly constraint_ref: {
                        readonly type: "string";
                        readonly pattern: "^acr_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$";
                    };
                    readonly description: {
                        readonly type: "string";
                        readonly minLength: 1;
                    };
                    readonly is_blocking: {
                        readonly type: "boolean";
                    };
                };
            };
        };
        readonly permission_basis: {
            readonly type: "object";
            readonly additionalProperties: false;
            readonly required: readonly ["roles", "explicit_allow_actions", "explicit_deny_actions", "deny_first"];
            readonly properties: {
                readonly roles: {
                    readonly type: "array";
                    readonly items: {
                        readonly type: "string";
                        readonly minLength: 1;
                    };
                    readonly uniqueItems: true;
                };
                readonly explicit_allow_actions: {
                    readonly type: "array";
                    readonly items: {
                        readonly type: "string";
                        readonly enum: ActionKey[];
                    };
                    readonly uniqueItems: true;
                };
                readonly explicit_deny_actions: {
                    readonly type: "array";
                    readonly items: {
                        readonly type: "string";
                        readonly enum: ActionKey[];
                    };
                    readonly uniqueItems: true;
                };
                readonly deny_first: {
                    readonly type: "boolean";
                };
            };
        };
    };
};
//# sourceMappingURL=action-surface.schema.d.ts.map