import { ActionType } from "../enums/action-type.enum.js";
import { ReasonCode } from "../enums/reason-code.enum.js";

export const AUDIT_RECORD_SCHEMA_ID =
  "https://market-design-engine.dev/schemas/editorial/audit-record.schema.json";

export const auditRecordSchema = {
  $id: AUDIT_RECORD_SCHEMA_ID,
  $schema: "https://json-schema.org/draft/2020-12/schema",
  type: "object",
  additionalProperties: false,
  required: [
    "id",
    "version",
    "actor_id",
    "action_type",
    "target_type",
    "target_id",
    "action_timestamp",
    "action_payload_summary",
    "reason_codes",
    "correlation_id",
  ],
  properties: {
    id: { type: "string", pattern: "^aud_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$" },
    version: { type: "integer", minimum: 1 },
    actor_id: { type: "string", pattern: "^actor_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$" },
    action_type: { type: "string", enum: Object.values(ActionType) },
    target_type: { type: "string", minLength: 1 },
    target_id: { type: "string", minLength: 1 },
    action_timestamp: { type: "string", format: "date-time" },
    action_payload_summary: { type: "string", minLength: 8 },
    reason_codes: {
      type: "array",
      minItems: 1,
      items: { type: "string", enum: Object.values(ReasonCode) },
    },
    correlation_id: { type: "string", pattern: "^corr_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$" },
  },
} as const;
