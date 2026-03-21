import { ReasonCode } from "../enums/reason-code.enum.js";
export declare const REJECTION_DECISION_SCHEMA_ID = "https://market-design-engine.dev/schemas/editorial/rejection-decision.schema.json";
export declare const rejectionDecisionSchema: {
    readonly $id: "https://market-design-engine.dev/schemas/editorial/rejection-decision.schema.json";
    readonly $schema: "https://json-schema.org/draft/2020-12/schema";
    readonly type: "object";
    readonly additionalProperties: false;
    readonly required: readonly ["id", "version", "publishable_candidate_id", "rejected_by", "rejected_at", "rejection_reason_codes", "rejection_notes_nullable", "rework_required"];
    readonly properties: {
        readonly id: {
            readonly type: "string";
            readonly pattern: "^rjd_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$";
        };
        readonly version: {
            readonly type: "integer";
            readonly minimum: 1;
        };
        readonly publishable_candidate_id: {
            readonly type: "string";
            readonly pattern: "^pcnd_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$";
        };
        readonly rejected_by: {
            readonly type: "string";
            readonly pattern: "^actor_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$";
        };
        readonly rejected_at: {
            readonly type: "string";
            readonly format: "date-time";
        };
        readonly rejection_reason_codes: {
            readonly type: "array";
            readonly minItems: 1;
            readonly items: {
                readonly type: "string";
                readonly enum: ReasonCode[];
            };
        };
        readonly rejection_notes_nullable: {
            readonly anyOf: readonly [{
                readonly type: "string";
            }, {
                readonly type: "null";
            }];
        };
        readonly rework_required: {
            readonly type: "boolean";
        };
    };
};
//# sourceMappingURL=rejection-decision.schema.d.ts.map