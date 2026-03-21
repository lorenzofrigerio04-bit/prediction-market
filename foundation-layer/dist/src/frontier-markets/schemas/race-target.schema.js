export const RACE_TARGET_SCHEMA_ID = "https://market-design-engine.dev/schemas/frontier-markets/race-target.schema.json";
export const raceTargetSchema = {
    $id: RACE_TARGET_SCHEMA_ID,
    $schema: "https://json-schema.org/draft/2020-12/schema",
    type: "object",
    additionalProperties: false,
    required: [
        "target_key",
        "display_label",
        "semantic_definition",
        "active",
        "ordering_priority_nullable",
    ],
    properties: {
        target_key: { type: "string", pattern: "^[a-z][a-z0-9_]{1,31}$" },
        display_label: { type: "string", minLength: 1 },
        semantic_definition: { type: "string", minLength: 1 },
        active: { type: "boolean" },
        ordering_priority_nullable: {
            anyOf: [
                { type: "null" },
                { type: "integer", minimum: 1 },
            ],
        },
    },
};
//# sourceMappingURL=race-target.schema.js.map