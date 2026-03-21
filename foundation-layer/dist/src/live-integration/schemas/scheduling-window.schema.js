export const SCHEDULING_WINDOW_SCHEMA_ID = "https://market-design-engine.dev/schemas/live-integration/scheduling-window.schema.json";
export const schedulingWindowSchema = {
    $id: SCHEDULING_WINDOW_SCHEMA_ID,
    $schema: "https://json-schema.org/draft/2020-12/schema",
    type: "object",
    additionalProperties: false,
    required: ["start_at", "end_at"],
    properties: {
        start_at: { type: "string", format: "date-time" },
        end_at: { type: "string", format: "date-time" },
    },
};
//# sourceMappingURL=scheduling-window.schema.js.map