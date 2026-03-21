import { ActionKey } from "../enums/action-key.enum.js";
import { ScopeType } from "../enums/scope-type.enum.js";
import { TargetModule } from "../enums/target-module.enum.js";
export declare const PLATFORM_ACTION_COMPATIBILITY_SCHEMA_ID = "https://market-design-engine.dev/schemas/platform-access/platform-action-compatibility.schema.json";
export declare const platformActionCompatibilitySchema: {
    readonly $id: "https://market-design-engine.dev/schemas/platform-access/platform-action-compatibility.schema.json";
    readonly $schema: "https://json-schema.org/draft/2020-12/schema";
    readonly type: "object";
    readonly additionalProperties: false;
    readonly required: readonly ["id", "version", "target_module", "action_key", "required_scope_type", "required_capabilities_nullable", "notes_nullable", "active"];
    readonly properties: {
        readonly id: {
            readonly type: "string";
            readonly pattern: "^pac_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$";
        };
        readonly version: {
            readonly type: "string";
            readonly pattern: "^v\\d+\\.\\d+\\.\\d+$";
        };
        readonly target_module: {
            readonly type: "string";
            readonly enum: TargetModule[];
        };
        readonly action_key: {
            readonly type: "string";
            readonly enum: ActionKey[];
        };
        readonly required_scope_type: {
            readonly type: "string";
            readonly enum: ScopeType[];
        };
        readonly required_capabilities_nullable: {
            readonly anyOf: readonly [{
                readonly type: "null";
            }, {
                readonly type: "array";
                readonly items: {
                    readonly type: "string";
                    readonly minLength: 1;
                };
                readonly uniqueItems: true;
            }];
        };
        readonly notes_nullable: {
            readonly anyOf: readonly [{
                readonly type: "null";
            }, {
                readonly type: "string";
            }];
        };
        readonly active: {
            readonly type: "boolean";
        };
    };
};
//# sourceMappingURL=platform-action-compatibility.schema.d.ts.map