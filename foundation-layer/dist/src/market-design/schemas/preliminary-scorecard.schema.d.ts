export declare const PRELIMINARY_SCORECARD_SCHEMA_ID = "https://market-design-engine.dev/schemas/market-design/preliminary-scorecard.schema.json";
export declare const preliminaryScorecardSchema: {
    readonly $id: "https://market-design-engine.dev/schemas/market-design/preliminary-scorecard.schema.json";
    readonly $schema: "https://json-schema.org/draft/2020-12/schema";
    readonly type: "object";
    readonly additionalProperties: false;
    readonly required: readonly ["clarity_score", "resolvability_score", "novelty_score", "liquidity_potential_score", "ambiguity_risk_score", "duplicate_risk_score", "editorial_value_score", "final_publish_score"];
    readonly properties: {
        readonly clarity_score: {
            $ref: string;
        };
        readonly resolvability_score: {
            $ref: string;
        };
        readonly novelty_score: {
            $ref: string;
        };
        readonly liquidity_potential_score: {
            $ref: string;
        };
        readonly ambiguity_risk_score: {
            $ref: string;
        };
        readonly duplicate_risk_score: {
            $ref: string;
        };
        readonly editorial_value_score: {
            $ref: string;
        };
        readonly final_publish_score: {
            $ref: string;
        };
    };
};
//# sourceMappingURL=preliminary-scorecard.schema.d.ts.map