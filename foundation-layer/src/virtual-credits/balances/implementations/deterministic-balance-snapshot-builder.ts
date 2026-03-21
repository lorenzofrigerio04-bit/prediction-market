import { createTimestamp } from "../../../value-objects/timestamp.vo.js";
import { ConsistencyStatus } from "../../enums/consistency-status.enum.js";
import { createCreditBalanceSnapshot } from "../entities/credit-balance-snapshot.entity.js";
import type { CreditBalanceSnapshot } from "../entities/credit-balance-snapshot.entity.js";
import type { CreditLedgerEntry } from "../../ledger/entities/credit-ledger-entry.entity.js";
import type { BalanceSnapshotBuilder } from "../interfaces/balance-snapshot-builder.js";
import { createCreditBalanceSnapshotId, createVersion, type VirtualCreditAccountId } from "../../value-objects/index.js";

export class DeterministicBalanceSnapshotBuilder implements BalanceSnapshotBuilder {
  buildSnapshot(accountId: VirtualCreditAccountId, entries: readonly CreditLedgerEntry[]): CreditBalanceSnapshot {
    const accountEntries = entries.filter((entry) => entry.account_id === accountId);
    const balance = accountEntries.reduce((acc, entry) => acc + entry.amount_delta, 0);
    const consistency = accountEntries.every((entry) => entry.immutable)
      ? ConsistencyStatus.CONSISTENT
      : ConsistencyStatus.PARTIAL;
    return createCreditBalanceSnapshot({
      id: createCreditBalanceSnapshotId("vcs_defaultsnapshot001"),
      version: createVersion("v1.0.0"),
      account_id: accountId,
      snapshot_balance: balance,
      snapshot_at: createTimestamp("1970-01-01T00:00:00.000Z"),
      included_ledger_refs: accountEntries.map((entry) => entry.id),
      consistency_status: consistency,
    });
  }

  validateSnapshotConsistency(snapshot: CreditBalanceSnapshot): boolean {
    if (snapshot.consistency_status === ConsistencyStatus.CONSISTENT) {
      return snapshot.included_ledger_refs.length > 0;
    }
    return true;
  }
}
