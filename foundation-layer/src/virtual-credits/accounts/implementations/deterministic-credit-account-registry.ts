import { AccountStatus } from "../../enums/account-status.enum.js";
import type { OwnerRef, VirtualCreditAccountId } from "../../value-objects/index.js";
import type { VirtualCreditAccount } from "../entities/virtual-credit-account.entity.js";
import type { CreditAccountRegistry } from "../interfaces/credit-account-registry.js";

export class DeterministicCreditAccountRegistry implements CreditAccountRegistry {
  private readonly byId = new Map<VirtualCreditAccountId, VirtualCreditAccount>();

  registerAccount(account: VirtualCreditAccount): VirtualCreditAccount {
    this.byId.set(account.id, account);
    return account;
  }

  getAccountById(accountId: VirtualCreditAccountId): VirtualCreditAccount | null {
    return this.byId.get(accountId) ?? null;
  }

  getAccountsByOwner(ownerRef: OwnerRef): readonly VirtualCreditAccount[] {
    return [...this.byId.values()].filter((account) => account.owner_ref === ownerRef);
  }

  suspendAccount(accountId: VirtualCreditAccountId): VirtualCreditAccount | null {
    const existing = this.byId.get(accountId);
    if (existing === undefined) {
      return null;
    }
    const updated: VirtualCreditAccount = { ...existing, account_status: AccountStatus.SUSPENDED };
    this.byId.set(accountId, updated);
    return updated;
  }

  closeAccount(accountId: VirtualCreditAccountId): VirtualCreditAccount | null {
    const existing = this.byId.get(accountId);
    if (existing === undefined) {
      return null;
    }
    const updated: VirtualCreditAccount = { ...existing, account_status: AccountStatus.CLOSED };
    this.byId.set(accountId, updated);
    return updated;
  }
}
