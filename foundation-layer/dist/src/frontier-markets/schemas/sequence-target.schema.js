export const SEQUENCE_TARGET_SCHEMA_ID = "https://market-design-engine.dev/schemas/frontier-markets/sequence-target.schema.json";
export const sequenceTargetSchema = {
    $id: SEQUENCE_TARGET_SCHEMA_ID,
    $schema: "https://json-schema.org/draft/2020-12/schema",
    type: "object",
    additionalProperties: false,
    required: [
        "target_key",
        "canonical_event_ref_or_predicate",
        "display_label",
        "semantic_definition",
        "required",
    ],
    properties: {
        target_key: { type: "string", pattern: "^[a-z][a-z0-9_]{1,31}$" },
        canonical_event_ref_or_predicate: {
            oneOf: [
                {
                    type: "object",
                    additionalProperties: false,
                    required: ["kind", "canonical_event_id"],
                    properties: {
                        kind: { const: "canonical_event_ref" },
                        canonical_event_id: {
                            type: "string",
                            pattern: "^cevt_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$",
                        },
                    },
                },
                {
                    type: "object",
                    additionalProperties: false,
                    required: ["kind", "predicate_key", "predicate_params"],
                    properties: {
                        kind: { const: "deterministic_predicate" },
                        predicate_key: { type: "string", minLength: 1 },
                        predicate_params: {
                            type: "object",
                            additionalProperties: {
                                type: ["string", "number", "boolean"],
                            },
                        },
                    },
                },
            ],
        },
        display_label: { type: "string", minLength: 1 },
        semantic_definition: { type: "string", minLength: 1 },
        required: { type: "boolean" },
    },
};
//# sourceMappingURL=sequence-target.schema.js.map