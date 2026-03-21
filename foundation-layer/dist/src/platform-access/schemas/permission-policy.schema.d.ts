import { ActionKey } from "../enums/action-key.enum.js";
import { PolicyStatus } from "../enums/policy-status.enum.js";
import { ScopeType } from "../enums/scope-type.enum.js";
import { TargetModule } from "../enums/target-module.enum.js";
export declare const PERMISSION_POLICY_SCHEMA_ID = "https://market-design-engine.dev/schemas/platform-access/permission-policy.schema.json";
export declare const permissionPolicySchema: {
    readonly $id: "https://market-design-engine.dev/schemas/platform-access/permission-policy.schema.json";
    readonly $schema: "https://json-schema.org/draft/2020-12/schema";
    readonly type: "object";
    readonly additionalProperties: false;
    readonly required: readonly ["id", "version", "policy_key", "allowed_actions", "denied_actions_nullable", "scope_constraints", "policy_status"];
    readonly properties: {
        readonly id: {
            readonly type: "string";
            readonly pattern: "^pol_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$";
        };
        readonly version: {
            readonly type: "string";
            readonly pattern: "^v\\d+\\.\\d+\\.\\d+$";
        };
        readonly policy_key: {
            readonly type: "string";
            readonly minLength: 1;
        };
        readonly allowed_actions: {
            readonly type: "array";
            readonly items: {
                readonly type: "string";
                readonly enum: ActionKey[];
            };
            readonly minItems: 1;
            readonly uniqueItems: true;
        };
        readonly denied_actions_nullable: {
            readonly anyOf: readonly [{
                readonly type: "null";
            }, {
                readonly type: "array";
                readonly items: {
                    readonly type: "string";
                    readonly enum: ActionKey[];
                };
                readonly uniqueItems: true;
            }];
        };
        readonly scope_constraints: {
            readonly type: "array";
            readonly items: {
                readonly type: "object";
                readonly additionalProperties: false;
                readonly required: readonly ["scope_type", "workspace_id_nullable", "module_scope_nullable", "entity_scope_nullable", "notes_nullable"];
                readonly properties: {
                    readonly scope_type: {
                        readonly type: "string";
                        readonly enum: ScopeType[];
                    };
                    readonly workspace_id_nullable: {
                        readonly anyOf: readonly [{
                            readonly type: "null";
                        }, {
                            readonly type: "string";
                            readonly pattern: "^wsp_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$";
                        }];
                    };
                    readonly module_scope_nullable: {
                        readonly anyOf: readonly [{
                            readonly type: "null";
                        }, {
                            readonly type: "string";
                            readonly enum: TargetModule[];
                        }];
                    };
                    readonly entity_scope_nullable: {
                        readonly anyOf: readonly [{
                            readonly type: "null";
                        }, {
                            readonly type: "string";
                            readonly minLength: 1;
                        }];
                    };
                    readonly notes_nullable: {
                        readonly anyOf: readonly [{
                            readonly type: "null";
                        }, {
                            readonly type: "string";
                        }];
                    };
                };
            };
        };
        readonly policy_status: {
            readonly type: "string";
            readonly enum: PolicyStatus[];
        };
    };
};
//# sourceMappingURL=permission-policy.schema.d.ts.map