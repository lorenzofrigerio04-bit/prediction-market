export declare const DISCOVERY_VALIDATION_FAILURE_SCHEMA_ID = "https://market-design-engine.dev/schemas/discovery/discovery-validation-failure.schema.json";
export declare const discoveryValidationFailureSchema: {
    readonly $id: "https://market-design-engine.dev/schemas/discovery/discovery-validation-failure.schema.json";
    readonly $schema: "https://json-schema.org/draft/2020-12/schema";
    readonly type: "object";
    readonly additionalProperties: false;
    readonly required: readonly ["code", "path", "message", "contextNullable"];
    readonly properties: {
        readonly code: {
            readonly type: "string";
            readonly minLength: 1;
        };
        readonly path: {
            readonly type: "string";
        };
        readonly message: {
            readonly type: "string";
        };
        readonly contextNullable: {
            readonly oneOf: readonly [{
                readonly type: "object";
            }, {
                readonly type: "null";
            }];
        };
    };
};
//# sourceMappingURL=discovery-validation-failure.schema.d.ts.map