import type { RoleAssignment } from "../entities/role-assignment.entity.js";
import type { RoleAssignmentManager } from "../interfaces/role-assignment-manager.js";
import type { UserIdentityId } from "../../value-objects/platform-access-ids.vo.js";
export declare class DeterministicRoleAssignmentManager implements RoleAssignmentManager {
    private readonly byUser;
    constructor(assignments: readonly RoleAssignment[]);
    listForUser(userId: UserIdentityId): readonly RoleAssignment[];
}
//# sourceMappingURL=deterministic-role-assignment-manager.d.ts.map