export class DeterministicAccessScopeResolver {
    byUser;
    constructor(scopes_by_user) {
        const cloned = new Map();
        for (const [userId, scopes] of scopes_by_user.entries()) {
            cloned.set(userId, [...scopes]);
        }
        this.byUser = cloned;
    }
    listForUser(userId) {
        return this.byUser.get(userId) ?? [];
    }
}
//# sourceMappingURL=deterministic-access-scope-resolver.js.map