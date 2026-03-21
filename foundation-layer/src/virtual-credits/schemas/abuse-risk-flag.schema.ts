import { RiskSeverity } from "../enums/risk-severity.enum.js";
import { RiskType } from "../enums/risk-type.enum.js";

export const ABUSE_RISK_FLAG_SCHEMA_ID = "https://market-design-engine.dev/schemas/virtual-credits/abuse-risk-flag.schema.json";

export const abuseRiskFlagSchema = {
  $id: ABUSE_RISK_FLAG_SCHEMA_ID,
  $schema: "https://json-schema.org/draft/2020-12/schema",
  type: "object",
  additionalProperties: false,
  required: [
    "id",
    "version",
    "target_owner_ref",
    "risk_type",
    "severity",
    "detected_at",
    "related_refs",
    "active",
    "mitigation_notes_nullable",
  ],
  properties: {
    id: { type: "string", pattern: "^var_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$" },
    version: { type: "string", pattern: "^v\\d+\\.\\d+\\.\\d+$" },
    target_owner_ref: { type: "string", minLength: 1 },
    risk_type: { type: "string", enum: Object.values(RiskType) },
    severity: { type: "string", enum: Object.values(RiskSeverity) },
    detected_at: { type: "string", format: "date-time" },
    related_refs: { type: "array", items: { type: "string", minLength: 1 } },
    active: { type: "boolean" },
    mitigation_notes_nullable: { type: ["string", "null"] },
  },
} as const;
