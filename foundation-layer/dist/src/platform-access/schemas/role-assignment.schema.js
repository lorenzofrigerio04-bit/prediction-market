import { ScopeType } from "../enums/scope-type.enum.js";
import { TargetModule } from "../enums/target-module.enum.js";
export const ROLE_ASSIGNMENT_SCHEMA_ID = "https://market-design-engine.dev/schemas/platform-access/role-assignment.schema.json";
export const roleAssignmentSchema = {
    $id: ROLE_ASSIGNMENT_SCHEMA_ID,
    $schema: "https://json-schema.org/draft/2020-12/schema",
    type: "object",
    additionalProperties: false,
    required: [
        "id",
        "version",
        "user_id",
        "role_id",
        "workspace_id_nullable",
        "access_scope",
        "assigned_by",
        "assigned_at",
        "active",
    ],
    properties: {
        id: { type: "string", pattern: "^asg_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$" },
        version: { type: "string", pattern: "^v\\d+\\.\\d+\\.\\d+$" },
        user_id: { type: "string", pattern: "^usr_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$" },
        role_id: { type: "string", pattern: "^rol_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$" },
        workspace_id_nullable: { anyOf: [{ type: "null" }, { type: "string", pattern: "^wsp_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$" }] },
        access_scope: {
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
        assigned_by: { type: "string", pattern: "^usr_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$" },
        assigned_at: { type: "string", minLength: 1 },
        active: { type: "boolean" },
    },
};
//# sourceMappingURL=role-assignment.schema.js.map