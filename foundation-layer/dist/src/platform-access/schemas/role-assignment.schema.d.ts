import { ScopeType } from "../enums/scope-type.enum.js";
import { TargetModule } from "../enums/target-module.enum.js";
export declare const ROLE_ASSIGNMENT_SCHEMA_ID = "https://market-design-engine.dev/schemas/platform-access/role-assignment.schema.json";
export declare const roleAssignmentSchema: {
    readonly $id: "https://market-design-engine.dev/schemas/platform-access/role-assignment.schema.json";
    readonly $schema: "https://json-schema.org/draft/2020-12/schema";
    readonly type: "object";
    readonly additionalProperties: false;
    readonly required: readonly ["id", "version", "user_id", "role_id", "workspace_id_nullable", "access_scope", "assigned_by", "assigned_at", "active"];
    readonly properties: {
        readonly id: {
            readonly type: "string";
            readonly pattern: "^asg_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$";
        };
        readonly version: {
            readonly type: "string";
            readonly pattern: "^v\\d+\\.\\d+\\.\\d+$";
        };
        readonly user_id: {
            readonly type: "string";
            readonly pattern: "^usr_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$";
        };
        readonly role_id: {
            readonly type: "string";
            readonly pattern: "^rol_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$";
        };
        readonly workspace_id_nullable: {
            readonly anyOf: readonly [{
                readonly type: "null";
            }, {
                readonly type: "string";
                readonly pattern: "^wsp_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$";
            }];
        };
        readonly access_scope: {
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
        readonly assigned_by: {
            readonly type: "string";
            readonly pattern: "^usr_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$";
        };
        readonly assigned_at: {
            readonly type: "string";
            readonly minLength: 1;
        };
        readonly active: {
            readonly type: "boolean";
        };
    };
};
//# sourceMappingURL=role-assignment.schema.d.ts.map