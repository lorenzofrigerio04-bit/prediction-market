export const PRELIMINARY_SCORECARD_SCHEMA_ID = "https://market-design-engine.dev/schemas/market-design/preliminary-scorecard.schema.json";
const scoreRef = {
    $ref: "https://market-design-engine.dev/schemas/common/primitives.schema.json#/$defs/score01",
};
export const preliminaryScorecardSchema = {
    $id: PRELIMINARY_SCORECARD_SCHEMA_ID,
    $schema: "https://json-schema.org/draft/2020-12/schema",
    type: "object",
    additionalProperties: false,
    required: [
        "clarity_score",
        "resolvability_score",
        "novelty_score",
        "liquidity_potential_score",
        "ambiguity_risk_score",
        "duplicate_risk_score",
        "editorial_value_score",
        "final_publish_score",
    ],
    properties: {
        clarity_score: scoreRef,
        resolvability_score: scoreRef,
        novelty_score: scoreRef,
        liquidity_potential_score: scoreRef,
        ambiguity_risk_score: scoreRef,
        duplicate_risk_score: scoreRef,
        editorial_value_score: scoreRef,
        final_publish_score: scoreRef,
    },
};
//# sourceMappingURL=preliminary-scorecard.schema.js.map