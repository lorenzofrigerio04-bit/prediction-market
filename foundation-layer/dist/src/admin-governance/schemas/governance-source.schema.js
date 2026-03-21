import { GovernanceSourceType } from "../enums/governance-source-type.enum.js";
export const GOVERNANCE_SOURCE_SCHEMA_ID = "https://market-design-engine.dev/schemas/admin-governance/governance-source.schema.json";
export const governanceSourceSchema = {
    $id: GOVERNANCE_SOURCE_SCHEMA_ID,
    $schema: "https://json-schema.org/draft/2020-12/schema",
    type: "object",
    additionalProperties: false,
    required: ["id", "version", "source_key", "source_type", "trust_weight", "active", "metadata"],
    properties: {
        id: { type: "string", pattern: "^ags_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$" },
        version: { type: "string", pattern: "^v\\d+\\.\\d+\\.\\d+$" },
        source_key: { type: "string", minLength: 1 },
        source_type: { type: "string", enum: Object.values(GovernanceSourceType) },
        trust_weight: { type: "number" },
        active: { type: "boolean" },
        metadata: { type: "object", additionalProperties: { type: "string" } },
    },
};
//# sourceMappingURL=governance-source.schema.js.map