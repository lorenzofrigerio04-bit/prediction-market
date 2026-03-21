import { SeverityLevel } from "../enums/severity-level.enum.js";
import { TargetModule } from "../enums/target-module.enum.js";
export declare const REGRESSION_CASE_SCHEMA_ID = "https://market-design-engine.dev/schemas/reliability/regression-case.schema.json";
export declare const regressionCaseSchema: {
    readonly $id: "https://market-design-engine.dev/schemas/reliability/regression-case.schema.json";
    readonly $schema: "https://json-schema.org/draft/2020-12/schema";
    readonly type: "object";
    readonly additionalProperties: false;
    readonly required: readonly ["id", "version", "case_name", "target_module", "input_refs", "expected_behavior", "failure_signature_nullable", "severity", "linked_dataset_entry_id_nullable"];
    readonly properties: {
        readonly id: {
            readonly type: "string";
            readonly pattern: "^rgc_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$";
        };
        readonly version: {
            readonly type: "integer";
            readonly minimum: 1;
        };
        readonly case_name: {
            readonly type: "string";
            readonly minLength: 1;
        };
        readonly target_module: {
            readonly type: "string";
            readonly enum: TargetModule[];
        };
        readonly input_refs: {
            readonly type: "array";
            readonly items: {
                readonly $ref: "#/$defs/artifactReference";
            };
        };
        readonly expected_behavior: {
            readonly type: "string";
        };
        readonly failure_signature_nullable: {
            readonly anyOf: readonly [{
                readonly type: "null";
            }, {
                readonly type: "string";
            }];
        };
        readonly severity: {
            readonly type: "string";
            readonly enum: SeverityLevel[];
        };
        readonly linked_dataset_entry_id_nullable: {
            readonly anyOf: readonly [{
                readonly type: "null";
            }, {
                readonly type: "string";
                readonly pattern: "^gde_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$";
            }];
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
    };
};
//# sourceMappingURL=regression-case.schema.d.ts.map