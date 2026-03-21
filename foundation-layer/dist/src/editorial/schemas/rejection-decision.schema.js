import { ReasonCode } from "../enums/reason-code.enum.js";
export const REJECTION_DECISION_SCHEMA_ID = "https://market-design-engine.dev/schemas/editorial/rejection-decision.schema.json";
export const rejectionDecisionSchema = {
    $id: REJECTION_DECISION_SCHEMA_ID,
    $schema: "https://json-schema.org/draft/2020-12/schema",
    type: "object",
    additionalProperties: false,
    required: [
        "id",
        "version",
        "publishable_candidate_id",
        "rejected_by",
        "rejected_at",
        "rejection_reason_codes",
        "rejection_notes_nullable",
        "rework_required",
    ],
    properties: {
        id: { type: "string", pattern: "^rjd_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$" },
        version: { type: "integer", minimum: 1 },
        publishable_candidate_id: { type: "string", pattern: "^pcnd_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$" },
        rejected_by: { type: "string", pattern: "^actor_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$" },
        rejected_at: { type: "string", format: "date-time" },
        rejection_reason_codes: {
            type: "array",
            minItems: 1,
            items: { type: "string", enum: Object.values(ReasonCode) },
        },
        rejection_notes_nullable: { anyOf: [{ type: "string" }, { type: "null" }] },
        rework_required: { type: "boolean" },
    },
};
//# sourceMappingURL=rejection-decision.schema.js.map