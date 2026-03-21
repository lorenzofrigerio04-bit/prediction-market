import { RoleScopePolicy } from "../enums/role-scope-policy.enum.js";
export declare const ROLE_DEFINITION_SCHEMA_ID = "https://market-design-engine.dev/schemas/platform-access/role-definition.schema.json";
export declare const roleDefinitionSchema: {
    readonly $id: "https://market-design-engine.dev/schemas/platform-access/role-definition.schema.json";
    readonly $schema: "https://json-schema.org/draft/2020-12/schema";
    readonly type: "object";
    readonly additionalProperties: false;
    readonly required: readonly ["id", "version", "role_key", "display_name", "permission_set", "role_scope_policy", "active"];
    readonly properties: {
        readonly id: {
            readonly type: "string";
            readonly pattern: "^rol_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$";
        };
        readonly version: {
            readonly type: "string";
            readonly pattern: "^v\\d+\\.\\d+\\.\\d+$";
        };
        readonly role_key: {
            readonly type: "string";
            readonly minLength: 1;
        };
        readonly display_name: {
            readonly type: "string";
            readonly minLength: 1;
        };
        readonly permission_set: {
            readonly type: "array";
            readonly items: {
                readonly type: "string";
                readonly minLength: 1;
            };
            readonly minItems: 1;
            readonly uniqueItems: true;
        };
        readonly role_scope_policy: {
            readonly type: "string";
            readonly enum: RoleScopePolicy[];
        };
        readonly active: {
            readonly type: "boolean";
        };
    };
};
//# sourceMappingURL=role-definition.schema.d.ts.map