import { ConsumptionStatus } from "../enums/consumption-status.enum.js";

export const CREDIT_CONSUMPTION_EVENT_SCHEMA_ID = "https://market-design-engine.dev/schemas/virtual-credits/credit-consumption-event.schema.json";

export const creditConsumptionEventSchema = {
  $id: CREDIT_CONSUMPTION_EVENT_SCHEMA_ID,
  $schema: "https://json-schema.org/draft/2020-12/schema",
  type: "object",
  additionalProperties: false,
  required: [
    "id",
    "version",
    "account_id",
    "action_key",
    "consumption_amount",
    "consumed_at",
    "related_entity_ref_nullable",
    "quota_evaluation_ref_nullable",
    "consumption_status",
    "notes_nullable",
  ],
  properties: {
    id: { type: "string", pattern: "^vce_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$" },
    version: { type: "string", pattern: "^v\\d+\\.\\d+\\.\\d+$" },
    account_id: { type: "string", pattern: "^vca_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$" },
    action_key: { type: "string", minLength: 1 },
    consumption_amount: { type: "number" },
    consumed_at: { type: "string", format: "date-time" },
    related_entity_ref_nullable: { type: ["string", "null"] },
    quota_evaluation_ref_nullable: { type: ["string", "null"] },
    consumption_status: { type: "string", enum: Object.values(ConsumptionStatus) },
    notes_nullable: { type: ["string", "null"] },
  },
} as const;
