import { DatasetScope } from "../enums/dataset-scope.enum.js";
import { FinalGateStatus } from "../enums/final-gate-status.enum.js";
import { TargetModule } from "../enums/target-module.enum.js";
export const RELEASE_GATE_EVALUATION_SCHEMA_ID = "https://market-design-engine.dev/schemas/reliability/release-gate-evaluation.schema.json";
export const releaseGateEvaluationSchema = {
    $id: RELEASE_GATE_EVALUATION_SCHEMA_ID,
    $schema: "https://json-schema.org/draft/2020-12/schema",
    type: "object",
    additionalProperties: false,
    required: [
        "id",
        "version",
        "evaluated_at",
        "target_scope",
        "schema_gate_pass",
        "validator_gate_pass",
        "test_gate_pass",
        "regression_gate_pass",
        "compatibility_gate_pass",
        "readiness_gate_pass",
        "final_gate_status",
        "blocking_reasons",
    ],
    properties: {
        id: { type: "string", pattern: "^rge_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$" },
        version: { type: "integer", minimum: 1 },
        evaluated_at: { type: "string", format: "date-time" },
        target_scope: { type: "string", enum: Object.values(DatasetScope) },
        schema_gate_pass: { type: "boolean" },
        validator_gate_pass: { type: "boolean" },
        test_gate_pass: { type: "boolean" },
        regression_gate_pass: { type: "boolean" },
        compatibility_gate_pass: { type: "boolean" },
        readiness_gate_pass: { type: "boolean" },
        final_gate_status: { type: "string", enum: Object.values(FinalGateStatus) },
        blocking_reasons: { type: "array", items: { $ref: "#/$defs/blockingReason" } },
    },
    $defs: {
        blockingReason: {
            type: "object",
            additionalProperties: false,
            required: ["code", "message", "module_name", "path"],
            properties: {
                code: { type: "string", minLength: 1 },
                message: { type: "string", minLength: 1 },
                module_name: { type: "string", enum: Object.values(TargetModule) },
                path: { type: "string", minLength: 1 },
            },
        },
    },
};
//# sourceMappingURL=release-gate-evaluation.schema.js.map