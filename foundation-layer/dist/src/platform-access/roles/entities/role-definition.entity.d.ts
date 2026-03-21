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
export declare const createRoleDefinition: (input: RoleDefinition) => RoleDefinition;
//# sourceMappingURL=role-definition.entity.d.ts.map