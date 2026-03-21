import { AccountOwnerScope } from "../enums/account-owner-scope.enum.js";
import { EnforcementMode } from "../enums/enforcement-mode.enum.js";
import { MeasurementWindowUnit } from "../enums/measurement-window-unit.enum.js";
import { QuotaType } from "../enums/quota-type.enum.js";

export const QUOTA_POLICY_SCHEMA_ID = "https://market-design-engine.dev/schemas/virtual-credits/quota-policy.schema.json";

export const quotaPolicySchema = {
  $id: QUOTA_POLICY_SCHEMA_ID,
  $schema: "https://json-schema.org/draft/2020-12/schema",
  type: "object",
  additionalProperties: false,
  required: ["id", "version", "policy_key", "target_scope", "quota_type", "max_amount", "window_definition", "enforcement_mode", "active"],
  properties: {
    id: { type: "string", pattern: "^vqp_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$" },
    version: { type: "string", pattern: "^v\\d+\\.\\d+\\.\\d+$" },
    policy_key: { type: "string", minLength: 1 },
    target_scope: { type: "string", enum: Object.values(AccountOwnerScope) },
    quota_type: { type: "string", enum: Object.values(QuotaType) },
    max_amount: { type: "number" },
    window_definition: {
      type: "object",
      additionalProperties: false,
      required: ["unit", "size"],
      properties: {
        unit: { type: "string", enum: Object.values(MeasurementWindowUnit) },
        size: { type: "integer", minimum: 1 },
      },
    },
    enforcement_mode: { type: "string", enum: Object.values(EnforcementMode) },
    active: { type: "boolean" },
  },
} as const;
