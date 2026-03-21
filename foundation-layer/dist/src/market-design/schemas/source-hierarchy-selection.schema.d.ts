import { SourceClass } from "../../sources/enums/source-class.enum.js";
export declare const SOURCE_HIERARCHY_SELECTION_SCHEMA_ID = "https://market-design-engine.dev/schemas/market-design/source-hierarchy-selection.schema.json";
export declare const sourceHierarchySelectionSchema: {
    readonly $id: "https://market-design-engine.dev/schemas/market-design/source-hierarchy-selection.schema.json";
    readonly $schema: "https://json-schema.org/draft/2020-12/schema";
    readonly type: "object";
    readonly additionalProperties: false;
    readonly required: readonly ["id", "canonical_event_id", "candidate_source_classes", "selected_source_priority", "source_selection_reason", "source_confidence"];
    readonly properties: {
        readonly id: {
            readonly type: "string";
            readonly pattern: "^shs_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$";
        };
        readonly canonical_event_id: {
            readonly $ref: "https://market-design-engine.dev/schemas/event-intelligence/shared.schema.json#/$defs/canonicalEventIntelligenceId";
        };
        readonly candidate_source_classes: {
            readonly type: "array";
            readonly minItems: 1;
            readonly uniqueItems: true;
            readonly items: {
                readonly type: "string";
                readonly enum: SourceClass[];
            };
        };
        readonly selected_source_priority: {
            readonly type: "array";
            readonly minItems: 1;
            readonly items: {
                readonly type: "object";
                readonly additionalProperties: false;
                readonly required: readonly ["source_class", "priority_rank"];
                readonly properties: {
                    readonly source_class: {
                        readonly type: "string";
                        readonly enum: SourceClass[];
                    };
                    readonly priority_rank: {
                        readonly type: "integer";
                        readonly minimum: 1;
                    };
                };
            };
        };
        readonly source_selection_reason: {
            readonly type: "string";
            readonly minLength: 1;
        };
        readonly source_confidence: {
            readonly $ref: "https://market-design-engine.dev/schemas/common/primitives.schema.json#/$defs/score01";
        };
    };
};
//# sourceMappingURL=source-hierarchy-selection.schema.d.ts.map