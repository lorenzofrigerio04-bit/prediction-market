export declare const SCHEDULING_WINDOW_SCHEMA_ID = "https://market-design-engine.dev/schemas/live-integration/scheduling-window.schema.json";
export declare const schedulingWindowSchema: {
    readonly $id: "https://market-design-engine.dev/schemas/live-integration/scheduling-window.schema.json";
    readonly $schema: "https://json-schema.org/draft/2020-12/schema";
    readonly type: "object";
    readonly additionalProperties: false;
    readonly required: readonly ["start_at", "end_at"];
    readonly properties: {
        readonly start_at: {
            readonly type: "string";
            readonly format: "date-time";
        };
        readonly end_at: {
            readonly type: "string";
            readonly format: "date-time";
        };
    };
};
//# sourceMappingURL=scheduling-window.schema.d.ts.map