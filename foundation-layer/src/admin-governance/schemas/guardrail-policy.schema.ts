import { GuardrailSeverity } from "../enums/guardrail-severity.enum.js";

export const GUARDRAIL_POLICY_SCHEMA_ID = "https://market-design-engine.dev/schemas/admin-governance/guardrail-policy.schema.json";

export const guardrailPolicySchema = {
  $id: GUARDRAIL_POLICY_SCHEMA_ID,
  $schema: "https://json-schema.org/draft/2020-12/schema",
  type: "object",
  additionalProperties: false,
  required: ["id", "version", "module_key", "operation_key", "severity", "deny_by_default", "active", "metadata"],
  properties: {
    id: { type: "string", pattern: "^agr_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$" },
    version: { type: "string", pattern: "^v\\d+\\.\\d+\\.\\d+$" },
    module_key: { type: "string", minLength: 1 },
    operation_key: { type: "string", minLength: 1 },
    severity: { type: "string", enum: Object.values(GuardrailSeverity) },
    deny_by_default: { type: "boolean" },
    active: { type: "boolean" },
    metadata: { type: "object", additionalProperties: { type: "string" } },
  },
} as const;
