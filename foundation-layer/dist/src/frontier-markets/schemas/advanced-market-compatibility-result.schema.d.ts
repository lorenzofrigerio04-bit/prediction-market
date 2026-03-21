import { AdvancedCompatibilityStatus } from "../enums/advanced-compatibility-status.enum.js";
import { AdvancedValidationStatus } from "../enums/advanced-validation-status.enum.js";
export declare const ADVANCED_MARKET_COMPATIBILITY_RESULT_SCHEMA_ID = "https://market-design-engine.dev/schemas/frontier-markets/advanced-market-compatibility-result.schema.json";
export declare const advancedMarketCompatibilityResultSchema: {
    readonly $id: "https://market-design-engine.dev/schemas/frontier-markets/advanced-market-compatibility-result.schema.json";
    readonly $schema: "https://json-schema.org/draft/2020-12/schema";
    readonly type: "object";
    readonly additionalProperties: false;
    readonly required: readonly ["id", "target", "status", "mapped_artifact", "notes"];
    readonly properties: {
        readonly id: {
            readonly type: "string";
            readonly pattern: "^fcp_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$";
        };
        readonly target: {
            readonly type: "string";
            readonly enum: readonly ["market_draft_pipeline", "publishing_engine", "editorial_pipeline"];
        };
        readonly status: {
            readonly type: "string";
            readonly enum: AdvancedCompatibilityStatus[];
        };
        readonly mapped_artifact: {
            readonly type: "object";
            readonly required: readonly ["readiness"];
            readonly properties: {
                readonly readiness: {
                    readonly type: "string";
                    readonly enum: AdvancedCompatibilityStatus[];
                };
                readonly validation_status: {
                    readonly type: readonly ["string", "null"];
                    readonly enum: readonly [...AdvancedValidationStatus[], null];
                };
            };
            readonly additionalProperties: true;
        };
        readonly notes: {
            readonly type: "array";
            readonly items: {
                readonly type: "string";
                readonly minLength: 1;
            };
        };
    };
};
//# sourceMappingURL=advanced-market-compatibility-result.schema.d.ts.map