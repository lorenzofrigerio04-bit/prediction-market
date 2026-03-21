export class DeterministicRoleRegistry {
    byId;
    constructor(roles) {
        this.byId = new Map(roles.map((role) => [role.id, role]));
    }
    getById(roleId) {
        return this.byId.get(roleId) ?? null;
    }
}
//# sourceMappingURL=deterministic-role-registry.js.map