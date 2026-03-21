import { GrantStatus } from "../../enums/grant-status.enum.js";
export class DeterministicCreditGrantManager {
    byId = new Map();
    createGrant(grant) {
        this.byId.set(grant.id, grant);
        return grant;
    }
    activateGrant(grantId) {
        const existing = this.byId.get(grantId);
        if (existing === undefined) {
            return null;
        }
        const updated = { ...existing, grant_status: GrantStatus.ACTIVE };
        this.byId.set(grantId, updated);
        return updated;
    }
    expireGrant(grantId, at) {
        const existing = this.byId.get(grantId);
        if (existing === undefined) {
            return null;
        }
        const updated = { ...existing, grant_status: GrantStatus.EXPIRED, expiration_nullable: at };
        this.byId.set(grantId, updated);
        return updated;
    }
    revokeGrant(grantId) {
        const existing = this.byId.get(grantId);
        if (existing === undefined) {
            return null;
        }
        const updated = { ...existing, grant_status: GrantStatus.REVOKED };
        this.byId.set(grantId, updated);
        return updated;
    }
    listGrantsForAccount(accountId) {
        return [...this.byId.values()].filter((grant) => grant.target_account_id === accountId);
    }
}
//# sourceMappingURL=deterministic-credit-grant-manager.js.map