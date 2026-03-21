import { FamilyCompatibilityStatus } from "../enums/family-compatibility-status.enum.js";
export declare const MARKET_FAMILY_COMPATIBILITY_RESULT_SCHEMA_ID = "https://market-design-engine.dev/schemas/market-expansion/market-family-compatibility-result.schema.json";
export declare const marketFamilyCompatibilityResultSchema: {
    readonly $id: "https://market-design-engine.dev/schemas/market-expansion/market-family-compatibility-result.schema.json";
    readonly $schema: "https://json-schema.org/draft/2020-12/schema";
    readonly type: "object";
    readonly additionalProperties: false;
    readonly required: readonly ["id", "target", "status", "mapped_artifact", "notes"];
    readonly properties: {
        readonly id: {
            readonly type: "string";
            readonly pattern: "^mcp_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$";
        };
        readonly target: {
            readonly type: "string";
            readonly enum: readonly ["market_draft_pipeline", "publishable_candidate", "publication_ready_artifact", "editorial_pipeline"];
        };
        readonly status: {
            readonly type: "string";
            readonly enum: FamilyCompatibilityStatus[];
        };
        readonly mapped_artifact: {
            readonly type: "object";
            readonly additionalProperties: true;
            readonly required: readonly ["readiness", "validation_status"];
            readonly properties: {
                readonly readiness: {
                    readonly type: "string";
                    readonly enum: FamilyCompatibilityStatus[];
                };
                readonly validation_status: {
                    readonly anyOf: readonly [{
                        readonly type: "null";
                    }, {
                        readonly type: "string";
                    }];
                };
            };
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
//# sourceMappingURL=market-family-compatibility-result.schema.d.ts.map