import { DatasetScope } from "../enums/dataset-scope.enum.js";
import { FinalGateStatus } from "../enums/final-gate-status.enum.js";
import { TargetModule } from "../enums/target-module.enum.js";
export declare const RELEASE_GATE_EVALUATION_SCHEMA_ID = "https://market-design-engine.dev/schemas/reliability/release-gate-evaluation.schema.json";
export declare const releaseGateEvaluationSchema: {
    readonly $id: "https://market-design-engine.dev/schemas/reliability/release-gate-evaluation.schema.json";
    readonly $schema: "https://json-schema.org/draft/2020-12/schema";
    readonly type: "object";
    readonly additionalProperties: false;
    readonly required: readonly ["id", "version", "evaluated_at", "target_scope", "schema_gate_pass", "validator_gate_pass", "test_gate_pass", "regression_gate_pass", "compatibility_gate_pass", "readiness_gate_pass", "final_gate_status", "blocking_reasons"];
    readonly properties: {
        readonly id: {
            readonly type: "string";
            readonly pattern: "^rge_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$";
        };
        readonly version: {
            readonly type: "integer";
            readonly minimum: 1;
        };
        readonly evaluated_at: {
            readonly type: "string";
            readonly format: "date-time";
        };
        readonly target_scope: {
            readonly type: "string";
            readonly enum: DatasetScope[];
        };
        readonly schema_gate_pass: {
            readonly type: "boolean";
        };
        readonly validator_gate_pass: {
            readonly type: "boolean";
        };
        readonly test_gate_pass: {
            readonly type: "boolean";
        };
        readonly regression_gate_pass: {
            readonly type: "boolean";
        };
        readonly compatibility_gate_pass: {
            readonly type: "boolean";
        };
        readonly readiness_gate_pass: {
            readonly type: "boolean";
        };
        readonly final_gate_status: {
            readonly type: "string";
            readonly enum: FinalGateStatus[];
        };
        readonly blocking_reasons: {
            readonly type: "array";
            readonly items: {
                readonly $ref: "#/$defs/blockingReason";
            };
        };
    };
    readonly $defs: {
        readonly blockingReason: {
            readonly type: "object";
            readonly additionalProperties: false;
            readonly required: readonly ["code", "message", "module_name", "path"];
            readonly properties: {
                readonly code: {
                    readonly type: "string";
                    readonly minLength: 1;
                };
                readonly message: {
                    readonly type: "string";
                    readonly minLength: 1;
                };
                readonly module_name: {
                    readonly type: "string";
                    readonly enum: TargetModule[];
                };
                readonly path: {
                    readonly type: "string";
                    readonly minLength: 1;
                };
            };
        };
    };
};
//# sourceMappingURL=release-gate-evaluation.schema.d.ts.map