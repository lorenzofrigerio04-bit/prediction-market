import { ApprovalScope } from "../enums/approval-scope.enum.js";
export const APPROVAL_DECISION_SCHEMA_ID = "https://market-design-engine.dev/schemas/editorial/approval-decision.schema.json";
export const approvalDecisionSchema = {
    $id: APPROVAL_DECISION_SCHEMA_ID,
    $schema: "https://json-schema.org/draft/2020-12/schema",
    type: "object",
    additionalProperties: false,
    required: [
        "id",
        "version",
        "publishable_candidate_id",
        "approved_by",
        "approved_at",
        "approval_scope",
        "approval_notes_nullable",
        "publication_readiness_score",
    ],
    properties: {
        id: { type: "string", pattern: "^apd_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$" },
        version: { type: "integer", minimum: 1 },
        publishable_candidate_id: { type: "string", pattern: "^pcnd_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$" },
        approved_by: { type: "string", pattern: "^actor_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$" },
        approved_at: { type: "string", format: "date-time" },
        approval_scope: { type: "string", enum: Object.values(ApprovalScope) },
        approval_notes_nullable: { anyOf: [{ type: "string" }, { type: "null" }] },
        publication_readiness_score: { type: "number", minimum: 0, maximum: 100 },
    },
};
//# sourceMappingURL=approval-decision.schema.js.map