import { GrantStatus } from "../enums/grant-status.enum.js";
import { GrantType } from "../enums/grant-type.enum.js";
export const CREDIT_GRANT_SCHEMA_ID = "https://market-design-engine.dev/schemas/virtual-credits/credit-grant.schema.json";
export const creditGrantSchema = {
    $id: CREDIT_GRANT_SCHEMA_ID,
    $schema: "https://json-schema.org/draft/2020-12/schema",
    type: "object",
    additionalProperties: false,
    required: [
        "id",
        "version",
        "target_account_id",
        "grant_type",
        "amount",
        "issued_by",
        "issued_at",
        "expiration_nullable",
        "grant_reason",
        "grant_status",
        "source_policy_ref_nullable",
    ],
    properties: {
        id: { type: "string", pattern: "^vcg_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$" },
        version: { type: "string", pattern: "^v\\d+\\.\\d+\\.\\d+$" },
        target_account_id: { type: "string", pattern: "^vca_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$" },
        grant_type: { type: "string", enum: Object.values(GrantType) },
        amount: { type: "number" },
        issued_by: { type: "string", minLength: 1 },
        issued_at: { type: "string", format: "date-time" },
        expiration_nullable: { type: ["string", "null"], format: "date-time" },
        grant_reason: { type: "string", minLength: 1 },
        grant_status: { type: "string", enum: Object.values(GrantStatus) },
        source_policy_ref_nullable: { type: ["string", "null"] },
    },
};
//# sourceMappingURL=credit-grant.schema.js.map