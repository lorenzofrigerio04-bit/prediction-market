export const VALIDATION_REPORT_SCHEMA_ID = "https://market-design-engine.dev/schemas/entities/validation-report.schema.json";
export const validationReportSchema = {
    $id: VALIDATION_REPORT_SCHEMA_ID,
    $schema: "https://json-schema.org/draft/2020-12/schema",
    type: "object",
    additionalProperties: false,
    required: ["targetType", "targetId", "isValid", "issues", "generatedAt"],
    properties: {
        targetType: { type: "string", minLength: 1 },
        targetId: { type: "string", minLength: 1 },
        isValid: { type: "boolean" },
        issues: {
            type: "array",
            items: { $ref: "https://market-design-engine.dev/schemas/common/shared.schema.json#/$defs/validationIssue" },
        },
        generatedAt: { $ref: "https://market-design-engine.dev/schemas/value-objects/timestamp.schema.json" },
    },
};
//# sourceMappingURL=validation-report.schema.js.map