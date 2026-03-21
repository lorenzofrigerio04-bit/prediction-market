import { MarketResolutionBasis } from "../../enums/market-resolution-basis.enum.js";
import { MarketType } from "../../enums/market-type.enum.js";
export const CANDIDATE_MARKET_SCHEMA_ID = "https://market-design-engine.dev/schemas/entities/candidate-market.schema.json";
export const candidateMarketSchema = {
    $id: CANDIDATE_MARKET_SCHEMA_ID,
    $schema: "https://json-schema.org/draft/2020-12/schema",
    type: "object",
    additionalProperties: false,
    required: [
        "id",
        "claimId",
        "canonicalEventId",
        "title",
        "slug",
        "description",
        "resolutionBasis",
        "resolutionWindow",
        "outcomes",
        "marketType",
        "categories",
        "tags",
        "confidenceScore",
        "draftNotes",
        "entityVersion",
    ],
    properties: {
        id: {
            $ref: "https://market-design-engine.dev/schemas/common/primitives.schema.json#/$defs/candidateMarketId",
        },
        claimId: {
            $ref: "https://market-design-engine.dev/schemas/common/primitives.schema.json#/$defs/claimId",
        },
        canonicalEventId: {
            $ref: "https://market-design-engine.dev/schemas/common/primitives.schema.json#/$defs/eventId",
        },
        title: { $ref: "https://market-design-engine.dev/schemas/value-objects/title.schema.json" },
        slug: { $ref: "https://market-design-engine.dev/schemas/value-objects/slug.schema.json" },
        description: { type: "string", minLength: 1 },
        resolutionBasis: { type: "string", enum: Object.values(MarketResolutionBasis) },
        resolutionWindow: {
            type: "object",
            additionalProperties: false,
            required: ["openAt", "closeAt"],
            properties: {
                openAt: { $ref: "https://market-design-engine.dev/schemas/value-objects/timestamp.schema.json" },
                closeAt: { $ref: "https://market-design-engine.dev/schemas/value-objects/timestamp.schema.json" },
            },
        },
        outcomes: {
            type: "array",
            minItems: 2,
            items: { $ref: "https://market-design-engine.dev/schemas/entities/market-outcome.schema.json" },
        },
        marketType: { type: "string", enum: Object.values(MarketType) },
        categories: { type: "array", items: { type: "string" } },
        tags: {
            type: "array",
            items: {
                $ref: "https://market-design-engine.dev/schemas/common/primitives.schema.json#/$defs/tag",
            },
        },
        confidenceScore: { $ref: "https://market-design-engine.dev/schemas/value-objects/confidence-score.schema.json" },
        draftNotes: { type: ["string", "null"] },
        entityVersion: { type: "integer", minimum: 1 },
    },
};
//# sourceMappingURL=candidate-market.schema.js.map