export declare const SEQUENCE_TARGET_SCHEMA_ID = "https://market-design-engine.dev/schemas/frontier-markets/sequence-target.schema.json";
export declare const sequenceTargetSchema: {
    readonly $id: "https://market-design-engine.dev/schemas/frontier-markets/sequence-target.schema.json";
    readonly $schema: "https://json-schema.org/draft/2020-12/schema";
    readonly type: "object";
    readonly additionalProperties: false;
    readonly required: readonly ["target_key", "canonical_event_ref_or_predicate", "display_label", "semantic_definition", "required"];
    readonly properties: {
        readonly target_key: {
            readonly type: "string";
            readonly pattern: "^[a-z][a-z0-9_]{1,31}$";
        };
        readonly canonical_event_ref_or_predicate: {
            readonly oneOf: readonly [{
                readonly type: "object";
                readonly additionalProperties: false;
                readonly required: readonly ["kind", "canonical_event_id"];
                readonly properties: {
                    readonly kind: {
                        readonly const: "canonical_event_ref";
                    };
                    readonly canonical_event_id: {
                        readonly type: "string";
                        readonly pattern: "^cevt_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$";
                    };
                };
            }, {
                readonly type: "object";
                readonly additionalProperties: false;
                readonly required: readonly ["kind", "predicate_key", "predicate_params"];
                readonly properties: {
                    readonly kind: {
                        readonly const: "deterministic_predicate";
                    };
                    readonly predicate_key: {
                        readonly type: "string";
                        readonly minLength: 1;
                    };
                    readonly predicate_params: {
                        readonly type: "object";
                        readonly additionalProperties: {
                            readonly type: readonly ["string", "number", "boolean"];
                        };
                    };
                };
            }];
        };
        readonly display_label: {
            readonly type: "string";
            readonly minLength: 1;
        };
        readonly semantic_definition: {
            readonly type: "string";
            readonly minLength: 1;
        };
        readonly required: {
            readonly type: "boolean";
        };
    };
};
//# sourceMappingURL=sequence-target.schema.d.ts.map