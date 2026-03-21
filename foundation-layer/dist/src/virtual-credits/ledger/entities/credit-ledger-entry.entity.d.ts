import type { Timestamp } from "../../../value-objects/timestamp.vo.js";
import { LedgerEntryType } from "../../enums/ledger-entry-type.enum.js";
import type { CorrelationId, CreditLedgerEntryId, RelatedRef, Version, VirtualCreditAccountId } from "../../value-objects/index.js";
export type CreditLedgerEntry = Readonly<{
    id: CreditLedgerEntryId;
    version: Version;
    account_id: VirtualCreditAccountId;
    entry_type: LedgerEntryType;
    amount_delta: number;
    resulting_balance_nullable: number | null;
    correlation_id: CorrelationId;
    caused_by_ref: RelatedRef;
    created_at: Timestamp;
    immutable: boolean;
}>;
export declare const createCreditLedgerEntry: (input: CreditLedgerEntry) => CreditLedgerEntry;
//# sourceMappingURL=credit-ledger-entry.entity.d.ts.map