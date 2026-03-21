import { CounterType } from "../enums/counter-type.enum.js";
import { MeasurementWindowUnit } from "../enums/measurement-window-unit.enum.js";

export const USAGE_COUNTER_SCHEMA_ID = "https://market-design-engine.dev/schemas/virtual-credits/usage-counter.schema.json";

export const usageCounterSchema = {
  $id: USAGE_COUNTER_SCHEMA_ID,
  $schema: "https://json-schema.org/draft/2020-12/schema",
  type: "object",
  additionalProperties: false,
  required: ["id", "version", "owner_ref", "counter_type", "measured_value", "measurement_window", "updated_at", "consistency_notes_nullable"],
  properties: {
    id: { type: "string", pattern: "^vuc_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$" },
    version: { type: "string", pattern: "^v\\d+\\.\\d+\\.\\d+$" },
    owner_ref: { type: "string", minLength: 1 },
    counter_type: { type: "string", enum: Object.values(CounterType) },
    measured_value: { type: "number" },
    measurement_window: {
      type: "object",
      additionalProperties: false,
      required: ["unit", "size"],
      properties: {
        unit: { type: "string", enum: Object.values(MeasurementWindowUnit) },
        size: { type: "integer", minimum: 1 },
      },
    },
    updated_at: { type: "string", format: "date-time" },
    consistency_notes_nullable: { type: ["string", "null"] },
  },
} as const;
