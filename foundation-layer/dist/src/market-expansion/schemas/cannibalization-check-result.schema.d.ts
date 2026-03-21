import { CannibalizationStatus } from "../enums/cannibalization-status.enum.js";
export declare const CANNIBALIZATION_CHECK_RESULT_SCHEMA_ID = "https://market-design-engine.dev/schemas/market-expansion/cannibalization-check-result.schema.json";
export declare const cannibalizationCheckResultSchema: {
    readonly $id: "https://market-design-engine.dev/schemas/market-expansion/cannibalization-check-result.schema.json";
    readonly $schema: "https://json-schema.org/draft/2020-12/schema";
    readonly type: "object";
    readonly additionalProperties: false;
    readonly required: readonly ["id", "family_id", "checked_market_pairs", "blocking_conflicts", "warnings", "check_status"];
    readonly properties: {
        readonly id: {
            readonly type: "string";
            readonly pattern: "^mcc_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$";
        };
        readonly family_id: {
            readonly type: "string";
            readonly pattern: "^mfy_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$";
        };
        readonly checked_market_pairs: {
            readonly type: "array";
            readonly items: {
                readonly type: "object";
                readonly additionalProperties: false;
                readonly required: readonly ["source_market_ref", "target_market_ref"];
                readonly properties: {
                    readonly source_market_ref: {
                        readonly type: "string";
                        readonly minLength: 1;
                    };
                    readonly target_market_ref: {
                        readonly type: "string";
                        readonly minLength: 1;
                    };
                };
            };
        };
        readonly blocking_conflicts: {
            readonly type: "array";
            readonly items: {
                readonly type: "string";
                readonly minLength: 1;
            };
        };
        readonly warnings: {
            readonly type: "array";
            readonly items: {
                readonly type: "string";
                readonly minLength: 1;
            };
        };
        readonly check_status: {
            readonly type: "string";
            readonly enum: CannibalizationStatus[];
        };
    };
};
//# sourceMappingURL=cannibalization-check-result.schema.d.ts.map