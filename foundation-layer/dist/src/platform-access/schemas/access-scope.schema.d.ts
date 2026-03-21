import { TargetModule } from "../enums/target-module.enum.js";
import { ScopeType } from "../enums/scope-type.enum.js";
export declare const ACCESS_SCOPE_SCHEMA_ID = "https://market-design-engine.dev/schemas/platform-access/access-scope.schema.json";
export declare const accessScopeSchema: {
    readonly $id: "https://market-design-engine.dev/schemas/platform-access/access-scope.schema.json";
    readonly $schema: "https://json-schema.org/draft/2020-12/schema";
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
//# sourceMappingURL=access-scope.schema.d.ts.map