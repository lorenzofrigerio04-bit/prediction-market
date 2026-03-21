import { AccountStatus } from "../enums/account-status.enum.js";
import { OverdraftPolicy } from "../enums/overdraft-policy.enum.js";
import { OwnerType } from "../enums/owner-type.enum.js";
export const VIRTUAL_CREDIT_ACCOUNT_SCHEMA_ID = "https://market-design-engine.dev/schemas/virtual-credits/virtual-credit-account.schema.json";
export const virtualCreditAccountSchema = {
    $id: VIRTUAL_CREDIT_ACCOUNT_SCHEMA_ID,
    $schema: "https://json-schema.org/draft/2020-12/schema",
    type: "object",
    additionalProperties: false,
    required: [
        "id",
        "version",
        "owner_type",
        "owner_ref",
        "account_status",
        "currency_key",
        "current_balance_nullable",
        "overdraft_policy",
        "metadata",
    ],
    properties: {
        id: { type: "string", pattern: "^vca_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$" },
        version: { type: "string", pattern: "^v\\d+\\.\\d+\\.\\d+$" },
        owner_type: { type: "string", enum: Object.values(OwnerType) },
        owner_ref: { type: "string", minLength: 1 },
        account_status: { type: "string", enum: Object.values(AccountStatus) },
        currency_key: { type: "string", minLength: 1 },
        current_balance_nullable: { type: ["number", "null"] },
        overdraft_policy: { type: "string", enum: Object.values(OverdraftPolicy) },
        metadata: { type: "object", additionalProperties: { type: "string" } },
    },
};
//# sourceMappingURL=virtual-credit-account.schema.js.map