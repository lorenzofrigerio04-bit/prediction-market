import type { RoleAssignment } from "../entities/role-assignment.entity.js";
import type { RoleAssignmentManager } from "../interfaces/role-assignment-manager.js";
import type { UserIdentityId } from "../../value-objects/platform-access-ids.vo.js";

export class DeterministicRoleAssignmentManager implements RoleAssignmentManager {
  private readonly byUser: ReadonlyMap<UserIdentityId, readonly RoleAssignment[]>;

  constructor(assignments: readonly RoleAssignment[]) {
    const grouped = new Map<UserIdentityId, RoleAssignment[]>();
    for (const assignment of assignments) {
      const current = grouped.get(assignment.user_id) ?? [];
      grouped.set(assignment.user_id, [...current, assignment]);
    }
    this.byUser = grouped;
  }

  listForUser(userId: UserIdentityId): readonly RoleAssignment[] {
    return this.byUser.get(userId) ?? [];
  }
}
