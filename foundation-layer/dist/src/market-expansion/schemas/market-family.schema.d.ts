import { FamilyStatus } from "../enums/family-status.enum.js";
import { SourceContextType } from "../enums/source-context-type.enum.js";
export declare const MARKET_FAMILY_SCHEMA_ID = "https://market-design-engine.dev/schemas/market-expansion/market-family.schema.json";
export declare const marketFamilySchema: {
    readonly $id: "https://market-design-engine.dev/schemas/market-expansion/market-family.schema.json";
    readonly $schema: "https://json-schema.org/draft/2020-12/schema";
    readonly type: "object";
    readonly additionalProperties: false;
    readonly required: readonly ["id", "version", "family_key", "source_context_type", "source_context_ref", "flagship_market_ref", "satellite_market_refs", "derivative_market_refs", "family_status", "family_metadata"];
    readonly properties: {
        readonly id: {
            readonly type: "string";
            readonly pattern: "^mfy_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$";
        };
        readonly version: {
            readonly type: "integer";
            readonly minimum: 1;
        };
        readonly family_key: {
            readonly type: "string";
            readonly minLength: 1;
        };
        readonly source_context_type: {
            readonly type: "string";
            readonly enum: SourceContextType[];
        };
        readonly source_context_ref: {
            readonly type: "string";
            readonly minLength: 1;
        };
        readonly flagship_market_ref: {
            readonly type: "string";
            readonly minLength: 1;
        };
        readonly satellite_market_refs: {
            readonly type: "array";
            readonly items: {
                readonly type: "string";
                readonly minLength: 1;
            };
            readonly uniqueItems: true;
        };
        readonly derivative_market_refs: {
            readonly type: "array";
            readonly items: {
                readonly type: "string";
                readonly minLength: 1;
            };
            readonly uniqueItems: true;
        };
        readonly family_status: {
            readonly type: "string";
            readonly enum: FamilyStatus[];
        };
        readonly family_metadata: {
            readonly type: "object";
            readonly additionalProperties: false;
            readonly required: readonly ["context_hash", "generation_mode", "tags", "notes"];
            readonly properties: {
                readonly context_hash: {
                    readonly type: "string";
                    readonly minLength: 1;
                };
                readonly generation_mode: {
                    readonly type: "string";
                    readonly const: "deterministic-v1";
                };
                readonly tags: {
                    readonly type: "array";
                    readonly items: {
                        readonly type: "string";
                    };
                };
                readonly notes: {
                    readonly type: "array";
                    readonly items: {
                        readonly type: "string";
                    };
                };
            };
        };
    };
};
//# sourceMappingURL=market-family.schema.d.ts.map