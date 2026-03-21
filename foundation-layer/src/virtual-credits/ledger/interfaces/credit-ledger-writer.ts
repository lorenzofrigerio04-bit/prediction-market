import type { CreditLedgerEntry } from "../entities/credit-ledger-entry.entity.js";
import type { CorrelationId, VirtualCreditAccountId } from "../../value-objects/index.js";

export interface CreditLedgerWriter {
  appendEntry(entry: CreditLedgerEntry): CreditLedgerEntry;
  appendEntries(entries: readonly CreditLedgerEntry[]): readonly CreditLedgerEntry[];
  getEntriesForAccount(accountId: VirtualCreditAccountId): readonly CreditLedgerEntry[];
  getEntriesByCorrelationId(correlationId: CorrelationId): readonly CreditLedgerEntry[];
}
