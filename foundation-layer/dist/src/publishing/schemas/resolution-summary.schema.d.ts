export declare const RESOLUTION_SUMMARY_SCHEMA_ID = "https://market-design-engine.dev/schemas/publishing/resolution-summary.schema.json";
export declare const resolutionSummarySchema: {
    readonly $id: "https://market-design-engine.dev/schemas/publishing/resolution-summary.schema.json";
    readonly $schema: "https://json-schema.org/draft/2020-12/schema";
    readonly type: "object";
    readonly additionalProperties: false;
    readonly required: readonly ["id", "version", "market_draft_pipeline_id", "one_line_resolution_summary", "summary_basis", "summary_confidence"];
    readonly properties: {
        readonly id: {
            readonly type: "string";
            readonly pattern: "^rsum_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$";
        };
        readonly version: {
            readonly type: "integer";
            readonly minimum: 1;
        };
        readonly market_draft_pipeline_id: {
            readonly type: "string";
            readonly pattern: "^mdp_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$";
        };
        readonly one_line_resolution_summary: {
            readonly type: "string";
            readonly minLength: 1;
        };
        readonly summary_basis: {
            readonly type: "object";
            readonly additionalProperties: false;
            readonly required: readonly ["resolution_rule_ref", "source_hierarchy_ref", "deadline_ref", "basis_points"];
            readonly properties: {
                readonly resolution_rule_ref: {
                    readonly type: "string";
                    readonly minLength: 1;
                };
                readonly source_hierarchy_ref: {
                    readonly type: "string";
                    readonly minLength: 1;
                };
                readonly deadline_ref: {
                    readonly type: "string";
                    readonly minLength: 1;
                };
                readonly basis_points: {
                    readonly type: "array";
                    readonly minItems: 1;
                    readonly items: {
                        readonly type: "string";
                        readonly minLength: 1;
                    };
                    readonly uniqueItems: true;
                };
            };
        };
        readonly summary_confidence: {
            readonly $ref: "https://market-design-engine.dev/schemas/common/primitives.schema.json#/$defs/score01";
        };
    };
};
//# sourceMappingURL=resolution-summary.schema.d.ts.map