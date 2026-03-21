import { RelationshipStrength } from "../enums/relationship-strength.enum.js";
import { RelationshipType } from "../enums/relationship-type.enum.js";
export const MARKET_RELATIONSHIP_SCHEMA_ID = "https://market-design-engine.dev/schemas/market-expansion/market-relationship.schema.json";
export const marketRelationshipSchema = {
    $id: MARKET_RELATIONSHIP_SCHEMA_ID,
    $schema: "https://json-schema.org/draft/2020-12/schema",
    type: "object",
    additionalProperties: false,
    required: [
        "id",
        "source_market_ref",
        "target_market_ref",
        "relationship_type",
        "relationship_strength",
        "blocking_cannibalization",
        "notes_nullable",
    ],
    properties: {
        id: { type: "string", pattern: "^mrl_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$" },
        source_market_ref: { type: "string", minLength: 1 },
        target_market_ref: { type: "string", minLength: 1 },
        relationship_type: { type: "string", enum: Object.values(RelationshipType) },
        relationship_strength: { type: "string", enum: Object.values(RelationshipStrength) },
        blocking_cannibalization: { type: "boolean" },
        notes_nullable: { anyOf: [{ type: "null" }, { type: "string", minLength: 1 }] },
    },
};
//# sourceMappingURL=market-relationship.schema.js.map