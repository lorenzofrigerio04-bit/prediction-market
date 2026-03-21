import { AccountStatus } from "../../enums/account-status.enum.js";
export class DeterministicCreditAccountRegistry {
    byId = new Map();
    registerAccount(account) {
        this.byId.set(account.id, account);
        return account;
    }
    getAccountById(accountId) {
        return this.byId.get(accountId) ?? null;
    }
    getAccountsByOwner(ownerRef) {
        return [...this.byId.values()].filter((account) => account.owner_ref === ownerRef);
    }
    suspendAccount(accountId) {
        const existing = this.byId.get(accountId);
        if (existing === undefined) {
            return null;
        }
        const updated = { ...existing, account_status: AccountStatus.SUSPENDED };
        this.byId.set(accountId, updated);
        return updated;
    }
    closeAccount(accountId) {
        const existing = this.byId.get(accountId);
        if (existing === undefined) {
            return null;
        }
        const updated = { ...existing, account_status: AccountStatus.CLOSED };
        this.byId.set(accountId, updated);
        return updated;
    }
}
//# sourceMappingURL=deterministic-credit-account-registry.js.map