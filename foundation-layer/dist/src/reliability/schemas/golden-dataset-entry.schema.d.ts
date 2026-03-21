import { DatasetScope } from "../enums/dataset-scope.enum.js";
import { PriorityLevel } from "../enums/priority-level.enum.js";
import { TargetModule } from "../enums/target-module.enum.js";
export declare const GOLDEN_DATASET_ENTRY_SCHEMA_ID = "https://market-design-engine.dev/schemas/reliability/golden-dataset-entry.schema.json";
export declare const goldenDatasetEntrySchema: {
    readonly $id: "https://market-design-engine.dev/schemas/reliability/golden-dataset-entry.schema.json";
    readonly $schema: "https://json-schema.org/draft/2020-12/schema";
    readonly type: "object";
    readonly additionalProperties: false;
    readonly required: readonly ["id", "version", "dataset_scope", "input_artifact_refs", "expected_output_refs", "expected_invariants", "category_tags", "priority_level", "active"];
    readonly properties: {
        readonly id: {
            readonly type: "string";
            readonly pattern: "^gde_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$";
        };
        readonly version: {
            readonly type: "integer";
            readonly minimum: 1;
        };
        readonly dataset_scope: {
            readonly type: "string";
            readonly enum: DatasetScope[];
        };
        readonly input_artifact_refs: {
            readonly type: "array";
            readonly items: {
                readonly $ref: "#/$defs/artifactReference";
            };
        };
        readonly expected_output_refs: {
            readonly type: "array";
            readonly items: {
                readonly $ref: "#/$defs/artifactReference";
            };
        };
        readonly expected_invariants: {
            readonly type: "array";
            readonly minItems: 1;
            readonly items: {
                readonly $ref: "#/$defs/expectedInvariant";
            };
        };
        readonly category_tags: {
            readonly type: "array";
            readonly items: {
                readonly type: "string";
                readonly minLength: 1;
            };
        };
        readonly priority_level: {
            readonly type: "string";
            readonly enum: PriorityLevel[];
        };
        readonly active: {
            readonly type: "boolean";
        };
    };
    readonly $defs: {
        readonly artifactReference: {
            readonly type: "object";
            readonly additionalProperties: false;
            readonly required: readonly ["module_name", "artifact_type", "artifact_id", "artifact_version_nullable", "uri_nullable"];
            readonly properties: {
                readonly module_name: {
                    readonly type: "string";
                    readonly enum: TargetModule[];
                };
                readonly artifact_type: {
                    readonly type: "string";
                    readonly minLength: 1;
                };
                readonly artifact_id: {
                    readonly type: "string";
                    readonly minLength: 1;
                };
                readonly artifact_version_nullable: {
                    readonly anyOf: readonly [{
                        readonly type: "null";
                    }, {
                        readonly type: "integer";
                        readonly minimum: 1;
                    }];
                };
                readonly uri_nullable: {
                    readonly anyOf: readonly [{
                        readonly type: "null";
                    }, {
                        readonly type: "string";
                        readonly minLength: 1;
                    }];
                };
            };
        };
        readonly expectedInvariant: {
            readonly type: "object";
            readonly additionalProperties: false;
            readonly required: readonly ["code", "description", "path"];
            readonly properties: {
                readonly code: {
                    readonly type: "string";
                    readonly minLength: 1;
                };
                readonly description: {
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
};
//# sourceMappingURL=golden-dataset-entry.schema.d.ts.map