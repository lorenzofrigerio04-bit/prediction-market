export const DISCOVERY_VALIDATION_FAILURE_SCHEMA_ID = "https://market-design-engine.dev/schemas/discovery/discovery-validation-failure.schema.json";
export const discoveryValidationFailureSchema = {
    $id: DISCOVERY_VALIDATION_FAILURE_SCHEMA_ID,
    $schema: "https://json-schema.org/draft/2020-12/schema",
    type: "object",
    additionalProperties: false,
    required: ["code", "path", "message", "contextNullable"],
    properties: {
        code: { type: "string", minLength: 1 },
        path: { type: "string" },
        message: { type: "string" },
        contextNullable: {
            oneOf: [{ type: "object" }, { type: "null" }],
        },
    },
};
//# sourceMappingURL=discovery-validation-failure.schema.js.map