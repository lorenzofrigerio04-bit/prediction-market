export const OUTCOME_DEFINITION_SCHEMA_ID = "https://market-design-engine.dev/schemas/market-design/outcome-definition.schema.json";
export const outcomeDefinitionSchema = {
    $id: OUTCOME_DEFINITION_SCHEMA_ID,
    $schema: "https://json-schema.org/draft/2020-12/schema",
    type: "object",
    additionalProperties: false,
    required: [
        "id",
        "outcome_key",
        "display_label",
        "semantic_definition",
        "ordering_index_nullable",
        "range_definition_nullable",
        "active",
    ],
    properties: {
        id: {
            $ref: "https://market-design-engine.dev/schemas/common/primitives.schema.json#/$defs/outcomeId",
        },
        outcome_key: {
            type: "string",
            pattern: "^[a-z0-9][a-z0-9_:-]{1,62}$",
        },
        display_label: { type: "string", minLength: 1 },
        semantic_definition: { type: "string", minLength: 1 },
        ordering_index_nullable: {
            oneOf: [{ type: "integer", minimum: 0 }, { type: "null" }],
        },
        range_definition_nullable: {
            oneOf: [
                {
                    type: "object",
                    additionalProperties: false,
                    required: ["min_inclusive", "max_exclusive", "label_nullable"],
                    properties: {
                        min_inclusive: { type: "number" },
                        max_exclusive: { type: "number" },
                        label_nullable: { type: ["string", "null"] },
                    },
                },
                { type: "null" },
            ],
        },
        active: { type: "boolean" },
    },
};
//# sourceMappingURL=outcome-definition.schema.js.map