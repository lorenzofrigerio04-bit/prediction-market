import { ActionKey } from "../enums/action-key.enum.js";
import { CheckStatus } from "../enums/check-status.enum.js";
import { TargetModule } from "../enums/target-module.enum.js";
export declare const ACTION_PERMISSION_CHECK_SCHEMA_ID = "https://market-design-engine.dev/schemas/platform-access/action-permission-check.schema.json";
export declare const actionPermissionCheckSchema: {
    readonly $id: "https://market-design-engine.dev/schemas/platform-access/action-permission-check.schema.json";
    readonly $schema: "https://json-schema.org/draft/2020-12/schema";
    readonly type: "object";
    readonly additionalProperties: false;
    readonly required: readonly ["id", "version", "action_key", "target_module", "target_entity_type_nullable", "required_permission", "decision_ref", "check_status"];
    readonly properties: {
        readonly id: {
            readonly type: "string";
            readonly pattern: "^chk_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$";
        };
        readonly version: {
            readonly type: "string";
            readonly pattern: "^v\\d+\\.\\d+\\.\\d+$";
        };
        readonly action_key: {
            readonly type: "string";
            readonly enum: ActionKey[];
        };
        readonly target_module: {
            readonly type: "string";
            readonly enum: TargetModule[];
        };
        readonly target_entity_type_nullable: {
            readonly anyOf: readonly [{
                readonly type: "null";
            }, {
                readonly type: "string";
                readonly minLength: 1;
            }];
        };
        readonly required_permission: {
            readonly type: "string";
            readonly minLength: 1;
        };
        readonly decision_ref: {
            readonly type: "string";
            readonly pattern: "^adz_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$";
        };
        readonly check_status: {
            readonly type: "string";
            readonly enum: CheckStatus[];
        };
    };
};
//# sourceMappingURL=action-permission-check.schema.d.ts.map