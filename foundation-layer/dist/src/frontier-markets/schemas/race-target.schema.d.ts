export declare const RACE_TARGET_SCHEMA_ID = "https://market-design-engine.dev/schemas/frontier-markets/race-target.schema.json";
export declare const raceTargetSchema: {
    readonly $id: "https://market-design-engine.dev/schemas/frontier-markets/race-target.schema.json";
    readonly $schema: "https://json-schema.org/draft/2020-12/schema";
    readonly type: "object";
    readonly additionalProperties: false;
    readonly required: readonly ["target_key", "display_label", "semantic_definition", "active", "ordering_priority_nullable"];
    readonly properties: {
        readonly target_key: {
            readonly type: "string";
            readonly pattern: "^[a-z][a-z0-9_]{1,31}$";
        };
        readonly display_label: {
            readonly type: "string";
            readonly minLength: 1;
        };
        readonly semantic_definition: {
            readonly type: "string";
            readonly minLength: 1;
        };
        readonly active: {
            readonly type: "boolean";
        };
        readonly ordering_priority_nullable: {
            readonly anyOf: readonly [{
                readonly type: "null";
            }, {
                readonly type: "integer";
                readonly minimum: 1;
            }];
        };
    };
};
//# sourceMappingURL=race-target.schema.d.ts.map