import type { RoleAssignment } from "../entities/role-assignment.entity.js";
import type { UserIdentityId } from "../../value-objects/platform-access-ids.vo.js";

export interface RoleAssignmentManager {
  listForUser(userId: UserIdentityId): readonly RoleAssignment[];
}
