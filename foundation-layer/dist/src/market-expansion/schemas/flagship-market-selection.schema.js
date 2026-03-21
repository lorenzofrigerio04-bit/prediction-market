export const FLAGSHIP_MARKET_SELECTION_SCHEMA_ID = "https://market-design-engine.dev/schemas/market-expansion/flagship-market-selection.schema.json";
export const flagshipMarketSelectionSchema = {
    $id: FLAGSHIP_MARKET_SELECTION_SCHEMA_ID,
    $schema: "https://json-schema.org/draft/2020-12/schema",
    type: "object",
    additionalProperties: false,
    required: [
        "id",
        "version",
        "source_context_ref",
        "selected_market_ref",
        "selection_reason",
        "strategic_priority",
        "selection_confidence",
    ],
    properties: {
        id: { type: "string", pattern: "^mfs_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$" },
        version: { type: "integer", minimum: 1 },
        source_context_ref: { type: "string", minLength: 1 },
        selected_market_ref: { type: "string", minLength: 1 },
        selection_reason: { type: "string", minLength: 1 },
        strategic_priority: { type: "integer", minimum: 1, maximum: 10 },
        selection_confidence: { type: "number", minimum: 0, maximum: 1 },
    },
};
//# sourceMappingURL=flagship-market-selection.schema.js.map