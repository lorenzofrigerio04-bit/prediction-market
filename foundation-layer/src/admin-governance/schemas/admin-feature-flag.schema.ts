import { FeatureFlagDefaultState } from "../enums/feature-flag-default-state.enum.js";
import { SafetyControlLevel } from "../enums/safety-control-level.enum.js";

export const ADMIN_FEATURE_FLAG_SCHEMA_ID = "https://market-design-engine.dev/schemas/admin-governance/admin-feature-flag.schema.json";

export const adminFeatureFlagSchema = {
  $id: ADMIN_FEATURE_FLAG_SCHEMA_ID,
  $schema: "https://json-schema.org/draft/2020-12/schema",
  type: "object",
  additionalProperties: false,
  required: [
    "id",
    "version",
    "flag_key",
    "module_id",
    "source_id_nullable",
    "default_state",
    "enabled",
    "safety_level",
    "owner_ref",
    "audit_ref",
    "metadata",
  ],
  properties: {
    id: { type: "string", pattern: "^agf_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$" },
    version: { type: "string", pattern: "^v\\d+\\.\\d+\\.\\d+$" },
    flag_key: { type: "string", minLength: 1 },
    module_id: { type: "string", pattern: "^agm_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$" },
    source_id_nullable: { anyOf: [{ type: "null" }, { type: "string", pattern: "^ags_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$" }] },
    default_state: { type: "string", enum: Object.values(FeatureFlagDefaultState) },
    enabled: { type: "boolean" },
    safety_level: { type: "string", enum: Object.values(SafetyControlLevel) },
    owner_ref: { type: "string", minLength: 1 },
    audit_ref: { type: "string", minLength: 1 },
    metadata: { type: "object", additionalProperties: { type: "string" } },
  },
} as const;
