import { PatternStatus } from "../enums/pattern-status.enum.js";
export const REJECTION_PATTERN_SCHEMA_ID = "https://market-design-engine.dev/schemas/learning-feedback/rejection-pattern.schema.json";
export const rejectionPatternSchema = {
    $id: REJECTION_PATTERN_SCHEMA_ID,
    $schema: "https://json-schema.org/draft/2020-12/schema",
    type: "object",
    additionalProperties: false,
    required: ["id", "status", "reason_codes", "supporting_refs"],
    properties: {
        id: { type: "string", pattern: "^lrp_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$" },
        status: { type: "string", enum: Object.values(PatternStatus) },
        reason_codes: { type: "array", minItems: 1, items: { type: "string", minLength: 1 } },
        supporting_refs: { type: "array", minItems: 1, items: { type: "string", minLength: 1 } },
    },
};
//# sourceMappingURL=rejection-pattern.schema.js.map