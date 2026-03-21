import { ValidationError } from "../../../common/errors/validation-error.js";
import { deepFreeze } from "../../../common/utils/deep-freeze.js";
import { RoleScopePolicy } from "../../enums/role-scope-policy.enum.js";
import type { RoleDefinitionId } from "../../value-objects/platform-access-ids.vo.js";
import type { ActionPermission } from "../../value-objects/action-permission.vo.js";
import type { RoleKey } from "../../value-objects/role-key.vo.js";
import type { DisplayName } from "../../value-objects/display-name.vo.js";
import type { VersionTag } from "../../value-objects/version-tag.vo.js";

export type RoleDefinition = Readonly<{
  id: RoleDefinitionId;
  version: VersionTag;
  role_key: RoleKey;
  display_name: DisplayName;
  permission_set: readonly ActionPermission[];
  role_scope_policy: RoleScopePolicy;
  active: boolean;
}>;

export const createRoleDefinition = (input: RoleDefinition): RoleDefinition => {
  if (!Object.values(RoleScopePolicy).includes(input.role_scope_policy)) {
    throw new ValidationError("INVALID_ROLE_DEFINITION", "role_scope_policy is invalid");
  }
  if (input.permission_set.length === 0) {
    throw new ValidationError("INVALID_ROLE_DEFINITION", "permission_set must not be empty");
  }
  return deepFreeze({
    ...input,
    permission_set: deepFreeze([...input.permission_set]),
  });
};
