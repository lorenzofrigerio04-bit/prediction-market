import { ConsistencyStatus } from "../enums/consistency-status.enum.js";
export const CREDITS_COMPATIBILITY_VIEW_SCHEMA_ID = "https://market-design-engine.dev/schemas/virtual-credits/credits-compatibility-view.schema.json";
export const creditsCompatibilityViewSchema = {
    $id: CREDITS_COMPATIBILITY_VIEW_SCHEMA_ID,
    $schema: "https://json-schema.org/draft/2020-12/schema",
    type: "object",
    additionalProperties: false,
    required: [
        "id",
        "owner_ref",
        "access_scope_ref",
        "account_ref_nullable",
        "visible_balance_nullable",
        "active_quota_refs",
        "active_risk_flags",
        "allowed_actions",
        "warnings",
        "compatibility_status",
    ],
    properties: {
        id: { type: "string", minLength: 1 },
        owner_ref: { type: "string", minLength: 1 },
        access_scope_ref: { type: "string", minLength: 1 },
        account_ref_nullable: { type: ["string", "null"] },
        visible_balance_nullable: { type: ["number", "null"] },
        active_quota_refs: { type: "array", items: { type: "string", minLength: 1 } },
        active_risk_flags: { type: "array", items: { type: "string", minLength: 1 } },
        allowed_actions: { type: "array", items: { type: "string", minLength: 1 } },
        warnings: { type: "array", items: { type: "string", minLength: 1 } },
        compatibility_status: { type: "string", enum: Object.values(ConsistencyStatus) },
    },
};
//# sourceMappingURL=credits-compatibility-view.schema.js.map