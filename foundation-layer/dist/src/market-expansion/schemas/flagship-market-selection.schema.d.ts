export declare const FLAGSHIP_MARKET_SELECTION_SCHEMA_ID = "https://market-design-engine.dev/schemas/market-expansion/flagship-market-selection.schema.json";
export declare const flagshipMarketSelectionSchema: {
    readonly $id: "https://market-design-engine.dev/schemas/market-expansion/flagship-market-selection.schema.json";
    readonly $schema: "https://json-schema.org/draft/2020-12/schema";
    readonly type: "object";
    readonly additionalProperties: false;
    readonly required: readonly ["id", "version", "source_context_ref", "selected_market_ref", "selection_reason", "strategic_priority", "selection_confidence"];
    readonly properties: {
        readonly id: {
            readonly type: "string";
            readonly pattern: "^mfs_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$";
        };
        readonly version: {
            readonly type: "integer";
            readonly minimum: 1;
        };
        readonly source_context_ref: {
            readonly type: "string";
            readonly minLength: 1;
        };
        readonly selected_market_ref: {
            readonly type: "string";
            readonly minLength: 1;
        };
        readonly selection_reason: {
            readonly type: "string";
            readonly minLength: 1;
        };
        readonly strategic_priority: {
            readonly type: "integer";
            readonly minimum: 1;
            readonly maximum: 10;
        };
        readonly selection_confidence: {
            readonly type: "number";
            readonly minimum: 0;
            readonly maximum: 1;
        };
    };
};
//# sourceMappingURL=flagship-market-selection.schema.d.ts.map