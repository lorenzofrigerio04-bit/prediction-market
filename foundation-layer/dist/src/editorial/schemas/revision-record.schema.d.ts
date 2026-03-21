export declare const REVISION_RECORD_SCHEMA_ID = "https://market-design-engine.dev/schemas/editorial/revision-record.schema.json";
export declare const revisionRecordSchema: {
    readonly $id: "https://market-design-engine.dev/schemas/editorial/revision-record.schema.json";
    readonly $schema: "https://json-schema.org/draft/2020-12/schema";
    readonly type: "object";
    readonly additionalProperties: false;
    readonly required: readonly ["id", "version", "target_entity_type", "target_entity_id", "revision_number", "changed_fields", "changed_by", "changed_at", "revision_reason"];
    readonly properties: {
        readonly id: {
            readonly type: "string";
            readonly pattern: "^rev_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$";
        };
        readonly version: {
            readonly type: "integer";
            readonly minimum: 1;
        };
        readonly target_entity_type: {
            readonly type: "string";
            readonly minLength: 1;
        };
        readonly target_entity_id: {
            readonly type: "string";
            readonly minLength: 1;
        };
        readonly revision_number: {
            readonly type: "integer";
            readonly minimum: 1;
        };
        readonly changed_fields: {
            readonly type: "array";
            readonly minItems: 1;
            readonly items: {
                readonly type: "object";
                readonly additionalProperties: false;
                readonly required: readonly ["field_path", "previous_value_summary", "new_value_summary"];
                readonly properties: {
                    readonly field_path: {
                        readonly type: "string";
                        readonly minLength: 1;
                    };
                    readonly previous_value_summary: {
                        readonly type: "string";
                        readonly minLength: 1;
                    };
                    readonly new_value_summary: {
                        readonly type: "string";
                        readonly minLength: 1;
                    };
                };
            };
        };
        readonly changed_by: {
            readonly type: "string";
            readonly pattern: "^actor_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$";
        };
        readonly changed_at: {
            readonly type: "string";
            readonly format: "date-time";
        };
        readonly revision_reason: {
            readonly type: "string";
            readonly minLength: 1;
        };
    };
};
//# sourceMappingURL=revision-record.schema.d.ts.map