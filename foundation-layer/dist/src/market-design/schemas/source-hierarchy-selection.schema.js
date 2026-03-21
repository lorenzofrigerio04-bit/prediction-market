import { SourceClass } from "../../sources/enums/source-class.enum.js";
export const SOURCE_HIERARCHY_SELECTION_SCHEMA_ID = "https://market-design-engine.dev/schemas/market-design/source-hierarchy-selection.schema.json";
export const sourceHierarchySelectionSchema = {
    $id: SOURCE_HIERARCHY_SELECTION_SCHEMA_ID,
    $schema: "https://json-schema.org/draft/2020-12/schema",
    type: "object",
    additionalProperties: false,
    required: [
        "id",
        "canonical_event_id",
        "candidate_source_classes",
        "selected_source_priority",
        "source_selection_reason",
        "source_confidence",
    ],
    properties: {
        id: { type: "string", pattern: "^shs_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$" },
        canonical_event_id: {
            $ref: "https://market-design-engine.dev/schemas/event-intelligence/shared.schema.json#/$defs/canonicalEventIntelligenceId",
        },
        candidate_source_classes: {
            type: "array",
            minItems: 1,
            uniqueItems: true,
            items: { type: "string", enum: Object.values(SourceClass) },
        },
        selected_source_priority: {
            type: "array",
            minItems: 1,
            items: {
                type: "object",
                additionalProperties: false,
                required: ["source_class", "priority_rank"],
                properties: {
                    source_class: { type: "string", enum: Object.values(SourceClass) },
                    priority_rank: { type: "integer", minimum: 1 },
                },
            },
        },
        source_selection_reason: { type: "string", minLength: 1 },
        source_confidence: {
            $ref: "https://market-design-engine.dev/schemas/common/primitives.schema.json#/$defs/score01",
        },
    },
};
//# sourceMappingURL=source-hierarchy-selection.schema.js.map