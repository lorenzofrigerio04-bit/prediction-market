import { ActionKey } from "../enums/action-key.enum.js";
export const ACTION_SURFACE_SCHEMA_ID = "https://market-design-engine.dev/schemas/operations-console/action-surface.schema.json";
export const actionSurfaceSchema = {
    $id: ACTION_SURFACE_SCHEMA_ID,
    $schema: "https://json-schema.org/draft/2020-12/schema",
    type: "object",
    additionalProperties: false,
    required: [
        "id",
        "version",
        "target_ref",
        "available_action_keys",
        "hidden_action_keys",
        "disabled_action_keys",
        "action_constraints",
        "permission_basis",
    ],
    properties: {
        id: { type: "string", pattern: "^asf_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$" },
        version: { type: "string", pattern: "^v\\d+\\.\\d+\\.\\d+$" },
        target_ref: { type: "string", minLength: 1 },
        available_action_keys: { type: "array", items: { type: "string", enum: Object.values(ActionKey) }, uniqueItems: true },
        hidden_action_keys: { type: "array", items: { type: "string", enum: Object.values(ActionKey) }, uniqueItems: true },
        disabled_action_keys: { type: "array", items: { type: "string", enum: Object.values(ActionKey) }, uniqueItems: true },
        action_constraints: {
            type: "array",
            items: {
                type: "object",
                additionalProperties: false,
                required: ["constraint_ref", "description", "is_blocking"],
                properties: {
                    constraint_ref: { type: "string", pattern: "^acr_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$" },
                    description: { type: "string", minLength: 1 },
                    is_blocking: { type: "boolean" },
                },
            },
        },
        permission_basis: {
            type: "object",
            additionalProperties: false,
            required: ["roles", "explicit_allow_actions", "explicit_deny_actions", "deny_first"],
            properties: {
                roles: { type: "array", items: { type: "string", minLength: 1 }, uniqueItems: true },
                explicit_allow_actions: { type: "array", items: { type: "string", enum: Object.values(ActionKey) }, uniqueItems: true },
                explicit_deny_actions: { type: "array", items: { type: "string", enum: Object.values(ActionKey) }, uniqueItems: true },
                deny_first: { type: "boolean" },
            },
        },
    },
};
//# sourceMappingURL=action-surface.schema.js.map