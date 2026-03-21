import { ValidationError } from "../../../common/errors/validation-error.js";
import { deepFreeze } from "../../../common/utils/deep-freeze.js";
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

export const createActionPermissionCheck = (input: ActionPermissionCheck): ActionPermissionCheck => {
  if (!Object.values(ActionKey).includes(input.action_key)) {
    throw new ValidationError("INVALID_ACTION_PERMISSION_CHECK", "action_key is invalid");
  }
  if (!Object.values(TargetModule).includes(input.target_module)) {
    throw new ValidationError("INVALID_ACTION_PERMISSION_CHECK", "target_module is invalid");
  }
  if (!Object.values(CheckStatus).includes(input.check_status)) {
    throw new ValidationError("INVALID_ACTION_PERMISSION_CHECK", "check_status is invalid");
  }
  return deepFreeze({ ...input });
};
