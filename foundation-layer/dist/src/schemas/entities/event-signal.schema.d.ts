import { EventCategory } from "../../enums/event-category.enum.js";
import { EventPriority } from "../../enums/event-priority.enum.js";
import { EventStatus } from "../../enums/event-status.enum.js";
export declare const EVENT_SIGNAL_SCHEMA_ID = "https://market-design-engine.dev/schemas/entities/event-signal.schema.json";
export declare const eventSignalSchema: {
    readonly $id: "https://market-design-engine.dev/schemas/entities/event-signal.schema.json";
    readonly $schema: "https://json-schema.org/draft/2020-12/schema";
    readonly type: "object";
    readonly additionalProperties: false;
    readonly required: readonly ["id", "sourceRecordIds", "rawHeadline", "rawSummary", "eventCategory", "eventPriority", "occurredAt", "detectedAt", "jurisdictions", "involvedEntities", "tags", "confidenceScore", "status", "entityVersion"];
    readonly properties: {
        readonly id: {
            readonly $ref: "https://market-design-engine.dev/schemas/common/primitives.schema.json#/$defs/eventId";
        };
        readonly sourceRecordIds: {
            readonly type: "array";
            readonly minItems: 1;
            readonly items: {
                readonly $ref: "https://market-design-engine.dev/schemas/common/primitives.schema.json#/$defs/sourceId";
            };
        };
        readonly rawHeadline: {
            readonly $ref: "https://market-design-engine.dev/schemas/value-objects/title.schema.json";
        };
        readonly rawSummary: {
            readonly type: readonly ["string", "null"];
        };
        readonly eventCategory: {
            readonly type: "string";
            readonly enum: EventCategory[];
        };
        readonly eventPriority: {
            readonly type: "string";
            readonly enum: EventPriority[];
        };
        readonly occurredAt: {
            readonly oneOf: readonly [{
                readonly $ref: "https://market-design-engine.dev/schemas/value-objects/timestamp.schema.json";
            }, {
                readonly type: "null";
            }];
        };
        readonly detectedAt: {
            readonly $ref: "https://market-design-engine.dev/schemas/value-objects/timestamp.schema.json";
        };
        readonly jurisdictions: {
            readonly type: "array";
            readonly items: {
                readonly type: "string";
            };
        };
        readonly involvedEntities: {
            readonly type: "array";
            readonly items: {
                readonly type: "string";
            };
        };
        readonly tags: {
            readonly type: "array";
            readonly items: {
                readonly $ref: "https://market-design-engine.dev/schemas/common/primitives.schema.json#/$defs/tag";
            };
        };
        readonly confidenceScore: {
            readonly $ref: "https://market-design-engine.dev/schemas/value-objects/confidence-score.schema.json";
        };
        readonly status: {
            readonly type: "string";
            readonly enum: EventStatus[];
        };
        readonly entityVersion: {
            readonly type: "integer";
            readonly minimum: 1;
        };
    };
};
//# sourceMappingURL=event-signal.schema.d.ts.map