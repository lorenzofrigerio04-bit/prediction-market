import type { OwnerRef, VirtualCreditAccountId } from "../../value-objects/index.js";
import type { VirtualCreditAccount } from "../entities/virtual-credit-account.entity.js";
import type { CreditAccountRegistry } from "../interfaces/credit-account-registry.js";
export declare class DeterministicCreditAccountRegistry implements CreditAccountRegistry {
    private readonly byId;
    registerAccount(account: VirtualCreditAccount): VirtualCreditAccount;
    getAccountById(accountId: VirtualCreditAccountId): VirtualCreditAccount | null;
    getAccountsByOwner(ownerRef: OwnerRef): readonly VirtualCreditAccount[];
    suspendAccount(accountId: VirtualCreditAccountId): VirtualCreditAccount | null;
    closeAccount(accountId: VirtualCreditAccountId): VirtualCreditAccount | null;
}
//# sourceMappingURL=deterministic-credit-account-registry.d.ts.map