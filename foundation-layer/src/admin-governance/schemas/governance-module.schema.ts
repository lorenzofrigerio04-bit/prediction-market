import { GovernanceModuleStatus } from "../enums/governance-module-status.enum.js";

export const GOVERNANCE_MODULE_SCHEMA_ID = "https://market-design-engine.dev/schemas/admin-governance/governance-module.schema.json";

export const governanceModuleSchema = {
  $id: GOVERNANCE_MODULE_SCHEMA_ID,
  $schema: "https://json-schema.org/draft/2020-12/schema",
  type: "object",
  additionalProperties: false,
  required: ["id", "version", "module_key", "status", "supported_operations", "metadata"],
  properties: {
    id: { type: "string", pattern: "^agm_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$" },
    version: { type: "string", pattern: "^v\\d+\\.\\d+\\.\\d+$" },
    module_key: { type: "string", minLength: 1 },
    status: { type: "string", enum: Object.values(GovernanceModuleStatus) },
    supported_operations: { type: "array", items: { type: "string", minLength: 1 } },
    metadata: { type: "object", additionalProperties: { type: "string" } },
  },
} as const;
