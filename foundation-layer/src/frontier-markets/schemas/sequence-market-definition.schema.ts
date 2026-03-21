import { CompletionPolicy } from "../enums/completion-policy.enum.js";
import { RequiredOrderPolicy } from "../enums/required-order-policy.enum.js";
import { SequenceValidationStatus } from "../enums/sequence-validation-status.enum.js";

export const SEQUENCE_MARKET_DEFINITION_SCHEMA_ID =
  "https://market-design-engine.dev/schemas/frontier-markets/sequence-market-definition.schema.json";

export const sequenceMarketDefinitionSchema = {
  $id: SEQUENCE_MARKET_DEFINITION_SCHEMA_ID,
  $schema: "https://json-schema.org/draft/2020-12/schema",
  type: "object",
  additionalProperties: false,
  required: [
    "id",
    "version",
    "parent_event_graph_context_id",
    "sequence_targets",
    "required_order_policy",
    "completion_policy",
    "deadline_resolution",
    "sequence_validation_status",
    "metadata",
  ],
  properties: {
    id: { type: "string", pattern: "^fse_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$" },
    version: { type: "integer", minimum: 1 },
    parent_event_graph_context_id: {
      type: "string",
      pattern: "^egnd_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$",
    },
    sequence_targets: {
      type: "array",
      minItems: 2,
      items: {
        $ref: "https://market-design-engine.dev/schemas/frontier-markets/sequence-target.schema.json",
      },
    },
    required_order_policy: { type: "string", enum: Object.values(RequiredOrderPolicy) },
    completion_policy: { type: "string", enum: Object.values(CompletionPolicy) },
    deadline_resolution: {
      $ref: "https://market-design-engine.dev/schemas/market-design/deadline-resolution.schema.json",
    },
    sequence_validation_status: { type: "string", enum: Object.values(SequenceValidationStatus) },
    metadata: {
      type: "object",
      additionalProperties: {
        type: ["string", "number", "boolean", "null"],
      },
    },
  },
} as const;
