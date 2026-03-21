import { ConflictType } from "../conflicts/enums/conflict-type.enum.js";
export const EVENT_CONFLICT_SCHEMA_ID = "https://market-design-engine.dev/schemas/event-intelligence/event-conflict.schema.json";
export const eventConflictSchema = {
    $id: EVENT_CONFLICT_SCHEMA_ID,
    $schema: "https://json-schema.org/draft/2020-12/schema",
    type: "object",
    additionalProperties: false,
    required: [
        "id",
        "canonical_event_id_nullable",
        "candidate_id_nullable",
        "conflict_type",
        "description",
        "conflicting_fields",
        "related_observation_ids",
        "confidence",
    ],
    properties: {
        id: {
            $ref: "https://market-design-engine.dev/schemas/event-intelligence/shared.schema.json#/$defs/eventConflictId",
        },
        canonical_event_id_nullable: {
            oneOf: [
                {
                    $ref: "https://market-design-engine.dev/schemas/event-intelligence/shared.schema.json#/$defs/canonicalEventIntelligenceId",
                },
                { type: "null" },
            ],
        },
        candidate_id_nullable: {
            oneOf: [
                {
                    $ref: "https://market-design-engine.dev/schemas/event-intelligence/shared.schema.json#/$defs/eventCandidateId",
                },
                { type: "null" },
            ],
        },
        conflict_type: {
            type: "string",
            enum: Object.values(ConflictType),
        },
        description: { type: "string", minLength: 1 },
        conflicting_fields: {
            type: "array",
            items: {
                $ref: "https://market-design-engine.dev/schemas/event-intelligence/shared.schema.json#/$defs/conflictDescriptor",
            },
        },
        related_observation_ids: {
            type: "array",
            items: {
                $ref: "https://market-design-engine.dev/schemas/common/primitives.schema.json#/$defs/sourceObservationId",
            },
        },
        confidence: {
            $ref: "https://market-design-engine.dev/schemas/common/primitives.schema.json#/$defs/score01",
        },
    },
};
//# sourceMappingURL=event-conflict.schema.js.map