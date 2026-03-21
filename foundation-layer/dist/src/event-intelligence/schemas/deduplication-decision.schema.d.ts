import { DeduplicationDecisionType } from "../deduplication/enums/deduplication-decision-type.enum.js";
export declare const DEDUPLICATION_DECISION_SCHEMA_ID = "https://market-design-engine.dev/schemas/event-intelligence/deduplication-decision.schema.json";
export declare const deduplicationDecisionSchema: {
    readonly $id: "https://market-design-engine.dev/schemas/event-intelligence/deduplication-decision.schema.json";
    readonly $schema: "https://json-schema.org/draft/2020-12/schema";
    readonly type: "object";
    readonly additionalProperties: false;
    readonly required: readonly ["candidate_id", "canonical_event_id", "decision_type", "decision_confidence"];
    readonly properties: {
        readonly candidate_id: {
            readonly $ref: "https://market-design-engine.dev/schemas/event-intelligence/shared.schema.json#/$defs/eventCandidateId";
        };
        readonly canonical_event_id: {
            readonly $ref: "https://market-design-engine.dev/schemas/event-intelligence/shared.schema.json#/$defs/canonicalEventIntelligenceId";
        };
        readonly decision_type: {
            readonly type: "string";
            readonly enum: DeduplicationDecisionType[];
        };
        readonly decision_confidence: {
            readonly $ref: "https://market-design-engine.dev/schemas/common/primitives.schema.json#/$defs/score01";
        };
    };
};
//# sourceMappingURL=deduplication-decision.schema.d.ts.map