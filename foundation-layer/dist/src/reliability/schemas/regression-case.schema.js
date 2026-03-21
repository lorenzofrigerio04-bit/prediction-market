import { SeverityLevel } from "../enums/severity-level.enum.js";
import { TargetModule } from "../enums/target-module.enum.js";
export const REGRESSION_CASE_SCHEMA_ID = "https://market-design-engine.dev/schemas/reliability/regression-case.schema.json";
export const regressionCaseSchema = {
    $id: REGRESSION_CASE_SCHEMA_ID,
    $schema: "https://json-schema.org/draft/2020-12/schema",
    type: "object",
    additionalProperties: false,
    required: [
        "id",
        "version",
        "case_name",
        "target_module",
        "input_refs",
        "expected_behavior",
        "failure_signature_nullable",
        "severity",
        "linked_dataset_entry_id_nullable",
    ],
    properties: {
        id: { type: "string", pattern: "^rgc_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$" },
        version: { type: "integer", minimum: 1 },
        case_name: { type: "string", minLength: 1 },
        target_module: { type: "string", enum: Object.values(TargetModule) },
        input_refs: {
            type: "array",
            items: { $ref: "#/$defs/artifactReference" },
        },
        expected_behavior: { type: "string" },
        failure_signature_nullable: { anyOf: [{ type: "null" }, { type: "string" }] },
        severity: { type: "string", enum: Object.values(SeverityLevel) },
        linked_dataset_entry_id_nullable: {
            anyOf: [{ type: "null" }, { type: "string", pattern: "^gde_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$" }],
        },
    },
    $defs: {
        artifactReference: {
            type: "object",
            additionalProperties: false,
            required: [
                "module_name",
                "artifact_type",
                "artifact_id",
                "artifact_version_nullable",
                "uri_nullable",
            ],
            properties: {
                module_name: { type: "string", enum: Object.values(TargetModule) },
                artifact_type: { type: "string", minLength: 1 },
                artifact_id: { type: "string", minLength: 1 },
                artifact_version_nullable: { anyOf: [{ type: "null" }, { type: "integer", minimum: 1 }] },
                uri_nullable: { anyOf: [{ type: "null" }, { type: "string", minLength: 1 }] },
            },
        },
    },
};
//# sourceMappingURL=regression-case.schema.js.map