import { AdversarialType } from "../enums/adversarial-type.enum.js";
import { RiskLevel } from "../enums/risk-level.enum.js";
import { TargetModule } from "../enums/target-module.enum.js";
export declare const ADVERSARIAL_CASE_SCHEMA_ID = "https://market-design-engine.dev/schemas/reliability/adversarial-case.schema.json";
export declare const adversarialCaseSchema: {
    readonly $id: "https://market-design-engine.dev/schemas/reliability/adversarial-case.schema.json";
    readonly $schema: "https://json-schema.org/draft/2020-12/schema";
    readonly type: "object";
    readonly additionalProperties: false;
    readonly required: readonly ["id", "version", "target_module", "adversarial_type", "crafted_input_refs", "expected_rejection_or_behavior", "risk_level", "active"];
    readonly properties: {
        readonly id: {
            readonly type: "string";
            readonly pattern: "^adv_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$";
        };
        readonly version: {
            readonly type: "integer";
            readonly minimum: 1;
        };
        readonly target_module: {
            readonly type: "string";
            readonly enum: TargetModule[];
        };
        readonly adversarial_type: {
            readonly type: "string";
            readonly enum: AdversarialType[];
        };
        readonly crafted_input_refs: {
            readonly type: "array";
            readonly items: {
                readonly $ref: "#/$defs/artifactReference";
            };
        };
        readonly expected_rejection_or_behavior: {
            readonly type: "string";
        };
        readonly risk_level: {
            readonly type: "string";
            readonly enum: RiskLevel[];
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
    };
};
//# sourceMappingURL=adversarial-case.schema.d.ts.map