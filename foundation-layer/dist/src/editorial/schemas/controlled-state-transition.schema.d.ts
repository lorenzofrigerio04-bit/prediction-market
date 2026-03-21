export declare const CONTROLLED_STATE_TRANSITION_SCHEMA_ID = "https://market-design-engine.dev/schemas/editorial/controlled-state-transition.schema.json";
export declare const controlledStateTransitionSchema: {
    readonly $id: "https://market-design-engine.dev/schemas/editorial/controlled-state-transition.schema.json";
    readonly $schema: "https://json-schema.org/draft/2020-12/schema";
    readonly type: "object";
    readonly additionalProperties: false;
    readonly required: readonly ["id", "version", "publishable_candidate_id", "from_state", "to_state", "transition_at", "transitioned_by", "transition_reason", "audit_record_id"];
    readonly properties: {
        readonly id: {
            readonly type: "string";
            readonly pattern: "^ctr_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$";
        };
        readonly version: {
            readonly type: "integer";
            readonly minimum: 1;
        };
        readonly publishable_candidate_id: {
            readonly type: "string";
            readonly pattern: "^pcnd_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$";
        };
        readonly from_state: {
            readonly type: "string";
            readonly minLength: 1;
        };
        readonly to_state: {
            readonly type: "string";
            readonly minLength: 1;
        };
        readonly transition_at: {
            readonly type: "string";
            readonly format: "date-time";
        };
        readonly transitioned_by: {
            readonly type: "string";
            readonly pattern: "^actor_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$";
        };
        readonly transition_reason: {
            readonly type: "string";
            readonly minLength: 1;
        };
        readonly audit_record_id: {
            readonly type: "string";
            readonly pattern: "^aud_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$";
        };
    };
};
//# sourceMappingURL=controlled-state-transition.schema.d.ts.map