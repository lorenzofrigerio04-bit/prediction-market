import { CompilationStatus } from "../enums/compilation-status.enum.js";
export declare const RULEBOOK_COMPILATION_SCHEMA_ID = "https://market-design-engine.dev/schemas/publishing/rulebook-compilation.schema.json";
export declare const rulebookCompilationSchema: {
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
            readonly enum: CompilationStatus[];
        };
        readonly compilation_metadata: {
            readonly type: "object";
            readonly additionalProperties: true;
        };
    };
};
//# sourceMappingURL=rulebook-compilation.schema.d.ts.map