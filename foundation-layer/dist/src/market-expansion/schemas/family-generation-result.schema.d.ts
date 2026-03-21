import { GenerationStatus } from "../enums/generation-status.enum.js";
export declare const FAMILY_GENERATION_RESULT_SCHEMA_ID = "https://market-design-engine.dev/schemas/market-expansion/family-generation-result.schema.json";
export declare const familyGenerationResultSchema: {
    readonly $id: "https://market-design-engine.dev/schemas/market-expansion/family-generation-result.schema.json";
    readonly $schema: "https://json-schema.org/draft/2020-12/schema";
    readonly type: "object";
    readonly additionalProperties: false;
    readonly required: readonly ["id", "version", "market_family_id", "generated_market_refs", "flagship_ref", "generation_status", "generation_confidence", "output_notes_nullable"];
    readonly properties: {
        readonly id: {
            readonly type: "string";
            readonly pattern: "^mgr_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$";
        };
        readonly version: {
            readonly type: "integer";
            readonly minimum: 1;
        };
        readonly market_family_id: {
            readonly type: "string";
            readonly pattern: "^mfy_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$";
        };
        readonly generated_market_refs: {
            readonly type: "array";
            readonly minItems: 1;
            readonly uniqueItems: true;
            readonly items: {
                readonly type: "string";
                readonly minLength: 1;
            };
        };
        readonly flagship_ref: {
            readonly type: "string";
            readonly minLength: 1;
        };
        readonly generation_status: {
            readonly type: "string";
            readonly enum: GenerationStatus[];
        };
        readonly generation_confidence: {
            readonly type: "number";
            readonly minimum: 0;
            readonly maximum: 1;
        };
        readonly output_notes_nullable: {
            readonly anyOf: readonly [{
                readonly type: "null";
            }, {
                readonly type: "string";
                readonly minLength: 1;
            }];
        };
    };
};
//# sourceMappingURL=family-generation-result.schema.d.ts.map