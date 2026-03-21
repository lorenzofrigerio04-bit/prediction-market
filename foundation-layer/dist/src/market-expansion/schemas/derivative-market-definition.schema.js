import { DerivativeType } from "../enums/derivative-type.enum.js";
export const DERIVATIVE_MARKET_DEFINITION_SCHEMA_ID = "https://market-design-engine.dev/schemas/market-expansion/derivative-market-definition.schema.json";
export const derivativeMarketDefinitionSchema = {
    $id: DERIVATIVE_MARKET_DEFINITION_SCHEMA_ID,
    $schema: "https://json-schema.org/draft/2020-12/schema",
    type: "object",
    additionalProperties: false,
    required: [
        "id",
        "version",
        "parent_family_id",
        "source_relation_ref",
        "market_ref",
        "derivative_type",
        "dependency_strength",
        "active",
    ],
    properties: {
        id: { type: "string", pattern: "^mdd_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$" },
        version: { type: "integer", minimum: 1 },
        parent_family_id: { type: "string", pattern: "^mfy_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$" },
        source_relation_ref: { type: "string", minLength: 1 },
        market_ref: { type: "string", minLength: 1 },
        derivative_type: { type: "string", enum: Object.values(DerivativeType) },
        dependency_strength: { type: "number", minimum: 0, maximum: 1 },
        active: { type: "boolean" },
    },
};
//# sourceMappingURL=derivative-market-definition.schema.js.map