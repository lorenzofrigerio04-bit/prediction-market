import { OverrideStatus } from "../enums/override-status.enum.js";

export const OVERRIDE_REQUEST_SCHEMA_ID = "https://market-design-engine.dev/schemas/admin-governance/override-request.schema.json";

export const overrideRequestSchema = {
  $id: OVERRIDE_REQUEST_SCHEMA_ID,
  $schema: "https://json-schema.org/draft/2020-12/schema",
  type: "object",
  additionalProperties: false,
  required: [
    "id",
    "version",
    "module_key",
    "operation_key",
    "requested_by",
    "reason",
    "status",
    "requested_at",
    "expires_at_nullable",
    "resolved_by_nullable",
    "audit_ref",
    "metadata",
  ],
  properties: {
    id: { type: "string", pattern: "^ago_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$" },
    version: { type: "string", pattern: "^v\\d+\\.\\d+\\.\\d+$" },
    module_key: { type: "string", minLength: 1 },
    operation_key: { type: "string", minLength: 1 },
    requested_by: { type: "string", minLength: 1 },
    reason: { type: "string", minLength: 1 },
    status: { type: "string", enum: Object.values(OverrideStatus) },
    requested_at: { type: "string", format: "date-time" },
    expires_at_nullable: { anyOf: [{ type: "null" }, { type: "string", format: "date-time" }] },
    resolved_by_nullable: { anyOf: [{ type: "null" }, { type: "string", minLength: 1 }] },
    audit_ref: { type: "string", minLength: 1 },
    metadata: { type: "object", additionalProperties: { type: "string" } },
  },
} as const;
