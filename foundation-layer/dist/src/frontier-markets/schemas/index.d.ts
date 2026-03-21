import { raceTargetSchema } from "./race-target.schema.js";
import { raceMarketDefinitionSchema } from "./race-market-definition.schema.js";
import { sequenceTargetSchema } from "./sequence-target.schema.js";
import { sequenceMarketDefinitionSchema } from "./sequence-market-definition.schema.js";
import { triggerConditionSchema } from "./trigger-condition.schema.js";
import { conditionalMarketDefinitionSchema } from "./conditional-market-definition.schema.js";
import { dependencyLinkSchema } from "./dependency-link.schema.js";
import { advancedOutcomeGenerationResultSchema } from "./advanced-outcome-generation-result.schema.js";
import { advancedContractValidationReportSchema } from "./advanced-contract-validation-report.schema.js";
import { advancedMarketCompatibilityResultSchema } from "./advanced-market-compatibility-result.schema.js";
export declare const frontierMarketSchemas: readonly [{
    readonly $id: "https://market-design-engine.dev/schemas/frontier-markets/race-target.schema.json";
    readonly $schema: "https://json-schema.org/draft/2020-12/schema";
    readonly type: "object";
    readonly additionalProperties: false;
    readonly required: readonly ["target_key", "display_label", "semantic_definition", "active", "ordering_priority_nullable"];
    readonly properties: {
        readonly target_key: {
            readonly type: "string";
            readonly pattern: "^[a-z][a-z0-9_]{1,31}$";
        };
        readonly display_label: {
            readonly type: "string";
            readonly minLength: 1;
        };
        readonly semantic_definition: {
            readonly type: "string";
            readonly minLength: 1;
        };
        readonly active: {
            readonly type: "boolean";
        };
        readonly ordering_priority_nullable: {
            readonly anyOf: readonly [{
                readonly type: "null";
            }, {
                readonly type: "integer";
                readonly minimum: 1;
            }];
        };
    };
}, {
    readonly $id: "https://market-design-engine.dev/schemas/frontier-markets/race-market-definition.schema.json";
    readonly $schema: "https://json-schema.org/draft/2020-12/schema";
    readonly type: "object";
    readonly additionalProperties: false;
    readonly required: readonly ["id", "version", "parent_canonical_event_id_nullable", "race_targets", "winning_condition", "deadline_resolution", "source_hierarchy_selection", "race_validation_status", "metadata"];
    readonly properties: {
        readonly id: {
            readonly type: "string";
            readonly pattern: "^frc_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$";
        };
        readonly version: {
            readonly type: "integer";
            readonly minimum: 1;
        };
        readonly parent_canonical_event_id_nullable: {
            readonly anyOf: readonly [{
                readonly type: "null";
            }, {
                readonly type: "string";
                readonly pattern: "^cevt_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$";
            }];
        };
        readonly race_targets: {
            readonly type: "array";
            readonly minItems: 2;
            readonly items: {
                readonly $ref: "https://market-design-engine.dev/schemas/frontier-markets/race-target.schema.json";
            };
        };
        readonly winning_condition: {
            readonly type: "object";
            readonly additionalProperties: false;
            readonly required: readonly ["type", "tie_break_policy"];
            readonly properties: {
                readonly type: {
                    readonly type: "string";
                    readonly enum: import("../index.js").WinningConditionType.FIRST_TO_OCCUR[];
                };
                readonly tie_break_policy: {
                    readonly type: "string";
                    readonly enum: readonly ["none", "lowest_ordering_priority"];
                };
            };
        };
        readonly deadline_resolution: {
            readonly $ref: "https://market-design-engine.dev/schemas/market-design/deadline-resolution.schema.json";
        };
        readonly source_hierarchy_selection: {
            readonly $ref: "https://market-design-engine.dev/schemas/market-design/source-hierarchy-selection.schema.json";
        };
        readonly race_validation_status: {
            readonly type: "string";
            readonly enum: import("../index.js").RaceValidationStatus[];
        };
        readonly metadata: {
            readonly type: "object";
            readonly additionalProperties: {
                readonly type: readonly ["string", "number", "boolean", "null"];
            };
        };
    };
}, {
    readonly $id: "https://market-design-engine.dev/schemas/frontier-markets/sequence-target.schema.json";
    readonly $schema: "https://json-schema.org/draft/2020-12/schema";
    readonly type: "object";
    readonly additionalProperties: false;
    readonly required: readonly ["target_key", "canonical_event_ref_or_predicate", "display_label", "semantic_definition", "required"];
    readonly properties: {
        readonly target_key: {
            readonly type: "string";
            readonly pattern: "^[a-z][a-z0-9_]{1,31}$";
        };
        readonly canonical_event_ref_or_predicate: {
            readonly oneOf: readonly [{
                readonly type: "object";
                readonly additionalProperties: false;
                readonly required: readonly ["kind", "canonical_event_id"];
                readonly properties: {
                    readonly kind: {
                        readonly const: "canonical_event_ref";
                    };
                    readonly canonical_event_id: {
                        readonly type: "string";
                        readonly pattern: "^cevt_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$";
                    };
                };
            }, {
                readonly type: "object";
                readonly additionalProperties: false;
                readonly required: readonly ["kind", "predicate_key", "predicate_params"];
                readonly properties: {
                    readonly kind: {
                        readonly const: "deterministic_predicate";
                    };
                    readonly predicate_key: {
                        readonly type: "string";
                        readonly minLength: 1;
                    };
                    readonly predicate_params: {
                        readonly type: "object";
                        readonly additionalProperties: {
                            readonly type: readonly ["string", "number", "boolean"];
                        };
                    };
                };
            }];
        };
        readonly display_label: {
            readonly type: "string";
            readonly minLength: 1;
        };
        readonly semantic_definition: {
            readonly type: "string";
            readonly minLength: 1;
        };
        readonly required: {
            readonly type: "boolean";
        };
    };
}, {
    readonly $id: "https://market-design-engine.dev/schemas/frontier-markets/sequence-market-definition.schema.json";
    readonly $schema: "https://json-schema.org/draft/2020-12/schema";
    readonly type: "object";
    readonly additionalProperties: false;
    readonly required: readonly ["id", "version", "parent_event_graph_context_id", "sequence_targets", "required_order_policy", "completion_policy", "deadline_resolution", "sequence_validation_status", "metadata"];
    readonly properties: {
        readonly id: {
            readonly type: "string";
            readonly pattern: "^fse_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$";
        };
        readonly version: {
            readonly type: "integer";
            readonly minimum: 1;
        };
        readonly parent_event_graph_context_id: {
            readonly type: "string";
            readonly pattern: "^egnd_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$";
        };
        readonly sequence_targets: {
            readonly type: "array";
            readonly minItems: 2;
            readonly items: {
                readonly $ref: "https://market-design-engine.dev/schemas/frontier-markets/sequence-target.schema.json";
            };
        };
        readonly required_order_policy: {
            readonly type: "string";
            readonly enum: import("../index.js").RequiredOrderPolicy[];
        };
        readonly completion_policy: {
            readonly type: "string";
            readonly enum: import("../index.js").CompletionPolicy[];
        };
        readonly deadline_resolution: {
            readonly $ref: "https://market-design-engine.dev/schemas/market-design/deadline-resolution.schema.json";
        };
        readonly sequence_validation_status: {
            readonly type: "string";
            readonly enum: import("../index.js").SequenceValidationStatus[];
        };
        readonly metadata: {
            readonly type: "object";
            readonly additionalProperties: {
                readonly type: readonly ["string", "number", "boolean", "null"];
            };
        };
    };
}, {
    readonly $id: "https://market-design-engine.dev/schemas/frontier-markets/trigger-condition.schema.json";
    readonly $schema: "https://json-schema.org/draft/2020-12/schema";
    readonly type: "object";
    readonly additionalProperties: false;
    readonly required: readonly ["trigger_type", "upstream_event_ref_or_market_ref", "triggering_outcome", "trigger_deadline_nullable", "trigger_policy_notes"];
    readonly properties: {
        readonly trigger_type: {
            readonly type: "string";
            readonly enum: import("../index.js").TriggerType[];
        };
        readonly upstream_event_ref_or_market_ref: {
            readonly oneOf: readonly [{
                readonly type: "object";
                readonly additionalProperties: false;
                readonly required: readonly ["kind", "event_id"];
                readonly properties: {
                    readonly kind: {
                        readonly const: "upstream_event";
                    };
                    readonly event_id: {
                        readonly type: "string";
                        readonly pattern: "^cevt_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$";
                    };
                };
            }, {
                readonly type: "object";
                readonly additionalProperties: false;
                readonly required: readonly ["kind", "market_id"];
                readonly properties: {
                    readonly kind: {
                        readonly const: "upstream_market";
                    };
                    readonly market_id: {
                        readonly type: "string";
                        readonly minLength: 1;
                    };
                };
            }];
        };
        readonly triggering_outcome: {
            readonly type: "string";
            readonly minLength: 1;
        };
        readonly trigger_deadline_nullable: {
            readonly anyOf: readonly [{
                readonly type: "null";
            }, {
                readonly $ref: "https://market-design-engine.dev/schemas/value-objects/timestamp.schema.json";
            }];
        };
        readonly trigger_policy_notes: {
            readonly type: "array";
            readonly items: {
                readonly type: "string";
                readonly minLength: 1;
            };
        };
    };
}, {
    readonly $id: "https://market-design-engine.dev/schemas/frontier-markets/conditional-market-definition.schema.json";
    readonly $schema: "https://json-schema.org/draft/2020-12/schema";
    readonly type: "object";
    readonly additionalProperties: false;
    readonly required: readonly ["id", "version", "trigger_condition", "dependent_contract_type", "dependent_outcome_schema", "activation_policy", "invalidation_policy", "deadline_resolution", "conditional_validation_status", "metadata"];
    readonly properties: {
        readonly id: {
            readonly type: "string";
            readonly pattern: "^fco_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$";
        };
        readonly version: {
            readonly type: "integer";
            readonly minimum: 1;
        };
        readonly trigger_condition: {
            readonly $ref: "https://market-design-engine.dev/schemas/frontier-markets/trigger-condition.schema.json";
        };
        readonly dependent_contract_type: {
            readonly type: "string";
            readonly enum: import("../../index.js").ContractType[];
        };
        readonly dependent_outcome_schema: {
            readonly type: "object";
            readonly additionalProperties: false;
            readonly required: readonly ["schema_version", "required_outcome_keys"];
            readonly properties: {
                readonly schema_version: {
                    readonly type: "string";
                    readonly minLength: 1;
                };
                readonly required_outcome_keys: {
                    readonly type: "array";
                    readonly minItems: 1;
                    readonly items: {
                        readonly type: "string";
                        readonly minLength: 1;
                    };
                };
            };
        };
        readonly activation_policy: {
            readonly type: "string";
            readonly enum: import("../index.js").ActivationPolicy.EXPLICIT_TRIGGER_ONLY[];
        };
        readonly invalidation_policy: {
            readonly type: "string";
            readonly enum: import("../index.js").InvalidationPolicy[];
        };
        readonly deadline_resolution: {
            readonly $ref: "https://market-design-engine.dev/schemas/market-design/deadline-resolution.schema.json";
        };
        readonly conditional_validation_status: {
            readonly type: "string";
            readonly enum: import("../index.js").ConditionalValidationStatus[];
        };
        readonly metadata: {
            readonly type: "object";
            readonly additionalProperties: {
                readonly type: readonly ["string", "number", "boolean", "null"];
            };
        };
    };
}, {
    readonly $id: "https://market-design-engine.dev/schemas/frontier-markets/dependency-link.schema.json";
    readonly $schema: "https://json-schema.org/draft/2020-12/schema";
    readonly type: "object";
    readonly additionalProperties: false;
    readonly required: readonly ["id", "source_ref", "target_ref", "dependency_type", "dependency_strength", "blocking"];
    readonly properties: {
        readonly id: {
            readonly type: "string";
            readonly pattern: "^fdp_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$";
        };
        readonly source_ref: {
            readonly type: "object";
            readonly additionalProperties: false;
            readonly required: readonly ["ref_type", "ref_id"];
            readonly properties: {
                readonly ref_type: {
                    readonly type: "string";
                    readonly enum: readonly ["event", "market", "contract"];
                };
                readonly ref_id: {
                    readonly type: "string";
                    readonly minLength: 1;
                };
            };
        };
        readonly target_ref: {
            readonly type: "object";
            readonly additionalProperties: false;
            readonly required: readonly ["ref_type", "ref_id"];
            readonly properties: {
                readonly ref_type: {
                    readonly type: "string";
                    readonly enum: readonly ["event", "market", "contract"];
                };
                readonly ref_id: {
                    readonly type: "string";
                    readonly minLength: 1;
                };
            };
        };
        readonly dependency_type: {
            readonly type: "string";
            readonly enum: import("../index.js").DependencyType[];
        };
        readonly dependency_strength: {
            readonly type: "string";
            readonly enum: import("../index.js").DependencyStrength[];
        };
        readonly blocking: {
            readonly type: "boolean";
        };
    };
}, {
    readonly $id: "https://market-design-engine.dev/schemas/frontier-markets/advanced-outcome-generation-result.schema.json";
    readonly $schema: "https://json-schema.org/draft/2020-12/schema";
    readonly type: "object";
    readonly additionalProperties: false;
    readonly required: readonly ["id", "contract_type", "generated_outcomes", "validation_notes", "exhaustiveness_policy", "exclusivity_policy", "generation_confidence"];
    readonly properties: {
        readonly id: {
            readonly type: "string";
            readonly pattern: "^fgr_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$";
        };
        readonly contract_type: {
            readonly type: "string";
            readonly enum: readonly [import("../../index.js").ContractType.RACE, import("../../index.js").ContractType.SEQUENCE, import("../../index.js").ContractType.CONDITIONAL];
        };
        readonly generated_outcomes: {
            readonly type: "array";
            readonly minItems: 1;
            readonly items: {
                readonly $ref: "https://market-design-engine.dev/schemas/market-design/outcome-definition.schema.json";
            };
        };
        readonly validation_notes: {
            readonly type: "array";
            readonly items: {
                readonly type: "string";
                readonly minLength: 1;
            };
        };
        readonly exhaustiveness_policy: {
            readonly type: "string";
            readonly enum: import("../../index.js").OutcomeExhaustivenessPolicy[];
        };
        readonly exclusivity_policy: {
            readonly type: "string";
            readonly enum: import("../../index.js").OutcomeExclusivityPolicy[];
        };
        readonly generation_confidence: {
            readonly $ref: "https://market-design-engine.dev/schemas/common/primitives.schema.json#/$defs/score01";
        };
    };
}, {
    readonly $id: "https://market-design-engine.dev/schemas/frontier-markets/advanced-contract-validation-report.schema.json";
    readonly $schema: "https://json-schema.org/draft/2020-12/schema";
    readonly type: "object";
    readonly additionalProperties: false;
    readonly required: readonly ["id", "contract_type", "validation_status", "blocking_issues", "warnings", "checked_invariants", "compatibility_notes"];
    readonly properties: {
        readonly id: {
            readonly type: "string";
            readonly pattern: "^fvr_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$";
        };
        readonly contract_type: {
            readonly type: "string";
            readonly enum: readonly [import("../../index.js").ContractType.RACE, import("../../index.js").ContractType.SEQUENCE, import("../../index.js").ContractType.CONDITIONAL];
        };
        readonly validation_status: {
            readonly type: "string";
            readonly enum: import("../index.js").AdvancedValidationStatus[];
        };
        readonly blocking_issues: {
            readonly type: "array";
            readonly items: {
                readonly type: "object";
                readonly additionalProperties: false;
                readonly required: readonly ["code", "message", "path"];
                readonly properties: {
                    readonly code: {
                        readonly type: "string";
                        readonly minLength: 1;
                    };
                    readonly message: {
                        readonly type: "string";
                        readonly minLength: 1;
                    };
                    readonly path: {
                        readonly type: "string";
                        readonly minLength: 1;
                    };
                };
            };
        };
        readonly warnings: {
            readonly type: "array";
            readonly items: {
                readonly type: "object";
                readonly additionalProperties: false;
                readonly required: readonly ["code", "message", "path"];
                readonly properties: {
                    readonly code: {
                        readonly type: "string";
                        readonly minLength: 1;
                    };
                    readonly message: {
                        readonly type: "string";
                        readonly minLength: 1;
                    };
                    readonly path: {
                        readonly type: "string";
                        readonly minLength: 1;
                    };
                };
            };
        };
        readonly checked_invariants: {
            readonly type: "array";
            readonly minItems: 1;
            readonly items: {
                readonly type: "object";
                readonly additionalProperties: false;
                readonly required: readonly ["code", "passed", "message"];
                readonly properties: {
                    readonly code: {
                        readonly type: "string";
                        readonly minLength: 1;
                    };
                    readonly passed: {
                        readonly type: "boolean";
                    };
                    readonly message: {
                        readonly type: "string";
                        readonly minLength: 1;
                    };
                };
            };
        };
        readonly compatibility_notes: {
            readonly type: "array";
            readonly items: {
                readonly type: "string";
                readonly minLength: 1;
            };
        };
    };
}, {
    readonly $id: "https://market-design-engine.dev/schemas/frontier-markets/advanced-market-compatibility-result.schema.json";
    readonly $schema: "https://json-schema.org/draft/2020-12/schema";
    readonly type: "object";
    readonly additionalProperties: false;
    readonly required: readonly ["id", "target", "status", "mapped_artifact", "notes"];
    readonly properties: {
        readonly id: {
            readonly type: "string";
            readonly pattern: "^fcp_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$";
        };
        readonly target: {
            readonly type: "string";
            readonly enum: readonly ["market_draft_pipeline", "publishing_engine", "editorial_pipeline"];
        };
        readonly status: {
            readonly type: "string";
            readonly enum: import("../index.js").AdvancedCompatibilityStatus[];
        };
        readonly mapped_artifact: {
            readonly type: "object";
            readonly required: readonly ["readiness"];
            readonly properties: {
                readonly readiness: {
                    readonly type: "string";
                    readonly enum: import("../index.js").AdvancedCompatibilityStatus[];
                };
                readonly validation_status: {
                    readonly type: readonly ["string", "null"];
                    readonly enum: readonly [...import("../index.js").AdvancedValidationStatus[], null];
                };
            };
            readonly additionalProperties: true;
        };
        readonly notes: {
            readonly type: "array";
            readonly items: {
                readonly type: "string";
                readonly minLength: 1;
            };
        };
    };
}];
export { raceTargetSchema, raceMarketDefinitionSchema, sequenceTargetSchema, sequenceMarketDefinitionSchema, triggerConditionSchema, conditionalMarketDefinitionSchema, dependencyLinkSchema, advancedOutcomeGenerationResultSchema, advancedContractValidationReportSchema, advancedMarketCompatibilityResultSchema, };
export * from "./race-target.schema.js";
export * from "./race-market-definition.schema.js";
export * from "./sequence-target.schema.js";
export * from "./sequence-market-definition.schema.js";
export * from "./trigger-condition.schema.js";
export * from "./conditional-market-definition.schema.js";
export * from "./dependency-link.schema.js";
export * from "./advanced-outcome-generation-result.schema.js";
export * from "./advanced-contract-validation-report.schema.js";
export * from "./advanced-market-compatibility-result.schema.js";
//# sourceMappingURL=index.d.ts.map