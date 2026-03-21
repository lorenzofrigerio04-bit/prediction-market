import { QuotaDecisionStatus } from "../enums/quota-decision-status.enum.js";
export declare const QUOTA_EVALUATION_SCHEMA_ID = "https://market-design-engine.dev/schemas/virtual-credits/quota-evaluation.schema.json";
export declare const quotaEvaluationSchema: {
    readonly $id: "https://market-design-engine.dev/schemas/virtual-credits/quota-evaluation.schema.json";
    readonly $schema: "https://json-schema.org/draft/2020-12/schema";
    readonly type: "object";
    readonly additionalProperties: false;
    readonly required: readonly ["id", "version", "policy_id", "target_account_id", "evaluated_action_key", "current_usage", "requested_usage", "decision_status", "blocking_reasons", "evaluated_at"];
    readonly properties: {
        readonly id: {
            readonly type: "string";
            readonly pattern: "^vqe_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$";
        };
        readonly version: {
            readonly type: "string";
            readonly pattern: "^v\\d+\\.\\d+\\.\\d+$";
        };
        readonly policy_id: {
            readonly type: "string";
            readonly pattern: "^vqp_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$";
        };
        readonly target_account_id: {
            readonly type: "string";
            readonly pattern: "^vca_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$";
        };
        readonly evaluated_action_key: {
            readonly type: "string";
            readonly minLength: 1;
        };
        readonly current_usage: {
            readonly type: "number";
        };
        readonly requested_usage: {
            readonly type: "number";
        };
        readonly decision_status: {
            readonly type: "string";
            readonly enum: QuotaDecisionStatus[];
        };
        readonly blocking_reasons: {
            readonly type: "array";
            readonly items: {
                readonly type: "string";
                readonly minLength: 1;
            };
        };
        readonly evaluated_at: {
            readonly type: "string";
            readonly format: "date-time";
        };
    };
};
//# sourceMappingURL=quota-evaluation.schema.d.ts.map