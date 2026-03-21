import type { Branded } from "../../common/types/branded.js";
import { createPrefixedId } from "../../common/utils/id.js";

export type UserIdentityId = Branded<string, "UserIdentityId">;
export type WorkspaceId = Branded<string, "WorkspaceId">;
export type RoleDefinitionId = Branded<string, "RoleDefinitionId">;
export type RoleAssignmentId = Branded<string, "RoleAssignmentId">;
export type PermissionPolicyId = Branded<string, "PermissionPolicyId">;
export type AccessScopeId = Branded<string, "AccessScopeId">;
export type AuthorizationDecisionId = Branded<string, "AuthorizationDecisionId">;
export type ActionPermissionCheckId = Branded<string, "ActionPermissionCheckId">;
export type AdminCapabilityFlagId = Branded<string, "AdminCapabilityFlagId">;
export type PlatformActionCompatibilityId = Branded<string, "PlatformActionCompatibilityId">;

export const createUserIdentityId = (value: string): UserIdentityId =>
  createPrefixedId(value, "usr_", "UserIdentityId") as UserIdentityId;
export const createWorkspaceId = (value: string): WorkspaceId =>
  createPrefixedId(value, "wsp_", "WorkspaceId") as WorkspaceId;
export const createRoleDefinitionId = (value: string): RoleDefinitionId =>
  createPrefixedId(value, "rol_", "RoleDefinitionId") as RoleDefinitionId;
export const createRoleAssignmentId = (value: string): RoleAssignmentId =>
  createPrefixedId(value, "asg_", "RoleAssignmentId") as RoleAssignmentId;
export const createPermissionPolicyId = (value: string): PermissionPolicyId =>
  createPrefixedId(value, "pol_", "PermissionPolicyId") as PermissionPolicyId;
export const createAccessScopeId = (value: string): AccessScopeId =>
  createPrefixedId(value, "scp_", "AccessScopeId") as AccessScopeId;
export const createAuthorizationDecisionId = (value: string): AuthorizationDecisionId =>
  createPrefixedId(value, "adz_", "AuthorizationDecisionId") as AuthorizationDecisionId;
export const createActionPermissionCheckId = (value: string): ActionPermissionCheckId =>
  createPrefixedId(value, "chk_", "ActionPermissionCheckId") as ActionPermissionCheckId;
export const createAdminCapabilityFlagId = (value: string): AdminCapabilityFlagId =>
  createPrefixedId(value, "cap_", "AdminCapabilityFlagId") as AdminCapabilityFlagId;
export const createPlatformActionCompatibilityId = (value: string): PlatformActionCompatibilityId =>
  createPrefixedId(value, "pac_", "PlatformActionCompatibilityId") as PlatformActionCompatibilityId;
