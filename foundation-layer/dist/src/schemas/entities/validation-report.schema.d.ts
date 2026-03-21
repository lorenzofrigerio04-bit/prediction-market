export declare const VALIDATION_REPORT_SCHEMA_ID = "https://market-design-engine.dev/schemas/entities/validation-report.schema.json";
export declare const validationReportSchema: {
    readonly $id: "https://market-design-engine.dev/schemas/entities/validation-report.schema.json";
    readonly $schema: "https://json-schema.org/draft/2020-12/schema";
    readonly type: "object";
    readonly additionalProperties: false;
    readonly required: readonly ["targetType", "targetId", "isValid", "issues", "generatedAt"];
    readonly properties: {
        readonly targetType: {
            readonly type: "string";
            readonly minLength: 1;
        };
        readonly targetId: {
            readonly type: "string";
            readonly minLength: 1;
        };
        readonly isValid: {
            readonly type: "boolean";
        };
        readonly issues: {
            readonly type: "array";
            readonly items: {
                readonly $ref: "https://market-design-engine.dev/schemas/common/shared.schema.json#/$defs/validationIssue";
            };
        };
        readonly generatedAt: {
            readonly $ref: "https://market-design-engine.dev/schemas/value-objects/timestamp.schema.json";
        };
    };
};
//# sourceMappingURL=validation-report.schema.d.ts.map