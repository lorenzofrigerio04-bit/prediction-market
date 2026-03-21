import { AccountStatus } from "../../enums/account-status.enum.js";
import { OverdraftPolicy } from "../../enums/overdraft-policy.enum.js";
import { OwnerType } from "../../enums/owner-type.enum.js";
import type { CurrencyKey, Metadata, OwnerRef, Version, VirtualCreditAccountId } from "../../value-objects/index.js";
export type VirtualCreditAccount = Readonly<{
    id: VirtualCreditAccountId;
    version: Version;
    owner_type: OwnerType;
    owner_ref: OwnerRef;
    account_status: AccountStatus;
    currency_key: CurrencyKey;
    current_balance_nullable: number | null;
    overdraft_policy: OverdraftPolicy;
    metadata: Metadata;
}>;
export declare const createVirtualCreditAccount: (input: VirtualCreditAccount) => VirtualCreditAccount;
//# sourceMappingURL=virtual-credit-account.entity.d.ts.map