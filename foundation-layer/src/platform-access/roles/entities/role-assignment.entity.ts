import { ValidationError } from "../../../common/errors/validation-error.js";
import { deepFreeze } from "../../../common/utils/deep-freeze.js";
import type { AccessScope } from "../../scopes/entities/access-scope.entity.js";
import type {
  RoleAssignmentId,
  RoleDefinitionId,
  UserIdentityId,
  WorkspaceId,
} from "../../value-objects/platform-access-ids.vo.js";
import type { VersionTag } from "../../value-objects/version-tag.vo.js";

export type RoleAssignment = Readonly<{
  id: RoleAssignmentId;
  version: VersionTag;
  user_id: UserIdentityId;
  role_id: RoleDefinitionId;
  workspace_id_nullable: WorkspaceId | null;
  access_scope: AccessScope;
  assigned_by: UserIdentityId;
  assigned_at: string;
  active: boolean;
}>;

export const createRoleAssignment = (input: RoleAssignment): RoleAssignment => {
  if (input.assigned_at.trim().length === 0) {
    throw new ValidationError("INVALID_ROLE_ASSIGNMENT", "assigned_at is required");
  }
  return deepFreeze({ ...input });
};
