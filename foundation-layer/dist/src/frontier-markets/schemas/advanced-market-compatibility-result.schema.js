import { AdvancedCompatibilityStatus } from "../enums/advanced-compatibility-status.enum.js";
import { AdvancedValidationStatus } from "../enums/advanced-validation-status.enum.js";
export const ADVANCED_MARKET_COMPATIBILITY_RESULT_SCHEMA_ID = "https://market-design-engine.dev/schemas/frontier-markets/advanced-market-compatibility-result.schema.json";
export const advancedMarketCompatibilityResultSchema = {
    $id: ADVANCED_MARKET_COMPATIBILITY_RESULT_SCHEMA_ID,
    $schema: "https://json-schema.org/draft/2020-12/schema",
    type: "object",
    additionalProperties: false,
    required: ["id", "target", "status", "mapped_artifact", "notes"],
    properties: {
        id: { type: "string", pattern: "^fcp_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$" },
        target: {
            type: "string",
            enum: ["market_draft_pipeline", "publishing_engine", "editorial_pipeline"],
        },
        status: { type: "string", enum: Object.values(AdvancedCompatibilityStatus) },
        mapped_artifact: {
            type: "object",
            required: ["readiness"],
            properties: {
                readiness: { type: "string", enum: Object.values(AdvancedCompatibilityStatus) },
                validation_status: {
                    type: ["string", "null"],
                    enum: [...Object.values(AdvancedValidationStatus), null],
                },
            },
            additionalProperties: true,
        },
        notes: {
            type: "array",
            items: { type: "string", minLength: 1 },
        },
    },
};
//# sourceMappingURL=advanced-market-compatibility-result.schema.js.map