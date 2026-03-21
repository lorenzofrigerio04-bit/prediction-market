export const RESOLUTION_SUMMARY_SCHEMA_ID = "https://market-design-engine.dev/schemas/publishing/resolution-summary.schema.json";
export const resolutionSummarySchema = {
    $id: RESOLUTION_SUMMARY_SCHEMA_ID,
    $schema: "https://json-schema.org/draft/2020-12/schema",
    type: "object",
    additionalProperties: false,
    required: [
        "id",
        "version",
        "market_draft_pipeline_id",
        "one_line_resolution_summary",
        "summary_basis",
        "summary_confidence",
    ],
    properties: {
        id: { type: "string", pattern: "^rsum_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$" },
        version: { type: "integer", minimum: 1 },
        market_draft_pipeline_id: { type: "string", pattern: "^mdp_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$" },
        one_line_resolution_summary: { type: "string", minLength: 1 },
        summary_basis: {
            type: "object",
            additionalProperties: false,
            required: ["resolution_rule_ref", "source_hierarchy_ref", "deadline_ref", "basis_points"],
            properties: {
                resolution_rule_ref: { type: "string", minLength: 1 },
                source_hierarchy_ref: { type: "string", minLength: 1 },
                deadline_ref: { type: "string", minLength: 1 },
                basis_points: {
                    type: "array",
                    minItems: 1,
                    items: { type: "string", minLength: 1 },
                    uniqueItems: true,
                },
            },
        },
        summary_confidence: {
            $ref: "https://market-design-engine.dev/schemas/common/primitives.schema.json#/$defs/score01",
        },
    },
};
//# sourceMappingURL=resolution-summary.schema.js.map