import { ApprovalScope } from "../enums/approval-scope.enum.js";
export declare const APPROVAL_DECISION_SCHEMA_ID = "https://market-design-engine.dev/schemas/editorial/approval-decision.schema.json";
export declare const approvalDecisionSchema: {
    readonly $id: "https://market-design-engine.dev/schemas/editorial/approval-decision.schema.json";
    readonly $schema: "https://json-schema.org/draft/2020-12/schema";
    readonly type: "object";
    readonly additionalProperties: false;
    readonly required: readonly ["id", "version", "publishable_candidate_id", "approved_by", "approved_at", "approval_scope", "approval_notes_nullable", "publication_readiness_score"];
    readonly properties: {
        readonly id: {
            readonly type: "string";
            readonly pattern: "^apd_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$";
        };
        readonly version: {
            readonly type: "integer";
            readonly minimum: 1;
        };
        readonly publishable_candidate_id: {
            readonly type: "string";
            readonly pattern: "^pcnd_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$";
        };
        readonly approved_by: {
            readonly type: "string";
            readonly pattern: "^actor_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$";
        };
        readonly approved_at: {
            readonly type: "string";
            readonly format: "date-time";
        };
        readonly approval_scope: {
            readonly type: "string";
            readonly enum: ApprovalScope[];
        };
        readonly approval_notes_nullable: {
            readonly anyOf: readonly [{
                readonly type: "string";
            }, {
                readonly type: "null";
            }];
        };
        readonly publication_readiness_score: {
            readonly type: "number";
            readonly minimum: 0;
            readonly maximum: 100;
        };
    };
};
//# sourceMappingURL=approval-decision.schema.d.ts.map