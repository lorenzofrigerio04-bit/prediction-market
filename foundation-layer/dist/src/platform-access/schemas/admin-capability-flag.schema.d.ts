export declare const ADMIN_CAPABILITY_FLAG_SCHEMA_ID = "https://market-design-engine.dev/schemas/platform-access/admin-capability-flag.schema.json";
export declare const adminCapabilityFlagSchema: {
    readonly $id: "https://market-design-engine.dev/schemas/platform-access/admin-capability-flag.schema.json";
    readonly $schema: "https://json-schema.org/draft/2020-12/schema";
    readonly type: "object";
    readonly additionalProperties: false;
    readonly required: readonly ["flag_key", "description", "sensitive", "default_enabled"];
    readonly properties: {
        readonly flag_key: {
            readonly type: "string";
            readonly minLength: 1;
        };
        readonly description: {
            readonly type: "string";
            readonly minLength: 1;
        };
        readonly sensitive: {
            readonly type: "boolean";
        };
        readonly default_enabled: {
            readonly type: "boolean";
        };
    };
};
//# sourceMappingURL=admin-capability-flag.schema.d.ts.map