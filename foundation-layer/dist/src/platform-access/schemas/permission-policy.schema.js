import { ActionKey } from "../enums/action-key.enum.js";
import { PolicyStatus } from "../enums/policy-status.enum.js";
import { ScopeType } from "../enums/scope-type.enum.js";
import { TargetModule } from "../enums/target-module.enum.js";
export const PERMISSION_POLICY_SCHEMA_ID = "https://market-design-engine.dev/schemas/platform-access/permission-policy.schema.json";
export const permissionPolicySchema = {
    $id: PERMISSION_POLICY_SCHEMA_ID,
    $schema: "https://json-schema.org/draft/2020-12/schema",
    type: "object",
    additionalProperties: false,
    required: [
        "id",
        "version",
        "policy_key",
        "allowed_actions",
        "denied_actions_nullable",
        "scope_constraints",
        "policy_status",
    ],
    properties: {
        id: { type: "string", pattern: "^pol_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$" },
        version: { type: "string", pattern: "^v\\d+\\.\\d+\\.\\d+$" },
        policy_key: { type: "string", minLength: 1 },
        allowed_actions: {
            type: "array",
            items: { type: "string", enum: Object.values(ActionKey) },
            minItems: 1,
            uniqueItems: true,
        },
        denied_actions_nullable: {
            anyOf: [
                { type: "null" },
                {
                    type: "array",
                    items: { type: "string", enum: Object.values(ActionKey) },
                    uniqueItems: true,
                },
            ],
        },
        scope_constraints: {
            type: "array",
            items: {
                type: "object",
                additionalProperties: false,
                required: ["scope_type", "workspace_id_nullable", "module_scope_nullable", "entity_scope_nullable", "notes_nullable"],
                properties: {
                    scope_type: { type: "string", enum: Object.values(ScopeType) },
                    workspace_id_nullable: {
                        anyOf: [{ type: "null" }, { type: "string", pattern: "^wsp_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$" }],
                    },
                    module_scope_nullable: { anyOf: [{ type: "null" }, { type: "string", enum: Object.values(TargetModule) }] },
                    entity_scope_nullable: { anyOf: [{ type: "null" }, { type: "string", minLength: 1 }] },
                    notes_nullable: { anyOf: [{ type: "null" }, { type: "string" }] },
                },
            },
        },
        policy_status: { type: "string", enum: Object.values(PolicyStatus) },
    },
};
//# sourceMappingURL=permission-policy.schema.js.map