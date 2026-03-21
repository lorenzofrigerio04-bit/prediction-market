export class DeterministicUserIdentityReader {
    byId;
    constructor(users) {
        this.byId = new Map(users.map((user) => [user.id, user]));
    }
    getById(userId) {
        return this.byId.get(userId) ?? null;
    }
}
//# sourceMappingURL=deterministic-user-identity-reader.js.map