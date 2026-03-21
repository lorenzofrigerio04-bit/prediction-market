export declare const RELIABILITY_GOVERNANCE_GUARD_SCHEMA_ID = "https://market-design-engine.dev/schemas/admin-governance/reliability-governance-guard.schema.json";
export declare const reliabilityGovernanceGuardSchema: {
    readonly $id: "https://market-design-engine.dev/schemas/admin-governance/reliability-governance-guard.schema.json";
    readonly $schema: "https://json-schema.org/draft/2020-12/schema";
    readonly type: "object";
    readonly additionalProperties: false;
    readonly required: readonly ["denied_operations"];
    readonly properties: {
        readonly denied_operations: {
            readonly type: "array";
            readonly items: {
                readonly type: "string";
                readonly minLength: 1;
            };
        };
    };
};
//# sourceMappingURL=reliability-governance-guard.schema.d.ts.map