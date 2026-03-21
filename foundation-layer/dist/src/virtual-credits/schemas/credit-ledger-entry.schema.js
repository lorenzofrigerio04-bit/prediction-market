import { LedgerEntryType } from "../enums/ledger-entry-type.enum.js";
export const CREDIT_LEDGER_ENTRY_SCHEMA_ID = "https://market-design-engine.dev/schemas/virtual-credits/credit-ledger-entry.schema.json";
export const creditLedgerEntrySchema = {
    $id: CREDIT_LEDGER_ENTRY_SCHEMA_ID,
    $schema: "https://json-schema.org/draft/2020-12/schema",
    type: "object",
    additionalProperties: false,
    required: [
        "id",
        "version",
        "account_id",
        "entry_type",
        "amount_delta",
        "resulting_balance_nullable",
        "correlation_id",
        "caused_by_ref",
        "created_at",
        "immutable",
    ],
    properties: {
        id: { type: "string", pattern: "^vcl_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$" },
        version: { type: "string", pattern: "^v\\d+\\.\\d+\\.\\d+$" },
        account_id: { type: "string", pattern: "^vca_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$" },
        entry_type: { type: "string", enum: Object.values(LedgerEntryType) },
        amount_delta: { type: "number" },
        resulting_balance_nullable: { type: ["number", "null"] },
        correlation_id: { type: "string", minLength: 1 },
        caused_by_ref: { type: "string", minLength: 1 },
        created_at: { type: "string", format: "date-time" },
        immutable: { type: "boolean" },
    },
};
//# sourceMappingURL=credit-ledger-entry.schema.js.map