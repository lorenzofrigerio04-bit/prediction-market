import type { CorrelationId, VirtualCreditAccountId } from "../../value-objects/index.js";
import type { CreditLedgerEntry } from "../entities/credit-ledger-entry.entity.js";
import type { CreditLedgerWriter } from "../interfaces/credit-ledger-writer.js";

export class DeterministicCreditLedgerWriter implements CreditLedgerWriter {
  private readonly entries: CreditLedgerEntry[] = [];

  appendEntry(entry: CreditLedgerEntry): CreditLedgerEntry {
    this.entries.push(entry);
    return entry;
  }

  appendEntries(entries: readonly CreditLedgerEntry[]): readonly CreditLedgerEntry[] {
    for (const entry of entries) {
      this.entries.push(entry);
    }
    return entries;
  }

  getEntriesForAccount(accountId: VirtualCreditAccountId): readonly CreditLedgerEntry[] {
    return this.entries.filter((entry) => entry.account_id === accountId);
  }

  getEntriesByCorrelationId(correlationId: CorrelationId): readonly CreditLedgerEntry[] {
    return this.entries.filter((entry) => entry.correlation_id === correlationId);
  }
}
