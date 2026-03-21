import { QuotaDecisionStatus } from "../enums/quota-decision-status.enum.js";
export const QUOTA_EVALUATION_SCHEMA_ID = "https://market-design-engine.dev/schemas/virtual-credits/quota-evaluation.schema.json";
export const quotaEvaluationSchema = {
    $id: QUOTA_EVALUATION_SCHEMA_ID,
    $schema: "https://json-schema.org/draft/2020-12/schema",
    type: "object",
    additionalProperties: false,
    required: [
        "id",
        "version",
        "policy_id",
        "target_account_id",
        "evaluated_action_key",
        "current_usage",
        "requested_usage",
        "decision_status",
        "blocking_reasons",
        "evaluated_at",
    ],
    properties: {
        id: { type: "string", pattern: "^vqe_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$" },
        version: { type: "string", pattern: "^v\\d+\\.\\d+\\.\\d+$" },
        policy_id: { type: "string", pattern: "^vqp_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$" },
        target_account_id: { type: "string", pattern: "^vca_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$" },
        evaluated_action_key: { type: "string", minLength: 1 },
        current_usage: { type: "number" },
        requested_usage: { type: "number" },
        decision_status: { type: "string", enum: Object.values(QuotaDecisionStatus) },
        blocking_reasons: { type: "array", items: { type: "string", minLength: 1 } },
        evaluated_at: { type: "string", format: "date-time" },
    },
};
//# sourceMappingURL=quota-evaluation.schema.js.map