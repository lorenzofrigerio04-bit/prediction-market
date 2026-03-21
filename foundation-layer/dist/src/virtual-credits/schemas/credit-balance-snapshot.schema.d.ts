import { ConsistencyStatus } from "../enums/consistency-status.enum.js";
export declare const CREDIT_BALANCE_SNAPSHOT_SCHEMA_ID = "https://market-design-engine.dev/schemas/virtual-credits/credit-balance-snapshot.schema.json";
export declare const creditBalanceSnapshotSchema: {
    readonly $id: "https://market-design-engine.dev/schemas/virtual-credits/credit-balance-snapshot.schema.json";
    readonly $schema: "https://json-schema.org/draft/2020-12/schema";
    readonly type: "object";
    readonly additionalProperties: false;
    readonly required: readonly ["id", "version", "account_id", "snapshot_balance", "snapshot_at", "included_ledger_refs", "consistency_status"];
    readonly properties: {
        readonly id: {
            readonly type: "string";
            readonly pattern: "^vcs_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$";
        };
        readonly version: {
            readonly type: "string";
            readonly pattern: "^v\\d+\\.\\d+\\.\\d+$";
        };
        readonly account_id: {
            readonly type: "string";
            readonly pattern: "^vca_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$";
        };
        readonly snapshot_balance: {
            readonly type: "number";
        };
        readonly snapshot_at: {
            readonly type: "string";
            readonly format: "date-time";
        };
        readonly included_ledger_refs: {
            readonly type: "array";
            readonly items: {
                readonly type: "string";
                readonly pattern: "^vcl_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$";
            };
        };
        readonly consistency_status: {
            readonly type: "string";
            readonly enum: ConsistencyStatus[];
        };
    };
};
//# sourceMappingURL=credit-balance-snapshot.schema.d.ts.map