export declare const OPERATIONS_CONSOLE_GOVERNANCE_VIEW_SCHEMA_ID = "https://market-design-engine.dev/schemas/admin-governance/operations-console-governance-view.schema.json";
export declare const operationsConsoleGovernanceViewSchema: {
    readonly $id: "https://market-design-engine.dev/schemas/admin-governance/operations-console-governance-view.schema.json";
    readonly $schema: "https://json-schema.org/draft/2020-12/schema";
    readonly type: "object";
    readonly additionalProperties: false;
    readonly required: readonly ["module_key", "visible_operations"];
    readonly properties: {
        readonly module_key: {
            readonly type: "string";
            readonly minLength: 1;
        };
        readonly visible_operations: {
            readonly type: "array";
            readonly items: {
                readonly type: "string";
                readonly minLength: 1;
            };
        };
    };
};
//# sourceMappingURL=operations-console-governance-view.schema.d.ts.map