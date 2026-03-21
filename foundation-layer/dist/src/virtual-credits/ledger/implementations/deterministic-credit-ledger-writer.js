export class DeterministicCreditLedgerWriter {
    entries = [];
    appendEntry(entry) {
        this.entries.push(entry);
        return entry;
    }
    appendEntries(entries) {
        for (const entry of entries) {
            this.entries.push(entry);
        }
        return entries;
    }
    getEntriesForAccount(accountId) {
        return this.entries.filter((entry) => entry.account_id === accountId);
    }
    getEntriesByCorrelationId(correlationId) {
        return this.entries.filter((entry) => entry.correlation_id === correlationId);
    }
}
//# sourceMappingURL=deterministic-credit-ledger-writer.js.map