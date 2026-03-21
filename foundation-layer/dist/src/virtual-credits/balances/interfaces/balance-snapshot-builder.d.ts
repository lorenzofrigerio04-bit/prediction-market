import type { CreditBalanceSnapshot } from "../entities/credit-balance-snapshot.entity.js";
import type { CreditLedgerEntry } from "../../ledger/entities/credit-ledger-entry.entity.js";
import type { VirtualCreditAccountId } from "../../value-objects/index.js";
export interface BalanceSnapshotBuilder {
    buildSnapshot(accountId: VirtualCreditAccountId, entries: readonly CreditLedgerEntry[]): CreditBalanceSnapshot;
    validateSnapshotConsistency(snapshot: CreditBalanceSnapshot): boolean;
}
//# sourceMappingURL=balance-snapshot-builder.d.ts.map