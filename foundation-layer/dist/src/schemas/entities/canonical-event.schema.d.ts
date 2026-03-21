import { EventCategory } from "../../enums/event-category.enum.js";
import { EventPriority } from "../../enums/event-priority.enum.js";
import { EventStatus } from "../../enums/event-status.enum.js";
export declare const CANONICAL_EVENT_SCHEMA_ID = "https://market-design-engine.dev/schemas/entities/canonical-event.schema.json";
export declare const canonicalEventSchema: {
    readonly $id: "https://market-design-engine.dev/schemas/entities/canonical-event.schema.json";
    readonly $schema: "https://json-schema.org/draft/2020-12/schema";
    readonly type: "object";
    readonly additionalProperties: false;
    readonly required: readonly ["id", "title", "slug", "description", "category", "priority", "status", "occurredAt", "firstObservedAt", "lastUpdatedAt", "jurisdictions", "involvedEntities", "supportingSourceRecordIds", "supportingSignalIds", "tags", "confidenceScore", "resolutionWindow", "entityVersion"];
    readonly properties: {
        readonly id: {
            readonly $ref: "https://market-design-engine.dev/schemas/common/primitives.schema.json#/$defs/eventId";
        };
        readonly title: {
            readonly $ref: "https://market-design-engine.dev/schemas/value-objects/title.schema.json";
        };
        readonly slug: {
            readonly $ref: "https://market-design-engine.dev/schemas/value-objects/slug.schema.json";
        };
        readonly description: {
            readonly type: "string";
            readonly minLength: 1;
        };
        readonly category: {
            readonly type: "string";
            readonly enum: EventCategory[];
        };
        readonly priority: {
            readonly type: "string";
            readonly enum: EventPriority[];
        };
        readonly status: {
            readonly type: "string";
            readonly enum: EventStatus[];
        };
        readonly occurredAt: {
            readonly oneOf: readonly [{
                readonly $ref: "https://market-design-engine.dev/schemas/value-objects/timestamp.schema.json";
            }, {
                readonly type: "null";
            }];
        };
        readonly firstObservedAt: {
            readonly $ref: "https://market-design-engine.dev/schemas/value-objects/timestamp.schema.json";
        };
        readonly lastUpdatedAt: {
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
        readonly supportingSourceRecordIds: {
            readonly type: "array";
            readonly items: {
                readonly $ref: "https://market-design-engine.dev/schemas/common/primitives.schema.json#/$defs/sourceId";
            };
        };
        readonly supportingSignalIds: {
            readonly type: "array";
            readonly items: {
                readonly $ref: "https://market-design-engine.dev/schemas/common/primitives.schema.json#/$defs/eventId";
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
        readonly resolutionWindow: {
            readonly oneOf: readonly [{
                readonly type: "object";
                readonly additionalProperties: false;
                readonly required: readonly ["openAt", "closeAt"];
                readonly properties: {
                    readonly openAt: {
                        readonly $ref: "https://market-design-engine.dev/schemas/value-objects/timestamp.schema.json";
                    };
                    readonly closeAt: {
                        readonly $ref: "https://market-design-engine.dev/schemas/value-objects/timestamp.schema.json";
                    };
                };
            }, {
                readonly type: "null";
            }];
        };
        readonly entityVersion: {
            readonly type: "integer";
            readonly minimum: 1;
        };
    };
};
//# sourceMappingURL=canonical-event.schema.d.ts.map