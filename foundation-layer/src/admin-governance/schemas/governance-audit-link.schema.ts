import { AuditLinkType } from "../enums/audit-link-type.enum.js";

export const GOVERNANCE_AUDIT_LINK_SCHEMA_ID = "https://market-design-engine.dev/schemas/admin-governance/governance-audit-link.schema.json";

export const governanceAuditLinkSchema = {
  $id: GOVERNANCE_AUDIT_LINK_SCHEMA_ID,
  $schema: "https://json-schema.org/draft/2020-12/schema",
  type: "object",
  additionalProperties: false,
  required: ["id", "version", "audit_ref", "link_type", "decision_ref_nullable", "override_ref_nullable", "metadata"],
  properties: {
    id: { type: "string", pattern: "^aga_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$" },
    version: { type: "string", pattern: "^v\\d+\\.\\d+\\.\\d+$" },
    audit_ref: { type: "string", minLength: 1 },
    link_type: { type: "string", enum: Object.values(AuditLinkType) },
    decision_ref_nullable: { anyOf: [{ type: "null" }, { type: "string", pattern: "^agd_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$" }] },
    override_ref_nullable: { anyOf: [{ type: "null" }, { type: "string", pattern: "^ago_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$" }] },
    metadata: { type: "object", additionalProperties: { type: "string" } },
  },
} as const;
