import { accessScopeSchema } from "./access-scope.schema.js";
import { actionPermissionCheckSchema } from "./action-permission-check.schema.js";
import { adminCapabilityFlagSchema } from "./admin-capability-flag.schema.js";
import { authorizationDecisionSchema } from "./authorization-decision.schema.js";
import { permissionPolicySchema } from "./permission-policy.schema.js";
import { platformActionCompatibilitySchema } from "./platform-action-compatibility.schema.js";
import { roleAssignmentSchema } from "./role-assignment.schema.js";
import { roleDefinitionSchema } from "./role-definition.schema.js";
import { userIdentitySchema } from "./user-identity.schema.js";
import { workspaceSchema } from "./workspace.schema.js";

export const platformAccessSchemas = [
  userIdentitySchema,
  workspaceSchema,
  roleDefinitionSchema,
  roleAssignmentSchema,
  permissionPolicySchema,
  accessScopeSchema,
  authorizationDecisionSchema,
  actionPermissionCheckSchema,
  adminCapabilityFlagSchema,
  platformActionCompatibilitySchema,
] as const;

export {
  accessScopeSchema,
  actionPermissionCheckSchema,
  adminCapabilityFlagSchema,
  authorizationDecisionSchema,
  permissionPolicySchema,
  platformActionCompatibilitySchema,
  roleAssignmentSchema,
  roleDefinitionSchema,
  userIdentitySchema,
  workspaceSchema,
};

export * from "./user-identity.schema.js";
export * from "./workspace.schema.js";
export * from "./role-definition.schema.js";
export * from "./role-assignment.schema.js";
export * from "./permission-policy.schema.js";
export * from "./access-scope.schema.js";
export * from "./authorization-decision.schema.js";
export * from "./action-permission-check.schema.js";
export * from "./admin-capability-flag.schema.js";
export * from "./platform-action-compatibility.schema.js";
