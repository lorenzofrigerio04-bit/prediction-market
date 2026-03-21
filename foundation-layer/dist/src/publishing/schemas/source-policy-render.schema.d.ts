export declare const SOURCE_POLICY_RENDER_SCHEMA_ID = "https://market-design-engine.dev/schemas/publishing/source-policy-render.schema.json";
export declare const sourcePolicyRenderSchema: {
    readonly $id: "https://market-design-engine.dev/schemas/publishing/source-policy-render.schema.json";
    readonly $schema: "https://json-schema.org/draft/2020-12/schema";
    readonly type: "object";
    readonly additionalProperties: false;
    readonly required: readonly ["selected_source_priority", "source_policy_text", "fallback_policy_text_nullable"];
    readonly properties: {
        readonly selected_source_priority: {
            readonly type: "array";
            readonly minItems: 1;
            readonly items: {
                readonly type: "string";
                readonly minLength: 1;
            };
            readonly uniqueItems: true;
        };
        readonly source_policy_text: {
            readonly type: "string";
            readonly minLength: 1;
        };
        readonly fallback_policy_text_nullable: {
            readonly type: readonly ["string", "null"];
        };
    };
};
//# sourceMappingURL=source-policy-render.schema.d.ts.map