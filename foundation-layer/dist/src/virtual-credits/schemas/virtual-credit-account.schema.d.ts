import { AccountStatus } from "../enums/account-status.enum.js";
import { OverdraftPolicy } from "../enums/overdraft-policy.enum.js";
import { OwnerType } from "../enums/owner-type.enum.js";
export declare const VIRTUAL_CREDIT_ACCOUNT_SCHEMA_ID = "https://market-design-engine.dev/schemas/virtual-credits/virtual-credit-account.schema.json";
export declare const virtualCreditAccountSchema: {
    readonly $id: "https://market-design-engine.dev/schemas/virtual-credits/virtual-credit-account.schema.json";
    readonly $schema: "https://json-schema.org/draft/2020-12/schema";
    readonly type: "object";
    readonly additionalProperties: false;
    readonly required: readonly ["id", "version", "owner_type", "owner_ref", "account_status", "currency_key", "current_balance_nullable", "overdraft_policy", "metadata"];
    readonly properties: {
        readonly id: {
            readonly type: "string";
            readonly pattern: "^vca_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$";
        };
        readonly version: {
            readonly type: "string";
            readonly pattern: "^v\\d+\\.\\d+\\.\\d+$";
        };
        readonly owner_type: {
            readonly type: "string";
            readonly enum: OwnerType[];
        };
        readonly owner_ref: {
            readonly type: "string";
            readonly minLength: 1;
        };
        readonly account_status: {
            readonly type: "string";
            readonly enum: AccountStatus[];
        };
        readonly currency_key: {
            readonly type: "string";
            readonly minLength: 1;
        };
        readonly current_balance_nullable: {
            readonly type: readonly ["number", "null"];
        };
        readonly overdraft_policy: {
            readonly type: "string";
            readonly enum: OverdraftPolicy[];
        };
        readonly metadata: {
            readonly type: "object";
            readonly additionalProperties: {
                readonly type: "string";
            };
        };
    };
};
//# sourceMappingURL=virtual-credit-account.schema.d.ts.map