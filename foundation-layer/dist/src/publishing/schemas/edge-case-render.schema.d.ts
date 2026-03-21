export declare const EDGE_CASE_RENDER_SCHEMA_ID = "https://market-design-engine.dev/schemas/publishing/edge-case-render.schema.json";
export declare const edgeCaseRenderSchema: {
    readonly $id: "https://market-design-engine.dev/schemas/publishing/edge-case-render.schema.json";
    readonly $schema: "https://json-schema.org/draft/2020-12/schema";
    readonly type: "object";
    readonly additionalProperties: false;
    readonly required: readonly ["edge_case_items", "invalidation_items", "notes_nullable"];
    readonly properties: {
        readonly edge_case_items: {
            readonly type: "array";
            readonly items: {
                readonly type: "string";
                readonly minLength: 1;
            };
            readonly uniqueItems: true;
            readonly minItems: 1;
        };
        readonly invalidation_items: {
            readonly type: "array";
            readonly items: {
                readonly type: "string";
                readonly minLength: 1;
            };
            readonly uniqueItems: true;
            readonly minItems: 1;
        };
        readonly notes_nullable: {
            readonly type: readonly ["string", "null"];
        };
    };
};
//# sourceMappingURL=edge-case-render.schema.d.ts.map