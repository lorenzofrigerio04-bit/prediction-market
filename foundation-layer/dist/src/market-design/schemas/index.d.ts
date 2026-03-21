import { contractSelectionSchema } from "./contract-selection.schema.js";
import { deadlineResolutionSchema } from "./deadline-resolution.schema.js";
import { marketDraftPipelineSchema } from "./market-draft-pipeline.schema.js";
import { opportunityAssessmentSchema } from "./opportunity-assessment.schema.js";
import { outcomeDefinitionSchema } from "./outcome-definition.schema.js";
import { outcomeGenerationResultSchema } from "./outcome-generation-result.schema.js";
import { preliminaryScorecardSchema } from "./preliminary-scorecard.schema.js";
import { sourceHierarchySelectionSchema } from "./source-hierarchy-selection.schema.js";
export declare const marketDesignSchemas: readonly [{
    readonly $id: "https://market-design-engine.dev/schemas/market-design/opportunity-assessment.schema.json";
    readonly $schema: "https://json-schema.org/draft/2020-12/schema";
    readonly type: "object";
    readonly additionalProperties: false;
    readonly required: readonly ["id", "version", "canonical_event_id", "opportunity_status", "relevance_score", "resolvability_score", "timeliness_score", "novelty_score", "audience_potential_score", "blocking_reasons", "recommendation_notes_nullable"];
    readonly properties: {
        readonly id: {
            readonly type: "string";
            readonly pattern: "^opp_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$";
        };
        readonly version: {
            readonly type: "integer";
            readonly minimum: 1;
        };
        readonly canonical_event_id: {
            readonly $ref: "https://market-design-engine.dev/schemas/event-intelligence/shared.schema.json#/$defs/canonicalEventIntelligenceId";
        };
        readonly opportunity_status: {
            readonly type: "string";
            readonly enum: import("../index.js").OpportunityStatus[];
        };
        readonly relevance_score: {
            readonly $ref: "https://market-design-engine.dev/schemas/common/primitives.schema.json#/$defs/score01";
        };
        readonly resolvability_score: {
            readonly $ref: "https://market-design-engine.dev/schemas/common/primitives.schema.json#/$defs/score01";
        };
        readonly timeliness_score: {
            readonly $ref: "https://market-design-engine.dev/schemas/common/primitives.schema.json#/$defs/score01";
        };
        readonly novelty_score: {
            readonly $ref: "https://market-design-engine.dev/schemas/common/primitives.schema.json#/$defs/score01";
        };
        readonly audience_potential_score: {
            readonly $ref: "https://market-design-engine.dev/schemas/common/primitives.schema.json#/$defs/score01";
        };
        readonly blocking_reasons: {
            readonly type: "array";
            readonly items: {
                readonly type: "string";
                readonly minLength: 1;
            };
        };
        readonly recommendation_notes_nullable: {
            readonly type: readonly ["string", "null"];
        };
    };
}, {
    readonly $id: "https://market-design-engine.dev/schemas/market-design/contract-selection.schema.json";
    readonly $schema: "https://json-schema.org/draft/2020-12/schema";
    readonly type: "object";
    readonly additionalProperties: false;
    readonly required: readonly ["id", "version", "canonical_event_id", "status", "selected_contract_type", "contract_type_reason", "selection_confidence", "rejected_contract_types", "selection_metadata"];
    readonly properties: {
        readonly id: {
            readonly type: "string";
            readonly pattern: "^csel_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$";
        };
        readonly version: {
            readonly type: "integer";
            readonly minimum: 1;
        };
        readonly canonical_event_id: {
            readonly $ref: "https://market-design-engine.dev/schemas/event-intelligence/shared.schema.json#/$defs/canonicalEventIntelligenceId";
        };
        readonly status: {
            readonly type: "string";
            readonly enum: import("../index.js").ContractSelectionStatus[];
        };
        readonly selected_contract_type: {
            readonly type: "string";
            readonly enum: readonly [import("../index.js").ContractType.BINARY, import("../index.js").ContractType.MULTI_OUTCOME, import("../index.js").ContractType.SCALAR_BRACKET];
        };
        readonly contract_type_reason: {
            readonly type: "string";
            readonly minLength: 1;
        };
        readonly selection_confidence: {
            readonly $ref: "https://market-design-engine.dev/schemas/common/primitives.schema.json#/$defs/score01";
        };
        readonly rejected_contract_types: {
            readonly type: "array";
            readonly uniqueItems: true;
            readonly items: {
                readonly type: "string";
                readonly enum: readonly [import("../index.js").ContractType.BINARY, import("../index.js").ContractType.MULTI_OUTCOME, import("../index.js").ContractType.SCALAR_BRACKET];
            };
        };
        readonly selection_metadata: {
            readonly type: "object";
            readonly additionalProperties: true;
        };
    };
}, {
    readonly $id: "https://market-design-engine.dev/schemas/market-design/outcome-definition.schema.json";
    readonly $schema: "https://json-schema.org/draft/2020-12/schema";
    readonly type: "object";
    readonly additionalProperties: false;
    readonly required: readonly ["id", "outcome_key", "display_label", "semantic_definition", "ordering_index_nullable", "range_definition_nullable", "active"];
    readonly properties: {
        readonly id: {
            readonly $ref: "https://market-design-engine.dev/schemas/common/primitives.schema.json#/$defs/outcomeId";
        };
        readonly outcome_key: {
            readonly type: "string";
            readonly pattern: "^[a-z0-9][a-z0-9_:-]{1,62}$";
        };
        readonly display_label: {
            readonly type: "string";
            readonly minLength: 1;
        };
        readonly semantic_definition: {
            readonly type: "string";
            readonly minLength: 1;
        };
        readonly ordering_index_nullable: {
            readonly oneOf: readonly [{
                readonly type: "integer";
                readonly minimum: 0;
            }, {
                readonly type: "null";
            }];
        };
        readonly range_definition_nullable: {
            readonly oneOf: readonly [{
                readonly type: "object";
                readonly additionalProperties: false;
                readonly required: readonly ["min_inclusive", "max_exclusive", "label_nullable"];
                readonly properties: {
                    readonly min_inclusive: {
                        readonly type: "number";
                    };
                    readonly max_exclusive: {
                        readonly type: "number";
                    };
                    readonly label_nullable: {
                        readonly type: readonly ["string", "null"];
                    };
                };
            }, {
                readonly type: "null";
            }];
        };
        readonly active: {
            readonly type: "boolean";
        };
    };
}, {
    readonly $id: "https://market-design-engine.dev/schemas/market-design/outcome-generation-result.schema.json";
    readonly $schema: "https://json-schema.org/draft/2020-12/schema";
    readonly type: "object";
    readonly additionalProperties: false;
    readonly required: readonly ["id", "contract_type", "outcomes", "exhaustiveness_policy", "exclusivity_policy", "generation_confidence", "validation_notes"];
    readonly properties: {
        readonly id: {
            readonly type: "string";
            readonly pattern: "^ogr_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$";
        };
        readonly contract_type: {
            readonly type: "string";
            readonly enum: import("../index.js").ContractType[];
        };
        readonly outcomes: {
            readonly type: "array";
            readonly minItems: 1;
            readonly items: {
                readonly $ref: "https://market-design-engine.dev/schemas/market-design/outcome-definition.schema.json";
            };
        };
        readonly exhaustiveness_policy: {
            readonly type: "string";
            readonly enum: import("../index.js").OutcomeExhaustivenessPolicy[];
        };
        readonly exclusivity_policy: {
            readonly type: "string";
            readonly enum: import("../index.js").OutcomeExclusivityPolicy[];
        };
        readonly generation_confidence: {
            readonly $ref: "https://market-design-engine.dev/schemas/common/primitives.schema.json#/$defs/score01";
        };
        readonly validation_notes: {
            readonly type: "array";
            readonly items: {
                readonly type: "string";
            };
        };
    };
}, {
    readonly $id: "https://market-design-engine.dev/schemas/market-design/deadline-resolution.schema.json";
    readonly $schema: "https://json-schema.org/draft/2020-12/schema";
    readonly type: "object";
    readonly additionalProperties: false;
    readonly required: readonly ["id", "canonical_event_id", "event_deadline", "market_close_time", "resolution_cutoff_nullable", "timezone", "deadline_basis_type", "deadline_basis_reference", "confidence", "warnings"];
    readonly properties: {
        readonly id: {
            readonly type: "string";
            readonly pattern: "^dlr_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$";
        };
        readonly canonical_event_id: {
            readonly $ref: "https://market-design-engine.dev/schemas/event-intelligence/shared.schema.json#/$defs/canonicalEventIntelligenceId";
        };
        readonly event_deadline: {
            readonly $ref: "https://market-design-engine.dev/schemas/value-objects/timestamp.schema.json";
        };
        readonly market_close_time: {
            readonly $ref: "https://market-design-engine.dev/schemas/value-objects/timestamp.schema.json";
        };
        readonly resolution_cutoff_nullable: {
            readonly oneOf: readonly [{
                readonly $ref: "https://market-design-engine.dev/schemas/value-objects/timestamp.schema.json";
            }, {
                readonly type: "null";
            }];
        };
        readonly timezone: {
            readonly type: "string";
            readonly minLength: 1;
        };
        readonly deadline_basis_type: {
            readonly type: "string";
            readonly enum: import("../index.js").DeadlineBasisType[];
        };
        readonly deadline_basis_reference: {
            readonly type: "string";
            readonly minLength: 1;
        };
        readonly confidence: {
            readonly $ref: "https://market-design-engine.dev/schemas/common/primitives.schema.json#/$defs/score01";
        };
        readonly warnings: {
            readonly type: "array";
            readonly items: {
                readonly type: "string";
            };
        };
    };
}, {
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
                readonly enum: import("../../index.js").SourceClass[];
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
                        readonly enum: import("../../index.js").SourceClass[];
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
}, {
    readonly $id: "https://market-design-engine.dev/schemas/market-design/preliminary-scorecard.schema.json";
    readonly $schema: "https://json-schema.org/draft/2020-12/schema";
    readonly type: "object";
    readonly additionalProperties: false;
    readonly required: readonly ["clarity_score", "resolvability_score", "novelty_score", "liquidity_potential_score", "ambiguity_risk_score", "duplicate_risk_score", "editorial_value_score", "final_publish_score"];
    readonly properties: {
        readonly clarity_score: {
            $ref: string;
        };
        readonly resolvability_score: {
            $ref: string;
        };
        readonly novelty_score: {
            $ref: string;
        };
        readonly liquidity_potential_score: {
            $ref: string;
        };
        readonly ambiguity_risk_score: {
            $ref: string;
        };
        readonly duplicate_risk_score: {
            $ref: string;
        };
        readonly editorial_value_score: {
            $ref: string;
        };
        readonly final_publish_score: {
            $ref: string;
        };
    };
}, {
    readonly $id: "https://market-design-engine.dev/schemas/market-design/market-draft-pipeline.schema.json";
    readonly $schema: "https://json-schema.org/draft/2020-12/schema";
    readonly type: "object";
    readonly additionalProperties: false;
    readonly required: readonly ["canonical_event", "opportunity_assessment", "contract_selection", "outcome_generation_result", "deadline_resolution", "source_hierarchy_selection", "preliminary_scorecard", "foundation_candidate_market"];
    readonly properties: {
        readonly canonical_event: {
            readonly $ref: "https://market-design-engine.dev/schemas/event-intelligence/canonical-event.schema.json";
        };
        readonly opportunity_assessment: {
            readonly $ref: "https://market-design-engine.dev/schemas/market-design/opportunity-assessment.schema.json";
        };
        readonly contract_selection: {
            readonly $ref: "https://market-design-engine.dev/schemas/market-design/contract-selection.schema.json";
        };
        readonly outcome_generation_result: {
            readonly $ref: "https://market-design-engine.dev/schemas/market-design/outcome-generation-result.schema.json";
        };
        readonly deadline_resolution: {
            readonly $ref: "https://market-design-engine.dev/schemas/market-design/deadline-resolution.schema.json";
        };
        readonly source_hierarchy_selection: {
            readonly $ref: "https://market-design-engine.dev/schemas/market-design/source-hierarchy-selection.schema.json";
        };
        readonly preliminary_scorecard: {
            readonly $ref: "https://market-design-engine.dev/schemas/market-design/preliminary-scorecard.schema.json";
        };
        readonly foundation_candidate_market: {
            readonly $ref: "https://market-design-engine.dev/schemas/entities/candidate-market.schema.json";
        };
    };
}];
export { opportunityAssessmentSchema, contractSelectionSchema, outcomeDefinitionSchema, outcomeGenerationResultSchema, deadlineResolutionSchema, sourceHierarchySelectionSchema, preliminaryScorecardSchema, marketDraftPipelineSchema, };
//# sourceMappingURL=index.d.ts.map