import { ActionKey } from "../enums/action-key.enum.js";
import { CheckStatus } from "../enums/check-status.enum.js";
import { TargetModule } from "../enums/target-module.enum.js";
export const ACTION_PERMISSION_CHECK_SCHEMA_ID = "https://market-design-engine.dev/schemas/platform-access/action-permission-check.schema.json";
export const actionPermissionCheckSchema = {
    $id: ACTION_PERMISSION_CHECK_SCHEMA_ID,
    $schema: "https://json-schema.org/draft/2020-12/schema",
    type: "object",
    additionalProperties: false,
    required: [
        "id",
        "version",
        "action_key",
        "target_module",
        "target_entity_type_nullable",
        "required_permission",
        "decision_ref",
        "check_status",
    ],
    properties: {
        id: { type: "string", pattern: "^chk_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$" },
        version: { type: "string", pattern: "^v\\d+\\.\\d+\\.\\d+$" },
        action_key: { type: "string", enum: Object.values(ActionKey) },
        target_module: { type: "string", enum: Object.values(TargetModule) },
        target_entity_type_nullable: { anyOf: [{ type: "null" }, { type: "string", minLength: 1 }] },
        required_permission: { type: "string", minLength: 1 },
        decision_ref: { type: "string", pattern: "^adz_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$" },
        check_status: { type: "string", enum: Object.values(CheckStatus) },
    },
};
//# sourceMappingURL=action-permission-check.schema.js.map