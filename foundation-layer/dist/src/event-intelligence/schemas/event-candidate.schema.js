import { CandidateStatus } from "../candidates/enums/candidate-status.enum.js";
export const EVENT_CANDIDATE_SCHEMA_ID = "https://market-design-engine.dev/schemas/event-intelligence/event-candidate.schema.json";
export const eventCandidateSchema = {
    $id: EVENT_CANDIDATE_SCHEMA_ID,
    $schema: "https://json-schema.org/draft/2020-12/schema",
    type: "object",
    additionalProperties: false,
    required: [
        "id",
        "version",
        "observation_ids",
        "subject_candidate",
        "action_candidate",
        "object_candidate_nullable",
        "temporal_window_candidate",
        "jurisdiction_candidate_nullable",
        "category_candidate",
        "extraction_confidence",
        "evidence_spans",
        "candidate_status",
    ],
    properties: {
        id: {
            $ref: "https://market-design-engine.dev/schemas/event-intelligence/shared.schema.json#/$defs/eventCandidateId",
        },
        version: { type: "integer", minimum: 1 },
        observation_ids: {
            type: "array",
            minItems: 1,
            items: {
                $ref: "https://market-design-engine.dev/schemas/common/primitives.schema.json#/$defs/sourceObservationId",
            },
        },
        subject_candidate: {
            $ref: "https://market-design-engine.dev/schemas/event-intelligence/shared.schema.json#/$defs/subjectReference",
        },
        action_candidate: {
            $ref: "https://market-design-engine.dev/schemas/event-intelligence/shared.schema.json#/$defs/actionReference",
        },
        object_candidate_nullable: {
            oneOf: [
                {
                    $ref: "https://market-design-engine.dev/schemas/event-intelligence/shared.schema.json#/$defs/objectReference",
                },
                { type: "null" },
            ],
        },
        temporal_window_candidate: {
            $ref: "https://market-design-engine.dev/schemas/event-intelligence/shared.schema.json#/$defs/temporalWindow",
        },
        jurisdiction_candidate_nullable: {
            oneOf: [
                {
                    $ref: "https://market-design-engine.dev/schemas/event-intelligence/shared.schema.json#/$defs/jurisdictionReference",
                },
                { type: "null" },
            ],
        },
        category_candidate: { type: "string", minLength: 1 },
        extraction_confidence: {
            $ref: "https://market-design-engine.dev/schemas/common/primitives.schema.json#/$defs/score01",
        },
        evidence_spans: {
            type: "array",
            minItems: 1,
            items: {
                $ref: "https://market-design-engine.dev/schemas/event-intelligence/shared.schema.json#/$defs/evidenceSpan",
            },
        },
        candidate_status: {
            type: "string",
            enum: Object.values(CandidateStatus),
        },
    },
};
//# sourceMappingURL=event-candidate.schema.js.map