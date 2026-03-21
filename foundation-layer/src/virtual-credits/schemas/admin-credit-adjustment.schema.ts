import { AdjustmentType } from "../enums/adjustment-type.enum.js";
import { AppliedStatus } from "../enums/applied-status.enum.js";

export const ADMIN_CREDIT_ADJUSTMENT_SCHEMA_ID = "https://market-design-engine.dev/schemas/virtual-credits/admin-credit-adjustment.schema.json";

export const adminCreditAdjustmentSchema = {
  $id: ADMIN_CREDIT_ADJUSTMENT_SCHEMA_ID,
  $schema: "https://json-schema.org/draft/2020-12/schema",
  type: "object",
  additionalProperties: false,
  required: [
    "id",
    "version",
    "target_account_id",
    "adjustment_type",
    "amount_delta",
    "initiated_by",
    "initiated_at",
    "adjustment_reason",
    "audit_ref",
    "applied_status",
  ],
  properties: {
    id: { type: "string", pattern: "^vaa_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$" },
    version: { type: "string", pattern: "^v\\d+\\.\\d+\\.\\d+$" },
    target_account_id: { type: "string", pattern: "^vca_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$" },
    adjustment_type: { type: "string", enum: Object.values(AdjustmentType) },
    amount_delta: { type: "number" },
    initiated_by: { type: "string", minLength: 1 },
    initiated_at: { type: "string", format: "date-time" },
    adjustment_reason: { type: "string", minLength: 1 },
    audit_ref: { type: "string", minLength: 1 },
    applied_status: { type: "string", enum: Object.values(AppliedStatus) },
  },
} as const;
