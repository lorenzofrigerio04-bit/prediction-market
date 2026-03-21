import { SignalType } from "../enums/signal-type.enum.js";

export const FEEDBACK_SIGNAL_SCHEMA_ID =
  "https://market-design-engine.dev/schemas/learning-feedback/feedback-signal.schema.json";

export const feedbackSignalSchema = {
  $id: FEEDBACK_SIGNAL_SCHEMA_ID,
  $schema: "https://json-schema.org/draft/2020-12/schema",
  type: "object",
  additionalProperties: false,
  required: ["signal_type", "payload"],
  properties: {
    signal_type: { type: "string", enum: Object.values(SignalType) },
    payload: { type: "object" },
  },
} as const;
