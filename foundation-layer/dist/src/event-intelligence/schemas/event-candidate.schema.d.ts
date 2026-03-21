import { CandidateStatus } from "../candidates/enums/candidate-status.enum.js";
export declare const EVENT_CANDIDATE_SCHEMA_ID = "https://market-design-engine.dev/schemas/event-intelligence/event-candidate.schema.json";
export declare const eventCandidateSchema: {
    readonly $id: "https://market-design-engine.dev/schemas/event-intelligence/event-candidate.schema.json";
    readonly $schema: "https://json-schema.org/draft/2020-12/schema";
    readonly type: "object";
    readonly additionalProperties: false;
    readonly required: readonly ["id", "version", "observation_ids", "subject_candidate", "action_candidate", "object_candidate_nullable", "temporal_window_candidate", "jurisdiction_candidate_nullable", "category_candidate", "extraction_confidence", "evidence_spans", "candidate_status"];
    readonly properties: {
        readonly id: {
            readonly $ref: "https://market-design-engine.dev/schemas/event-intelligence/shared.schema.json#/$defs/eventCandidateId";
        };
        readonly version: {
            readonly type: "integer";
            readonly minimum: 1;
        };
        readonly observation_ids: {
            readonly type: "array";
            readonly minItems: 1;
            readonly items: {
                readonly $ref: "https://market-design-engine.dev/schemas/common/primitives.schema.json#/$defs/sourceObservationId";
            };
        };
        readonly subject_candidate: {
            readonly $ref: "https://market-design-engine.dev/schemas/event-intelligence/shared.schema.json#/$defs/subjectReference";
        };
        readonly action_candidate: {
            readonly $ref: "https://market-design-engine.dev/schemas/event-intelligence/shared.schema.json#/$defs/actionReference";
        };
        readonly object_candidate_nullable: {
            readonly oneOf: readonly [{
                readonly $ref: "https://market-design-engine.dev/schemas/event-intelligence/shared.schema.json#/$defs/objectReference";
            }, {
                readonly type: "null";
            }];
        };
        readonly temporal_window_candidate: {
            readonly $ref: "https://market-design-engine.dev/schemas/event-intelligence/shared.schema.json#/$defs/temporalWindow";
        };
        readonly jurisdiction_candidate_nullable: {
            readonly oneOf: readonly [{
                readonly $ref: "https://market-design-engine.dev/schemas/event-intelligence/shared.schema.json#/$defs/jurisdictionReference";
            }, {
                readonly type: "null";
            }];
        };
        readonly category_candidate: {
            readonly type: "string";
            readonly minLength: 1;
        };
        readonly extraction_confidence: {
            readonly $ref: "https://market-design-engine.dev/schemas/common/primitives.schema.json#/$defs/score01";
        };
        readonly evidence_spans: {
            readonly type: "array";
            readonly minItems: 1;
            readonly items: {
                readonly $ref: "https://market-design-engine.dev/schemas/event-intelligence/shared.schema.json#/$defs/evidenceSpan";
            };
        };
        readonly candidate_status: {
            readonly type: "string";
            readonly enum: CandidateStatus[];
        };
    };
};
//# sourceMappingURL=event-candidate.schema.d.ts.map