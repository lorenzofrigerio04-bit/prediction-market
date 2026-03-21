export class DeterministicRoleAssignmentManager {
    byUser;
    constructor(assignments) {
        const grouped = new Map();
        for (const assignment of assignments) {
            const current = grouped.get(assignment.user_id) ?? [];
            grouped.set(assignment.user_id, [...current, assignment]);
        }
        this.byUser = grouped;
    }
    listForUser(userId) {
        return this.byUser.get(userId) ?? [];
    }
}
//# sourceMappingURL=deterministic-role-assignment-manager.js.map