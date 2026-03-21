export declare const MARKET_DRAFT_PIPELINE_SCHEMA_ID = "https://market-design-engine.dev/schemas/market-design/market-draft-pipeline.schema.json";
export declare const marketDraftPipelineSchema: {
    readonly $id: "https://market-design-engine.dev/schemas/market-design/market-draft-pipeline.schema.json";
    readonly $schema: "https://json-schema.org/draft/2020-12/schema";
    readonly type: "object";
    readonly additionalProperties: false;
    readonly required: readonly ["canonical_event", "opportunity_assessment", "contract_selection", "outcome_generation_result", "deadline_resolution", "source_hierarchy_selection", "preliminary_scorecard", "foundation_candidate_market"];
    readonly properties: {
        readonly canonical_event: {
            readonly $ref: "https://market-design-engine.dev/schemas/event-intelligence/canonical-event.schema.json";
        };
        readonly opportunity_assessment: {
            readonly $ref: "https://market-design-engine.dev/schemas/market-design/opportunity-assessment.schema.json";
        };
        readonly contract_selection: {
            readonly $ref: "https://market-design-engine.dev/schemas/market-design/contract-selection.schema.json";
        };
        readonly outcome_generation_result: {
            readonly $ref: "https://market-design-engine.dev/schemas/market-design/outcome-generation-result.schema.json";
        };
        readonly deadline_resolution: {
            readonly $ref: "https://market-design-engine.dev/schemas/market-design/deadline-resolution.schema.json";
        };
        readonly source_hierarchy_selection: {
            readonly $ref: "https://market-design-engine.dev/schemas/market-design/source-hierarchy-selection.schema.json";
        };
        readonly preliminary_scorecard: {
            readonly $ref: "https://market-design-engine.dev/schemas/market-design/preliminary-scorecard.schema.json";
        };
        readonly foundation_candidate_market: {
            readonly $ref: "https://market-design-engine.dev/schemas/entities/candidate-market.schema.json";
        };
    };
};
//# sourceMappingURL=market-draft-pipeline.schema.d.ts.map