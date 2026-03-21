import { ActionKey } from "../enums/action-key.enum.js";
import { VisibilityStatus } from "../enums/visibility-status.enum.js";
export const PERMISSION_AWARE_VIEW_STATE_SCHEMA_ID = "https://market-design-engine.dev/schemas/operations-console/permission-aware-view-state.schema.json";
export const permissionAwareViewStateSchema = {
    $id: PERMISSION_AWARE_VIEW_STATE_SCHEMA_ID,
    $schema: "https://json-schema.org/draft/2020-12/schema",
    type: "object",
    additionalProperties: false,
    required: [
        "id",
        "version",
        "user_id",
        "workspace_id_nullable",
        "target_view_key",
        "visibility_status",
        "allowed_actions",
        "denied_actions",
        "evaluation_basis",
    ],
    properties: {
        id: { type: "string", pattern: "^pvs_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$" },
        version: { type: "string", pattern: "^v\\d+\\.\\d+\\.\\d+$" },
        user_id: { type: "string", minLength: 1 },
        workspace_id_nullable: { anyOf: [{ type: "string", minLength: 1 }, { type: "null" }] },
        target_view_key: { type: "string", minLength: 1 },
        visibility_status: { type: "string", enum: Object.values(VisibilityStatus) },
        allowed_actions: { type: "array", items: { type: "string", enum: Object.values(ActionKey) }, uniqueItems: true },
        denied_actions: { type: "array", items: { type: "string", enum: Object.values(ActionKey) }, uniqueItems: true },
        evaluation_basis: {
            type: "object",
            additionalProperties: false,
            required: ["source_module", "evaluated_roles", "matched_rules", "deny_reasons"],
            properties: {
                source_module: { type: "string", minLength: 1 },
                evaluated_roles: { type: "array", items: { type: "string", minLength: 1 }, uniqueItems: true },
                matched_rules: { type: "array", items: { type: "string", minLength: 1 }, uniqueItems: true },
                deny_reasons: { type: "array", items: { type: "string", minLength: 1 }, uniqueItems: true },
            },
        },
    },
};
//# sourceMappingURL=permission-aware-view-state.schema.js.map