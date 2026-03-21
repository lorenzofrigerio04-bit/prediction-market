export declare const OUTCOME_DEFINITION_SCHEMA_ID = "https://market-design-engine.dev/schemas/market-design/outcome-definition.schema.json";
export declare const outcomeDefinitionSchema: {
    readonly $id: "https://market-design-engine.dev/schemas/market-design/outcome-definition.schema.json";
    readonly $schema: "https://json-schema.org/draft/2020-12/schema";
    readonly type: "object";
    readonly additionalProperties: false;
    readonly required: readonly ["id", "outcome_key", "display_label", "semantic_definition", "ordering_index_nullable", "range_definition_nullable", "active"];
    readonly properties: {
        readonly id: {
            readonly $ref: "https://market-design-engine.dev/schemas/common/primitives.schema.json#/$defs/outcomeId";
        };
        readonly outcome_key: {
            readonly type: "string";
            readonly pattern: "^[a-z0-9][a-z0-9_:-]{1,62}$";
        };
        readonly display_label: {
            readonly type: "string";
            readonly minLength: 1;
        };
        readonly semantic_definition: {
            readonly type: "string";
            readonly minLength: 1;
        };
        readonly ordering_index_nullable: {
            readonly oneOf: readonly [{
                readonly type: "integer";
                readonly minimum: 0;
            }, {
                readonly type: "null";
            }];
        };
        readonly range_definition_nullable: {
            readonly oneOf: readonly [{
                readonly type: "object";
                readonly additionalProperties: false;
                readonly required: readonly ["min_inclusive", "max_exclusive", "label_nullable"];
                readonly properties: {
                    readonly min_inclusive: {
                        readonly type: "number";
                    };
                    readonly max_exclusive: {
                        readonly type: "number";
                    };
                    readonly label_nullable: {
                        readonly type: readonly ["string", "null"];
                    };
                };
            }, {
                readonly type: "null";
            }];
        };
        readonly active: {
            readonly type: "boolean";
        };
    };
};
//# sourceMappingURL=outcome-definition.schema.d.ts.map