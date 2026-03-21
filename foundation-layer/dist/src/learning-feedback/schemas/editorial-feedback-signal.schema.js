import { FeedbackReasonCode } from "../enums/feedback-reason-code.enum.js";
import { FeedbackType } from "../enums/feedback-type.enum.js";
export const EDITORIAL_FEEDBACK_SIGNAL_SCHEMA_ID = "https://market-design-engine.dev/schemas/learning-feedback/editorial-feedback-signal.schema.json";
export const editorialFeedbackSignalSchema = {
    $id: EDITORIAL_FEEDBACK_SIGNAL_SCHEMA_ID,
    $schema: "https://json-schema.org/draft/2020-12/schema",
    type: "object",
    additionalProperties: false,
    required: [
        "id",
        "version",
        "correlation_id",
        "feedback_type",
        "decision_refs",
        "reason_codes",
        "notes",
        "created_at",
    ],
    properties: {
        id: { type: "string", pattern: "^lfs_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$" },
        version: { type: "integer", minimum: 1 },
        correlation_id: { type: "string", pattern: "^corr_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$" },
        feedback_type: { type: "string", enum: Object.values(FeedbackType) },
        decision_refs: { type: "array", items: { type: "string", minLength: 1 } },
        reason_codes: { type: "array", items: { type: "string", enum: Object.values(FeedbackReasonCode) } },
        notes: { type: "array", items: { type: "string", minLength: 1 } },
        created_at: { type: "string", format: "date-time" },
    },
};
//# sourceMappingURL=editorial-feedback-signal.schema.js.map