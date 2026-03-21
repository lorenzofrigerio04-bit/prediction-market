import type { CorrelationId, VirtualCreditAccountId } from "../../value-objects/index.js";
import type { CreditLedgerEntry } from "../entities/credit-ledger-entry.entity.js";
import type { CreditLedgerWriter } from "../interfaces/credit-ledger-writer.js";
export declare class DeterministicCreditLedgerWriter implements CreditLedgerWriter {
    private readonly entries;
    appendEntry(entry: CreditLedgerEntry): CreditLedgerEntry;
    appendEntries(entries: readonly CreditLedgerEntry[]): readonly CreditLedgerEntry[];
    getEntriesForAccount(accountId: VirtualCreditAccountId): readonly CreditLedgerEntry[];
    getEntriesByCorrelationId(correlationId: CorrelationId): readonly CreditLedgerEntry[];
}
//# sourceMappingURL=deterministic-credit-ledger-writer.d.ts.map