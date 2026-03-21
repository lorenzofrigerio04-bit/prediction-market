import { ActionKey } from "../../enums/action-key.enum.js";
import { CheckStatus } from "../../enums/check-status.enum.js";
import { TargetModule } from "../../enums/target-module.enum.js";
import type { ActionPermissionCheckId, AuthorizationDecisionId } from "../../value-objects/platform-access-ids.vo.js";
import type { ActionPermission } from "../../value-objects/action-permission.vo.js";
import type { VersionTag } from "../../value-objects/version-tag.vo.js";
export type ActionPermissionCheck = Readonly<{
    id: ActionPermissionCheckId;
    version: VersionTag;
    action_key: ActionKey;
    target_module: TargetModule;
    target_entity_type_nullable: string | null;
    required_permission: ActionPermission;
    decision_ref: AuthorizationDecisionId;
    check_status: CheckStatus;
}>;
export declare const createActionPermissionCheck: (input: ActionPermissionCheck) => ActionPermissionCheck;
//# sourceMappingURL=action-permission-check.entity.d.ts.map