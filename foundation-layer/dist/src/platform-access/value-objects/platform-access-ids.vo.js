import { createPrefixedId } from "../../common/utils/id.js";
export const createUserIdentityId = (value) => createPrefixedId(value, "usr_", "UserIdentityId");
export const createWorkspaceId = (value) => createPrefixedId(value, "wsp_", "WorkspaceId");
export const createRoleDefinitionId = (value) => createPrefixedId(value, "rol_", "RoleDefinitionId");
export const createRoleAssignmentId = (value) => createPrefixedId(value, "asg_", "RoleAssignmentId");
export const createPermissionPolicyId = (value) => createPrefixedId(value, "pol_", "PermissionPolicyId");
export const createAccessScopeId = (value) => createPrefixedId(value, "scp_", "AccessScopeId");
export const createAuthorizationDecisionId = (value) => createPrefixedId(value, "adz_", "AuthorizationDecisionId");
export const createActionPermissionCheckId = (value) => createPrefixedId(value, "chk_", "ActionPermissionCheckId");
export const createAdminCapabilityFlagId = (value) => createPrefixedId(value, "cap_", "AdminCapabilityFlagId");
export const createPlatformActionCompatibilityId = (value) => createPrefixedId(value, "pac_", "PlatformActionCompatibilityId");
//# sourceMappingURL=platform-access-ids.vo.js.map