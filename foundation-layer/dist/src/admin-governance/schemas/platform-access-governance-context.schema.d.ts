export declare const PLATFORM_ACCESS_GOVERNANCE_CONTEXT_SCHEMA_ID = "https://market-design-engine.dev/schemas/admin-governance/platform-access-governance-context.schema.json";
export declare const platformAccessGovernanceContextSchema: {
    readonly $id: "https://market-design-engine.dev/schemas/admin-governance/platform-access-governance-context.schema.json";
    readonly $schema: "https://json-schema.org/draft/2020-12/schema";
    readonly type: "object";
    readonly additionalProperties: false;
    readonly required: readonly ["module_key", "requested_operations", "denied_operations"];
    readonly properties: {
        readonly module_key: {
            readonly type: "string";
            readonly minLength: 1;
        };
        readonly requested_operations: {
            readonly type: "array";
            readonly items: {
                readonly type: "string";
                readonly minLength: 1;
            };
        };
        readonly denied_operations: {
            readonly type: "array";
            readonly items: {
                readonly type: "string";
                readonly minLength: 1;
            };
        };
    };
};
//# sourceMappingURL=platform-access-governance-context.schema.d.ts.map