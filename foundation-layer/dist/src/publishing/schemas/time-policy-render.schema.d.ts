export declare const TIME_POLICY_RENDER_SCHEMA_ID = "https://market-design-engine.dev/schemas/publishing/time-policy-render.schema.json";
export declare const timePolicyRenderSchema: {
    readonly $id: "https://market-design-engine.dev/schemas/publishing/time-policy-render.schema.json";
    readonly $schema: "https://json-schema.org/draft/2020-12/schema";
    readonly type: "object";
    readonly additionalProperties: false;
    readonly required: readonly ["timezone", "deadline_text", "close_time_text", "cutoff_text_nullable", "policy_notes", "metadata"];
    readonly properties: {
        readonly timezone: {
            readonly type: "string";
            readonly minLength: 1;
        };
        readonly deadline_text: {
            readonly type: "string";
            readonly minLength: 1;
        };
        readonly close_time_text: {
            readonly type: "string";
            readonly minLength: 1;
        };
        readonly cutoff_text_nullable: {
            readonly type: readonly ["string", "null"];
        };
        readonly policy_notes: {
            readonly type: "array";
            readonly items: {
                readonly type: "string";
                readonly minLength: 1;
            };
            readonly uniqueItems: true;
        };
        readonly metadata: {
            readonly type: "object";
            readonly additionalProperties: true;
        };
    };
};
//# sourceMappingURL=time-policy-render.schema.d.ts.map