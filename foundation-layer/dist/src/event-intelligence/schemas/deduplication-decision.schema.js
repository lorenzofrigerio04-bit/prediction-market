import { DeduplicationDecisionType } from "../deduplication/enums/deduplication-decision-type.enum.js";
export const DEDUPLICATION_DECISION_SCHEMA_ID = "https://market-design-engine.dev/schemas/event-intelligence/deduplication-decision.schema.json";
export const deduplicationDecisionSchema = {
    $id: DEDUPLICATION_DECISION_SCHEMA_ID,
    $schema: "https://json-schema.org/draft/2020-12/schema",
    type: "object",
    additionalProperties: false,
    required: ["candidate_id", "canonical_event_id", "decision_type", "decision_confidence"],
    properties: {
        candidate_id: {
            $ref: "https://market-design-engine.dev/schemas/event-intelligence/shared.schema.json#/$defs/eventCandidateId",
        },
        canonical_event_id: {
            $ref: "https://market-design-engine.dev/schemas/event-intelligence/shared.schema.json#/$defs/canonicalEventIntelligenceId",
        },
        decision_type: {
            type: "string",
            enum: Object.values(DeduplicationDecisionType),
        },
        decision_confidence: {
            $ref: "https://market-design-engine.dev/schemas/common/primitives.schema.json#/$defs/score01",
        },
    },
};
//# sourceMappingURL=deduplication-decision.schema.js.map