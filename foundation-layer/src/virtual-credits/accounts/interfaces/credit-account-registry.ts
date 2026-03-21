import type { VirtualCreditAccount } from "../entities/virtual-credit-account.entity.js";
import type { OwnerRef, VirtualCreditAccountId } from "../../value-objects/index.js";

export interface CreditAccountRegistry {
  registerAccount(account: VirtualCreditAccount): VirtualCreditAccount;
  getAccountById(accountId: VirtualCreditAccountId): VirtualCreditAccount | null;
  getAccountsByOwner(ownerRef: OwnerRef): readonly VirtualCreditAccount[];
  suspendAccount(accountId: VirtualCreditAccountId, reason?: string): VirtualCreditAccount | null;
  closeAccount(accountId: VirtualCreditAccountId, reason?: string): VirtualCreditAccount | null;
}
