import { deepFreeze } from "../../../common/utils/deep-freeze.js";
import type { Timestamp } from "../../../value-objects/timestamp.vo.js";
import { ConsistencyStatus } from "../../enums/consistency-status.enum.js";
import type {
  CreditBalanceSnapshotId,
  CreditLedgerEntryId,
  Version,
  VirtualCreditAccountId,
} from "../../value-objects/index.js";

export type CreditBalanceSnapshot = Readonly<{
  id: CreditBalanceSnapshotId;
  version: Version;
  account_id: VirtualCreditAccountId;
  snapshot_balance: number;
  snapshot_at: Timestamp;
  included_ledger_refs: readonly CreditLedgerEntryId[];
  consistency_status: ConsistencyStatus;
}>;

export const createCreditBalanceSnapshot = (input: CreditBalanceSnapshot): CreditBalanceSnapshot =>
  deepFreeze({ ...input });
