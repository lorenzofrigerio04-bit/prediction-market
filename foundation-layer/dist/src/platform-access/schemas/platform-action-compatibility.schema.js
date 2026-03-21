import { ActionKey } from "../enums/action-key.enum.js";
import { ScopeType } from "../enums/scope-type.enum.js";
import { TargetModule } from "../enums/target-module.enum.js";
export const PLATFORM_ACTION_COMPATIBILITY_SCHEMA_ID = "https://market-design-engine.dev/schemas/platform-access/platform-action-compatibility.schema.json";
export const platformActionCompatibilitySchema = {
    $id: PLATFORM_ACTION_COMPATIBILITY_SCHEMA_ID,
    $schema: "https://json-schema.org/draft/2020-12/schema",
    type: "object",
    additionalProperties: false,
    required: [
        "id",
        "version",
        "target_module",
        "action_key",
        "required_scope_type",
        "required_capabilities_nullable",
        "notes_nullable",
        "active",
    ],
    properties: {
        id: { type: "string", pattern: "^pac_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$" },
        version: { type: "string", pattern: "^v\\d+\\.\\d+\\.\\d+$" },
        target_module: { type: "string", enum: Object.values(TargetModule) },
        action_key: { type: "string", enum: Object.values(ActionKey) },
        required_scope_type: { type: "string", enum: Object.values(ScopeType) },
        required_capabilities_nullable: {
            anyOf: [{ type: "null" }, { type: "array", items: { type: "string", minLength: 1 }, uniqueItems: true }],
        },
        notes_nullable: { anyOf: [{ type: "null" }, { type: "string" }] },
        active: { type: "boolean" },
    },
};
//# sourceMappingURL=platform-action-compatibility.schema.js.map