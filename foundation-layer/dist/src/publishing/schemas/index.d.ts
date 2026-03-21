import { titleSetSchema } from "./title-set.schema.js";
import { resolutionSummarySchema } from "./resolution-summary.schema.js";
import { rulebookSectionSchema } from "./rulebook-section.schema.js";
import { rulebookCompilationSchema } from "./rulebook-compilation.schema.js";
import { timePolicyRenderSchema } from "./time-policy-render.schema.js";
import { sourcePolicyRenderSchema } from "./source-policy-render.schema.js";
import { edgeCaseRenderSchema } from "./edge-case-render.schema.js";
import { publishableCandidateSchema } from "./publishable-candidate.schema.js";
export declare const publishingSchemas: readonly [{
    readonly $id: "https://market-design-engine.dev/schemas/publishing/title-set.schema.json";
    readonly $schema: "https://json-schema.org/draft/2020-12/schema";
    readonly type: "object";
    readonly additionalProperties: false;
    readonly required: readonly ["id", "version", "market_draft_pipeline_id", "canonical_title", "display_title", "subtitle", "title_generation_status", "generation_metadata"];
    readonly properties: {
        readonly id: {
            readonly type: "string";
            readonly pattern: "^tset_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$";
        };
        readonly version: {
            readonly type: "integer";
            readonly minimum: 1;
        };
        readonly market_draft_pipeline_id: {
            readonly type: "string";
            readonly pattern: "^mdp_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$";
        };
        readonly canonical_title: {
            readonly type: "string";
            readonly minLength: 1;
        };
        readonly display_title: {
            readonly type: "string";
            readonly minLength: 1;
        };
        readonly subtitle: {
            readonly type: readonly ["string", "null"];
        };
        readonly title_generation_status: {
            readonly type: "string";
            readonly enum: import("../index.js").TitleGenerationStatus[];
        };
        readonly generation_metadata: {
            readonly type: "object";
            readonly additionalProperties: true;
        };
    };
}, {
    readonly $id: "https://market-design-engine.dev/schemas/publishing/resolution-summary.schema.json";
    readonly $schema: "https://json-schema.org/draft/2020-12/schema";
    readonly type: "object";
    readonly additionalProperties: false;
    readonly required: readonly ["id", "version", "market_draft_pipeline_id", "one_line_resolution_summary", "summary_basis", "summary_confidence"];
    readonly properties: {
        readonly id: {
            readonly type: "string";
            readonly pattern: "^rsum_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$";
        };
        readonly version: {
            readonly type: "integer";
            readonly minimum: 1;
        };
        readonly market_draft_pipeline_id: {
            readonly type: "string";
            readonly pattern: "^mdp_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$";
        };
        readonly one_line_resolution_summary: {
            readonly type: "string";
            readonly minLength: 1;
        };
        readonly summary_basis: {
            readonly type: "object";
            readonly additionalProperties: false;
            readonly required: readonly ["resolution_rule_ref", "source_hierarchy_ref", "deadline_ref", "basis_points"];
            readonly properties: {
                readonly resolution_rule_ref: {
                    readonly type: "string";
                    readonly minLength: 1;
                };
                readonly source_hierarchy_ref: {
                    readonly type: "string";
                    readonly minLength: 1;
                };
                readonly deadline_ref: {
                    readonly type: "string";
                    readonly minLength: 1;
                };
                readonly basis_points: {
                    readonly type: "array";
                    readonly minItems: 1;
                    readonly items: {
                        readonly type: "string";
                        readonly minLength: 1;
                    };
                    readonly uniqueItems: true;
                };
            };
        };
        readonly summary_confidence: {
            readonly $ref: "https://market-design-engine.dev/schemas/common/primitives.schema.json#/$defs/score01";
        };
    };
}, {
    readonly $id: "https://market-design-engine.dev/schemas/publishing/rulebook-section.schema.json";
    readonly $schema: "https://json-schema.org/draft/2020-12/schema";
    readonly type: "object";
    readonly additionalProperties: false;
    readonly required: readonly ["id", "section_type", "title", "body", "ordering_index", "required"];
    readonly properties: {
        readonly id: {
            readonly type: "string";
            readonly pattern: "^rbsec_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$";
        };
        readonly section_type: {
            readonly type: "string";
            readonly enum: import("../index.js").RulebookSectionType[];
        };
        readonly title: {
            readonly type: "string";
            readonly minLength: 1;
        };
        readonly body: {
            readonly type: "string";
            readonly minLength: 1;
        };
        readonly ordering_index: {
            readonly type: "integer";
            readonly minimum: 0;
        };
        readonly required: {
            readonly type: "boolean";
        };
    };
}, {
    readonly $id: "https://market-design-engine.dev/schemas/publishing/rulebook-compilation.schema.json";
    readonly $schema: "https://json-schema.org/draft/2020-12/schema";
    readonly type: "object";
    readonly additionalProperties: false;
    readonly required: readonly ["id", "version", "market_draft_pipeline_id", "canonical_question", "contract_definition", "resolution_criteria", "source_policy", "time_policy", "edge_case_section", "invalidation_section", "examples_section", "included_sections", "compilation_status", "compilation_metadata"];
    readonly properties: {
        readonly id: {
            readonly type: "string";
            readonly pattern: "^rbcmp_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$";
        };
        readonly version: {
            readonly type: "integer";
            readonly minimum: 1;
        };
        readonly market_draft_pipeline_id: {
            readonly type: "string";
            readonly pattern: "^mdp_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$";
        };
        readonly canonical_question: {
            readonly $ref: "https://market-design-engine.dev/schemas/publishing/rulebook-section.schema.json";
        };
        readonly contract_definition: {
            readonly $ref: "https://market-design-engine.dev/schemas/publishing/rulebook-section.schema.json";
        };
        readonly resolution_criteria: {
            readonly $ref: "https://market-design-engine.dev/schemas/publishing/rulebook-section.schema.json";
        };
        readonly source_policy: {
            readonly $ref: "https://market-design-engine.dev/schemas/publishing/rulebook-section.schema.json";
        };
        readonly time_policy: {
            readonly $ref: "https://market-design-engine.dev/schemas/publishing/rulebook-section.schema.json";
        };
        readonly edge_case_section: {
            readonly $ref: "https://market-design-engine.dev/schemas/publishing/rulebook-section.schema.json";
        };
        readonly invalidation_section: {
            readonly $ref: "https://market-design-engine.dev/schemas/publishing/rulebook-section.schema.json";
        };
        readonly examples_section: {
            readonly $ref: "https://market-design-engine.dev/schemas/publishing/rulebook-section.schema.json";
        };
        readonly included_sections: {
            readonly type: "array";
            readonly minItems: 1;
            readonly items: {
                readonly $ref: "https://market-design-engine.dev/schemas/publishing/rulebook-section.schema.json";
            };
        };
        readonly compilation_status: {
            readonly type: "string";
            readonly enum: import("../index.js").CompilationStatus[];
        };
        readonly compilation_metadata: {
            readonly type: "object";
            readonly additionalProperties: true;
        };
    };
}, {
    readonly $id: "https://market-design-engine.dev/schemas/publishing/time-policy-render.schema.json";
    readonly $schema: "https://json-schema.org/draft/2020-12/schema";
    readonly type: "object";
    readonly additionalProperties: false;
    readonly required: readonly ["timezone", "deadline_text", "close_time_text", "cutoff_text_nullable", "policy_notes", "metadata"];
    readonly properties: {
        readonly timezone: {
            readonly type: "string";
            readonly minLength: 1;
        };
        readonly deadline_text: {
            readonly type: "string";
            readonly minLength: 1;
        };
        readonly close_time_text: {
            readonly type: "string";
            readonly minLength: 1;
        };
        readonly cutoff_text_nullable: {
            readonly type: readonly ["string", "null"];
        };
        readonly policy_notes: {
            readonly type: "array";
            readonly items: {
                readonly type: "string";
                readonly minLength: 1;
            };
            readonly uniqueItems: true;
        };
        readonly metadata: {
            readonly type: "object";
            readonly additionalProperties: true;
        };
    };
}, {
    readonly $id: "https://market-design-engine.dev/schemas/publishing/source-policy-render.schema.json";
    readonly $schema: "https://json-schema.org/draft/2020-12/schema";
    readonly type: "object";
    readonly additionalProperties: false;
    readonly required: readonly ["selected_source_priority", "source_policy_text", "fallback_policy_text_nullable"];
    readonly properties: {
        readonly selected_source_priority: {
            readonly type: "array";
            readonly minItems: 1;
            readonly items: {
                readonly type: "string";
                readonly minLength: 1;
            };
            readonly uniqueItems: true;
        };
        readonly source_policy_text: {
            readonly type: "string";
            readonly minLength: 1;
        };
        readonly fallback_policy_text_nullable: {
            readonly type: readonly ["string", "null"];
        };
    };
}, {
    readonly $id: "https://market-design-engine.dev/schemas/publishing/edge-case-render.schema.json";
    readonly $schema: "https://json-schema.org/draft/2020-12/schema";
    readonly type: "object";
    readonly additionalProperties: false;
    readonly required: readonly ["edge_case_items", "invalidation_items", "notes_nullable"];
    readonly properties: {
        readonly edge_case_items: {
            readonly type: "array";
            readonly items: {
                readonly type: "string";
                readonly minLength: 1;
            };
            readonly uniqueItems: true;
            readonly minItems: 1;
        };
        readonly invalidation_items: {
            readonly type: "array";
            readonly items: {
                readonly type: "string";
                readonly minLength: 1;
            };
            readonly uniqueItems: true;
            readonly minItems: 1;
        };
        readonly notes_nullable: {
            readonly type: readonly ["string", "null"];
        };
    };
}, {
    readonly $id: "https://market-design-engine.dev/schemas/publishing/publishable-candidate.schema.json";
    readonly $schema: "https://json-schema.org/draft/2020-12/schema";
    readonly type: "object";
    readonly additionalProperties: false;
    readonly required: readonly ["id", "version", "market_draft_pipeline_id", "title_set_id", "resolution_summary_id", "rulebook_compilation_id", "candidate_status", "structural_readiness_score", "blocking_issues", "warnings", "compatibility_metadata"];
    readonly properties: {
        readonly id: {
            readonly type: "string";
            readonly pattern: "^pcnd_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$";
        };
        readonly version: {
            readonly type: "integer";
            readonly minimum: 1;
        };
        readonly market_draft_pipeline_id: {
            readonly type: "string";
            readonly pattern: "^mdp_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$";
        };
        readonly title_set_id: {
            readonly type: "string";
            readonly pattern: "^tset_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$";
        };
        readonly resolution_summary_id: {
            readonly type: "string";
            readonly pattern: "^rsum_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$";
        };
        readonly rulebook_compilation_id: {
            readonly type: "string";
            readonly pattern: "^rbcmp_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$";
        };
        readonly candidate_status: {
            readonly type: "string";
            readonly enum: import("../index.js").PublishableCandidateStatus[];
        };
        readonly structural_readiness_score: {
            readonly type: "number";
            readonly minimum: 0;
            readonly maximum: 100;
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
        readonly compatibility_metadata: {
            readonly type: "object";
            readonly additionalProperties: true;
        };
    };
}];
export { titleSetSchema, resolutionSummarySchema, rulebookSectionSchema, rulebookCompilationSchema, timePolicyRenderSchema, sourcePolicyRenderSchema, edgeCaseRenderSchema, publishableCandidateSchema, };
//# sourceMappingURL=index.d.ts.map