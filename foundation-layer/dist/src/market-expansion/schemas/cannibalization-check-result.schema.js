import { CannibalizationStatus } from "../enums/cannibalization-status.enum.js";
export const CANNIBALIZATION_CHECK_RESULT_SCHEMA_ID = "https://market-design-engine.dev/schemas/market-expansion/cannibalization-check-result.schema.json";
export const cannibalizationCheckResultSchema = {
    $id: CANNIBALIZATION_CHECK_RESULT_SCHEMA_ID,
    $schema: "https://json-schema.org/draft/2020-12/schema",
    type: "object",
    additionalProperties: false,
    required: [
        "id",
        "family_id",
        "checked_market_pairs",
        "blocking_conflicts",
        "warnings",
        "check_status",
    ],
    properties: {
        id: { type: "string", pattern: "^mcc_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$" },
        family_id: { type: "string", pattern: "^mfy_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$" },
        checked_market_pairs: {
            type: "array",
            items: {
                type: "object",
                additionalProperties: false,
                required: ["source_market_ref", "target_market_ref"],
                properties: {
                    source_market_ref: { type: "string", minLength: 1 },
                    target_market_ref: { type: "string", minLength: 1 },
                },
            },
        },
        blocking_conflicts: { type: "array", items: { type: "string", minLength: 1 } },
        warnings: { type: "array", items: { type: "string", minLength: 1 } },
        check_status: { type: "string", enum: Object.values(CannibalizationStatus) },
    },
};
//# sourceMappingURL=cannibalization-check-result.schema.js.map