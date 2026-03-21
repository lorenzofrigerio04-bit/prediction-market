import { GovernanceDecisionStatus } from "../enums/governance-decision-status.enum.js";

export const GOVERNANCE_DECISION_SCHEMA_ID = "https://market-design-engine.dev/schemas/admin-governance/governance-decision.schema.json";

export const governanceDecisionSchema = {
  $id: GOVERNANCE_DECISION_SCHEMA_ID,
  $schema: "https://json-schema.org/draft/2020-12/schema",
  type: "object",
  additionalProperties: false,
  required: [
    "id",
    "version",
    "module_id",
    "operation_key",
    "status",
    "decided_by",
    "decided_at",
    "audit_ref",
    "reasons",
    "metadata",
  ],
  properties: {
    id: { type: "string", pattern: "^agd_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$" },
    version: { type: "string", pattern: "^v\\d+\\.\\d+\\.\\d+$" },
    module_id: { type: "string", pattern: "^agm_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$" },
    operation_key: { type: "string", minLength: 1 },
    status: { type: "string", enum: Object.values(GovernanceDecisionStatus) },
    decided_by: { type: "string", minLength: 1 },
    decided_at: { type: "string", format: "date-time" },
    audit_ref: { type: "string", minLength: 1 },
    reasons: { type: "array", items: { type: "string", minLength: 1 } },
    metadata: { type: "object", additionalProperties: { type: "string" } },
  },
} as const;
