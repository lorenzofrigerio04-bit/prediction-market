import { AdversarialType } from "../enums/adversarial-type.enum.js";
import { RiskLevel } from "../enums/risk-level.enum.js";
import { TargetModule } from "../enums/target-module.enum.js";
export const ADVERSARIAL_CASE_SCHEMA_ID = "https://market-design-engine.dev/schemas/reliability/adversarial-case.schema.json";
export const adversarialCaseSchema = {
    $id: ADVERSARIAL_CASE_SCHEMA_ID,
    $schema: "https://json-schema.org/draft/2020-12/schema",
    type: "object",
    additionalProperties: false,
    required: [
        "id",
        "version",
        "target_module",
        "adversarial_type",
        "crafted_input_refs",
        "expected_rejection_or_behavior",
        "risk_level",
        "active",
    ],
    properties: {
        id: { type: "string", pattern: "^adv_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$" },
        version: { type: "integer", minimum: 1 },
        target_module: { type: "string", enum: Object.values(TargetModule) },
        adversarial_type: { type: "string", enum: Object.values(AdversarialType) },
        crafted_input_refs: {
            type: "array",
            items: { $ref: "#/$defs/artifactReference" },
        },
        expected_rejection_or_behavior: { type: "string" },
        risk_level: { type: "string", enum: Object.values(RiskLevel) },
        active: { type: "boolean" },
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
//# sourceMappingURL=adversarial-case.schema.js.map