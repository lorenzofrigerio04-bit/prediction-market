import { marketFamilySchema } from "./market-family.schema.js";
import { flagshipMarketSelectionSchema } from "./flagship-market-selection.schema.js";
import { satelliteMarketDefinitionSchema } from "./satellite-market-definition.schema.js";
import { derivativeMarketDefinitionSchema } from "./derivative-market-definition.schema.js";
import { marketRelationshipSchema } from "./market-relationship.schema.js";
import { expansionStrategySchema } from "./expansion-strategy.schema.js";
import { cannibalizationCheckResultSchema } from "./cannibalization-check-result.schema.js";
import { expansionValidationReportSchema } from "./expansion-validation-report.schema.js";
import { familyGenerationResultSchema } from "./family-generation-result.schema.js";
import { marketFamilyCompatibilityResultSchema } from "./market-family-compatibility-result.schema.js";
export declare const marketExpansionSchemas: readonly [{
    readonly $id: "https://market-design-engine.dev/schemas/market-expansion/market-family.schema.json";
    readonly $schema: "https://json-schema.org/draft/2020-12/schema";
    readonly type: "object";
    readonly additionalProperties: false;
    readonly required: readonly ["id", "version", "family_key", "source_context_type", "source_context_ref", "flagship_market_ref", "satellite_market_refs", "derivative_market_refs", "family_status", "family_metadata"];
    readonly properties: {
        readonly id: {
            readonly type: "string";
            readonly pattern: "^mfy_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$";
        };
        readonly version: {
            readonly type: "integer";
            readonly minimum: 1;
        };
        readonly family_key: {
            readonly type: "string";
            readonly minLength: 1;
        };
        readonly source_context_type: {
            readonly type: "string";
            readonly enum: import("../index.js").SourceContextType[];
        };
        readonly source_context_ref: {
            readonly type: "string";
            readonly minLength: 1;
        };
        readonly flagship_market_ref: {
            readonly type: "string";
            readonly minLength: 1;
        };
        readonly satellite_market_refs: {
            readonly type: "array";
            readonly items: {
                readonly type: "string";
                readonly minLength: 1;
            };
            readonly uniqueItems: true;
        };
        readonly derivative_market_refs: {
            readonly type: "array";
            readonly items: {
                readonly type: "string";
                readonly minLength: 1;
            };
            readonly uniqueItems: true;
        };
        readonly family_status: {
            readonly type: "string";
            readonly enum: import("../index.js").FamilyStatus[];
        };
        readonly family_metadata: {
            readonly type: "object";
            readonly additionalProperties: false;
            readonly required: readonly ["context_hash", "generation_mode", "tags", "notes"];
            readonly properties: {
                readonly context_hash: {
                    readonly type: "string";
                    readonly minLength: 1;
                };
                readonly generation_mode: {
                    readonly type: "string";
                    readonly const: "deterministic-v1";
                };
                readonly tags: {
                    readonly type: "array";
                    readonly items: {
                        readonly type: "string";
                    };
                };
                readonly notes: {
                    readonly type: "array";
                    readonly items: {
                        readonly type: "string";
                    };
                };
            };
        };
    };
}, {
    readonly $id: "https://market-design-engine.dev/schemas/market-expansion/flagship-market-selection.schema.json";
    readonly $schema: "https://json-schema.org/draft/2020-12/schema";
    readonly type: "object";
    readonly additionalProperties: false;
    readonly required: readonly ["id", "version", "source_context_ref", "selected_market_ref", "selection_reason", "strategic_priority", "selection_confidence"];
    readonly properties: {
        readonly id: {
            readonly type: "string";
            readonly pattern: "^mfs_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$";
        };
        readonly version: {
            readonly type: "integer";
            readonly minimum: 1;
        };
        readonly source_context_ref: {
            readonly type: "string";
            readonly minLength: 1;
        };
        readonly selected_market_ref: {
            readonly type: "string";
            readonly minLength: 1;
        };
        readonly selection_reason: {
            readonly type: "string";
            readonly minLength: 1;
        };
        readonly strategic_priority: {
            readonly type: "integer";
            readonly minimum: 1;
            readonly maximum: 10;
        };
        readonly selection_confidence: {
            readonly type: "number";
            readonly minimum: 0;
            readonly maximum: 1;
        };
    };
}, {
    readonly $id: "https://market-design-engine.dev/schemas/market-expansion/satellite-market-definition.schema.json";
    readonly $schema: "https://json-schema.org/draft/2020-12/schema";
    readonly type: "object";
    readonly additionalProperties: false;
    readonly required: readonly ["id", "version", "parent_family_id", "parent_market_ref", "market_ref", "satellite_role", "dependency_notes_nullable", "active"];
    readonly properties: {
        readonly id: {
            readonly type: "string";
            readonly pattern: "^msd_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$";
        };
        readonly version: {
            readonly type: "integer";
            readonly minimum: 1;
        };
        readonly parent_family_id: {
            readonly type: "string";
            readonly pattern: "^mfy_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$";
        };
        readonly parent_market_ref: {
            readonly type: "string";
            readonly minLength: 1;
        };
        readonly market_ref: {
            readonly type: "string";
            readonly minLength: 1;
        };
        readonly satellite_role: {
            readonly type: "string";
            readonly enum: import("../index.js").SatelliteRole[];
        };
        readonly dependency_notes_nullable: {
            readonly anyOf: readonly [{
                readonly type: "null";
            }, {
                readonly type: "string";
                readonly minLength: 1;
            }];
        };
        readonly active: {
            readonly type: "boolean";
        };
    };
}, {
    readonly $id: "https://market-design-engine.dev/schemas/market-expansion/derivative-market-definition.schema.json";
    readonly $schema: "https://json-schema.org/draft/2020-12/schema";
    readonly type: "object";
    readonly additionalProperties: false;
    readonly required: readonly ["id", "version", "parent_family_id", "source_relation_ref", "market_ref", "derivative_type", "dependency_strength", "active"];
    readonly properties: {
        readonly id: {
            readonly type: "string";
            readonly pattern: "^mdd_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$";
        };
        readonly version: {
            readonly type: "integer";
            readonly minimum: 1;
        };
        readonly parent_family_id: {
            readonly type: "string";
            readonly pattern: "^mfy_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$";
        };
        readonly source_relation_ref: {
            readonly type: "string";
            readonly minLength: 1;
        };
        readonly market_ref: {
            readonly type: "string";
            readonly minLength: 1;
        };
        readonly derivative_type: {
            readonly type: "string";
            readonly enum: import("../index.js").DerivativeType[];
        };
        readonly dependency_strength: {
            readonly type: "number";
            readonly minimum: 0;
            readonly maximum: 1;
        };
        readonly active: {
            readonly type: "boolean";
        };
    };
}, {
    readonly $id: "https://market-design-engine.dev/schemas/market-expansion/market-relationship.schema.json";
    readonly $schema: "https://json-schema.org/draft/2020-12/schema";
    readonly type: "object";
    readonly additionalProperties: false;
    readonly required: readonly ["id", "source_market_ref", "target_market_ref", "relationship_type", "relationship_strength", "blocking_cannibalization", "notes_nullable"];
    readonly properties: {
        readonly id: {
            readonly type: "string";
            readonly pattern: "^mrl_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$";
        };
        readonly source_market_ref: {
            readonly type: "string";
            readonly minLength: 1;
        };
        readonly target_market_ref: {
            readonly type: "string";
            readonly minLength: 1;
        };
        readonly relationship_type: {
            readonly type: "string";
            readonly enum: import("../index.js").RelationshipType[];
        };
        readonly relationship_strength: {
            readonly type: "string";
            readonly enum: import("../index.js").RelationshipStrength[];
        };
        readonly blocking_cannibalization: {
            readonly type: "boolean";
        };
        readonly notes_nullable: {
            readonly anyOf: readonly [{
                readonly type: "null";
            }, {
                readonly type: "string";
                readonly minLength: 1;
            }];
        };
    };
}, {
    readonly $id: "https://market-design-engine.dev/schemas/market-expansion/expansion-strategy.schema.json";
    readonly $schema: "https://json-schema.org/draft/2020-12/schema";
    readonly type: "object";
    readonly additionalProperties: false;
    readonly required: readonly ["id", "version", "source_context_ref", "strategy_type", "allowed_contract_types", "max_satellite_count", "max_derivative_count", "anti_cannibalization_policy", "expansion_notes_nullable"];
    readonly properties: {
        readonly id: {
            readonly type: "string";
            readonly pattern: "^mes_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$";
        };
        readonly version: {
            readonly type: "integer";
            readonly minimum: 1;
        };
        readonly source_context_ref: {
            readonly type: "string";
            readonly minLength: 1;
        };
        readonly strategy_type: {
            readonly type: "string";
            readonly enum: import("../index.js").StrategyType[];
        };
        readonly allowed_contract_types: {
            readonly type: "array";
            readonly minItems: 1;
            readonly uniqueItems: true;
            readonly items: {
                readonly type: "string";
                readonly enum: import("../../index.js").ContractType[];
            };
        };
        readonly max_satellite_count: {
            readonly type: "integer";
            readonly minimum: 0;
        };
        readonly max_derivative_count: {
            readonly type: "integer";
            readonly minimum: 0;
        };
        readonly anti_cannibalization_policy: {
            readonly type: "string";
            readonly minLength: 1;
        };
        readonly expansion_notes_nullable: {
            readonly anyOf: readonly [{
                readonly type: "null";
            }, {
                readonly type: "string";
                readonly minLength: 1;
            }];
        };
    };
}, {
    readonly $id: "https://market-design-engine.dev/schemas/market-expansion/cannibalization-check-result.schema.json";
    readonly $schema: "https://json-schema.org/draft/2020-12/schema";
    readonly type: "object";
    readonly additionalProperties: false;
    readonly required: readonly ["id", "family_id", "checked_market_pairs", "blocking_conflicts", "warnings", "check_status"];
    readonly properties: {
        readonly id: {
            readonly type: "string";
            readonly pattern: "^mcc_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$";
        };
        readonly family_id: {
            readonly type: "string";
            readonly pattern: "^mfy_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$";
        };
        readonly checked_market_pairs: {
            readonly type: "array";
            readonly items: {
                readonly type: "object";
                readonly additionalProperties: false;
                readonly required: readonly ["source_market_ref", "target_market_ref"];
                readonly properties: {
                    readonly source_market_ref: {
                        readonly type: "string";
                        readonly minLength: 1;
                    };
                    readonly target_market_ref: {
                        readonly type: "string";
                        readonly minLength: 1;
                    };
                };
            };
        };
        readonly blocking_conflicts: {
            readonly type: "array";
            readonly items: {
                readonly type: "string";
                readonly minLength: 1;
            };
        };
        readonly warnings: {
            readonly type: "array";
            readonly items: {
                readonly type: "string";
                readonly minLength: 1;
            };
        };
        readonly check_status: {
            readonly type: "string";
            readonly enum: import("../index.js").CannibalizationStatus[];
        };
    };
}, {
    readonly $id: "https://market-design-engine.dev/schemas/market-expansion/expansion-validation-report.schema.json";
    readonly $schema: "https://json-schema.org/draft/2020-12/schema";
    readonly type: "object";
    readonly additionalProperties: false;
    readonly required: readonly ["id", "version", "family_id", "validation_status", "blocking_issues", "warnings", "checked_invariants", "compatibility_notes"];
    readonly properties: {
        readonly id: {
            readonly type: "string";
            readonly pattern: "^mvr_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$";
        };
        readonly version: {
            readonly type: "integer";
            readonly minimum: 1;
        };
        readonly family_id: {
            readonly type: "string";
            readonly pattern: "^mfy_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$";
        };
        readonly validation_status: {
            readonly type: "string";
            readonly enum: import("../index.js").ExpansionValidationStatus[];
        };
        readonly blocking_issues: {
            readonly type: "array";
            readonly items: {
                readonly type: "string";
                readonly minLength: 1;
            };
        };
        readonly warnings: {
            readonly type: "array";
            readonly items: {
                readonly type: "string";
                readonly minLength: 1;
            };
        };
        readonly checked_invariants: {
            readonly type: "array";
            readonly items: {
                readonly type: "object";
                readonly additionalProperties: false;
                readonly required: readonly ["code", "passed", "description"];
                readonly properties: {
                    readonly code: {
                        readonly type: "string";
                        readonly minLength: 1;
                    };
                    readonly passed: {
                        readonly type: "boolean";
                    };
                    readonly description: {
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
    readonly $id: "https://market-design-engine.dev/schemas/market-expansion/family-generation-result.schema.json";
    readonly $schema: "https://json-schema.org/draft/2020-12/schema";
    readonly type: "object";
    readonly additionalProperties: false;
    readonly required: readonly ["id", "version", "market_family_id", "generated_market_refs", "flagship_ref", "generation_status", "generation_confidence", "output_notes_nullable"];
    readonly properties: {
        readonly id: {
            readonly type: "string";
            readonly pattern: "^mgr_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$";
        };
        readonly version: {
            readonly type: "integer";
            readonly minimum: 1;
        };
        readonly market_family_id: {
            readonly type: "string";
            readonly pattern: "^mfy_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$";
        };
        readonly generated_market_refs: {
            readonly type: "array";
            readonly minItems: 1;
            readonly uniqueItems: true;
            readonly items: {
                readonly type: "string";
                readonly minLength: 1;
            };
        };
        readonly flagship_ref: {
            readonly type: "string";
            readonly minLength: 1;
        };
        readonly generation_status: {
            readonly type: "string";
            readonly enum: import("../index.js").GenerationStatus[];
        };
        readonly generation_confidence: {
            readonly type: "number";
            readonly minimum: 0;
            readonly maximum: 1;
        };
        readonly output_notes_nullable: {
            readonly anyOf: readonly [{
                readonly type: "null";
            }, {
                readonly type: "string";
                readonly minLength: 1;
            }];
        };
    };
}, {
    readonly $id: "https://market-design-engine.dev/schemas/market-expansion/market-family-compatibility-result.schema.json";
    readonly $schema: "https://json-schema.org/draft/2020-12/schema";
    readonly type: "object";
    readonly additionalProperties: false;
    readonly required: readonly ["id", "target", "status", "mapped_artifact", "notes"];
    readonly properties: {
        readonly id: {
            readonly type: "string";
            readonly pattern: "^mcp_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$";
        };
        readonly target: {
            readonly type: "string";
            readonly enum: readonly ["market_draft_pipeline", "publishable_candidate", "publication_ready_artifact", "editorial_pipeline"];
        };
        readonly status: {
            readonly type: "string";
            readonly enum: import("../index.js").FamilyCompatibilityStatus[];
        };
        readonly mapped_artifact: {
            readonly type: "object";
            readonly additionalProperties: true;
            readonly required: readonly ["readiness", "validation_status"];
            readonly properties: {
                readonly readiness: {
                    readonly type: "string";
                    readonly enum: import("../index.js").FamilyCompatibilityStatus[];
                };
                readonly validation_status: {
                    readonly anyOf: readonly [{
                        readonly type: "null";
                    }, {
                        readonly type: "string";
                    }];
                };
            };
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
export { marketFamilySchema, flagshipMarketSelectionSchema, satelliteMarketDefinitionSchema, derivativeMarketDefinitionSchema, marketRelationshipSchema, expansionStrategySchema, cannibalizationCheckResultSchema, expansionValidationReportSchema, familyGenerationResultSchema, marketFamilyCompatibilityResultSchema, };
export * from "./market-family.schema.js";
export * from "./flagship-market-selection.schema.js";
export * from "./satellite-market-definition.schema.js";
export * from "./derivative-market-definition.schema.js";
export * from "./market-relationship.schema.js";
export * from "./expansion-strategy.schema.js";
export * from "./cannibalization-check-result.schema.js";
export * from "./expansion-validation-report.schema.js";
export * from "./family-generation-result.schema.js";
export * from "./market-family-compatibility-result.schema.js";
//# sourceMappingURL=index.d.ts.map