import { ConsistencyStatus } from "../enums/consistency-status.enum.js";
export const CREDIT_BALANCE_SNAPSHOT_SCHEMA_ID = "https://market-design-engine.dev/schemas/virtual-credits/credit-balance-snapshot.schema.json";
export const creditBalanceSnapshotSchema = {
    $id: CREDIT_BALANCE_SNAPSHOT_SCHEMA_ID,
    $schema: "https://json-schema.org/draft/2020-12/schema",
    type: "object",
    additionalProperties: false,
    required: ["id", "version", "account_id", "snapshot_balance", "snapshot_at", "included_ledger_refs", "consistency_status"],
    properties: {
        id: { type: "string", pattern: "^vcs_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$" },
        version: { type: "string", pattern: "^v\\d+\\.\\d+\\.\\d+$" },
        account_id: { type: "string", pattern: "^vca_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$" },
        snapshot_balance: { type: "number" },
        snapshot_at: { type: "string", format: "date-time" },
        included_ledger_refs: { type: "array", items: { type: "string", pattern: "^vcl_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$" } },
        consistency_status: { type: "string", enum: Object.values(ConsistencyStatus) },
    },
};
//# sourceMappingURL=credit-balance-snapshot.schema.js.map