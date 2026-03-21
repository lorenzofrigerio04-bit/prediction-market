import { LedgerEntryType } from "../enums/ledger-entry-type.enum.js";
export declare const CREDIT_LEDGER_ENTRY_SCHEMA_ID = "https://market-design-engine.dev/schemas/virtual-credits/credit-ledger-entry.schema.json";
export declare const creditLedgerEntrySchema: {
    readonly $id: "https://market-design-engine.dev/schemas/virtual-credits/credit-ledger-entry.schema.json";
    readonly $schema: "https://json-schema.org/draft/2020-12/schema";
    readonly type: "object";
    readonly additionalProperties: false;
    readonly required: readonly ["id", "version", "account_id", "entry_type", "amount_delta", "resulting_balance_nullable", "correlation_id", "caused_by_ref", "created_at", "immutable"];
    readonly properties: {
        readonly id: {
            readonly type: "string";
            readonly pattern: "^vcl_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$";
        };
        readonly version: {
            readonly type: "string";
            readonly pattern: "^v\\d+\\.\\d+\\.\\d+$";
        };
        readonly account_id: {
            readonly type: "string";
            readonly pattern: "^vca_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$";
        };
        readonly entry_type: {
            readonly type: "string";
            readonly enum: LedgerEntryType[];
        };
        readonly amount_delta: {
            readonly type: "number";
        };
        readonly resulting_balance_nullable: {
            readonly type: readonly ["number", "null"];
        };
        readonly correlation_id: {
            readonly type: "string";
            readonly minLength: 1;
        };
        readonly caused_by_ref: {
            readonly type: "string";
            readonly minLength: 1;
        };
        readonly created_at: {
            readonly type: "string";
            readonly format: "date-time";
        };
        readonly immutable: {
            readonly type: "boolean";
        };
    };
};
//# sourceMappingURL=credit-ledger-entry.schema.d.ts.map