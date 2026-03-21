import { EventCategory } from "../../enums/event-category.enum.js";
import { EventPriority } from "../../enums/event-priority.enum.js";
import { EventStatus } from "../../enums/event-status.enum.js";
export const CANONICAL_EVENT_SCHEMA_ID = "https://market-design-engine.dev/schemas/entities/canonical-event.schema.json";
export const canonicalEventSchema = {
    $id: CANONICAL_EVENT_SCHEMA_ID,
    $schema: "https://json-schema.org/draft/2020-12/schema",
    type: "object",
    additionalProperties: false,
    required: [
        "id",
        "title",
        "slug",
        "description",
        "category",
        "priority",
        "status",
        "occurredAt",
        "firstObservedAt",
        "lastUpdatedAt",
        "jurisdictions",
        "involvedEntities",
        "supportingSourceRecordIds",
        "supportingSignalIds",
        "tags",
        "confidenceScore",
        "resolutionWindow",
        "entityVersion",
    ],
    properties: {
        id: {
            $ref: "https://market-design-engine.dev/schemas/common/primitives.schema.json#/$defs/eventId",
        },
        title: { $ref: "https://market-design-engine.dev/schemas/value-objects/title.schema.json" },
        slug: { $ref: "https://market-design-engine.dev/schemas/value-objects/slug.schema.json" },
        description: { type: "string", minLength: 1 },
        category: { type: "string", enum: Object.values(EventCategory) },
        priority: { type: "string", enum: Object.values(EventPriority) },
        status: { type: "string", enum: Object.values(EventStatus) },
        occurredAt: {
            oneOf: [
                { $ref: "https://market-design-engine.dev/schemas/value-objects/timestamp.schema.json" },
                { type: "null" },
            ],
        },
        firstObservedAt: { $ref: "https://market-design-engine.dev/schemas/value-objects/timestamp.schema.json" },
        lastUpdatedAt: { $ref: "https://market-design-engine.dev/schemas/value-objects/timestamp.schema.json" },
        jurisdictions: { type: "array", items: { type: "string" } },
        involvedEntities: { type: "array", items: { type: "string" } },
        supportingSourceRecordIds: {
            type: "array",
            items: {
                $ref: "https://market-design-engine.dev/schemas/common/primitives.schema.json#/$defs/sourceId",
            },
        },
        supportingSignalIds: {
            type: "array",
            items: {
                $ref: "https://market-design-engine.dev/schemas/common/primitives.schema.json#/$defs/eventId",
            },
        },
        tags: {
            type: "array",
            items: {
                $ref: "https://market-design-engine.dev/schemas/common/primitives.schema.json#/$defs/tag",
            },
        },
        confidenceScore: { $ref: "https://market-design-engine.dev/schemas/value-objects/confidence-score.schema.json" },
        resolutionWindow: {
            oneOf: [
                {
                    type: "object",
                    additionalProperties: false,
                    required: ["openAt", "closeAt"],
                    properties: {
                        openAt: { $ref: "https://market-design-engine.dev/schemas/value-objects/timestamp.schema.json" },
                        closeAt: { $ref: "https://market-design-engine.dev/schemas/value-objects/timestamp.schema.json" },
                    },
                },
                { type: "null" },
            ],
        },
        entityVersion: { type: "integer", minimum: 1 },
    },
};
//# sourceMappingURL=canonical-event.schema.js.map