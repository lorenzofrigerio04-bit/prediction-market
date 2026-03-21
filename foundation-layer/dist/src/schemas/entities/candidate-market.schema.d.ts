import { MarketResolutionBasis } from "../../enums/market-resolution-basis.enum.js";
import { MarketType } from "../../enums/market-type.enum.js";
export declare const CANDIDATE_MARKET_SCHEMA_ID = "https://market-design-engine.dev/schemas/entities/candidate-market.schema.json";
export declare const candidateMarketSchema: {
    readonly $id: "https://market-design-engine.dev/schemas/entities/candidate-market.schema.json";
    readonly $schema: "https://json-schema.org/draft/2020-12/schema";
    readonly type: "object";
    readonly additionalProperties: false;
    readonly required: readonly ["id", "claimId", "canonicalEventId", "title", "slug", "description", "resolutionBasis", "resolutionWindow", "outcomes", "marketType", "categories", "tags", "confidenceScore", "draftNotes", "entityVersion"];
    readonly properties: {
        readonly id: {
            readonly $ref: "https://market-design-engine.dev/schemas/common/primitives.schema.json#/$defs/candidateMarketId";
        };
        readonly claimId: {
            readonly $ref: "https://market-design-engine.dev/schemas/common/primitives.schema.json#/$defs/claimId";
        };
        readonly canonicalEventId: {
            readonly $ref: "https://market-design-engine.dev/schemas/common/primitives.schema.json#/$defs/eventId";
        };
        readonly title: {
            readonly $ref: "https://market-design-engine.dev/schemas/value-objects/title.schema.json";
        };
        readonly slug: {
            readonly $ref: "https://market-design-engine.dev/schemas/value-objects/slug.schema.json";
        };
        readonly description: {
            readonly type: "string";
            readonly minLength: 1;
        };
        readonly resolutionBasis: {
            readonly type: "string";
            readonly enum: MarketResolutionBasis[];
        };
        readonly resolutionWindow: {
            readonly type: "object";
            readonly additionalProperties: false;
            readonly required: readonly ["openAt", "closeAt"];
            readonly properties: {
                readonly openAt: {
                    readonly $ref: "https://market-design-engine.dev/schemas/value-objects/timestamp.schema.json";
                };
                readonly closeAt: {
                    readonly $ref: "https://market-design-engine.dev/schemas/value-objects/timestamp.schema.json";
                };
            };
        };
        readonly outcomes: {
            readonly type: "array";
            readonly minItems: 2;
            readonly items: {
                readonly $ref: "https://market-design-engine.dev/schemas/entities/market-outcome.schema.json";
            };
        };
        readonly marketType: {
            readonly type: "string";
            readonly enum: MarketType[];
        };
        readonly categories: {
            readonly type: "array";
            readonly items: {
                readonly type: "string";
            };
        };
        readonly tags: {
            readonly type: "array";
            readonly items: {
                readonly $ref: "https://market-design-engine.dev/schemas/common/primitives.schema.json#/$defs/tag";
            };
        };
        readonly confidenceScore: {
            readonly $ref: "https://market-design-engine.dev/schemas/value-objects/confidence-score.schema.json";
        };
        readonly draftNotes: {
            readonly type: readonly ["string", "null"];
        };
        readonly entityVersion: {
            readonly type: "integer";
            readonly minimum: 1;
        };
    };
};
//# sourceMappingURL=candidate-market.schema.d.ts.map