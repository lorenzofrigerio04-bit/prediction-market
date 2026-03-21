import { ContractType } from "../../market-design/enums/contract-type.enum.js";
import { ActivationPolicy } from "../enums/activation-policy.enum.js";
import { ConditionalValidationStatus } from "../enums/conditional-validation-status.enum.js";
import { InvalidationPolicy } from "../enums/invalidation-policy.enum.js";

export const CONDITIONAL_MARKET_DEFINITION_SCHEMA_ID =
  "https://market-design-engine.dev/schemas/frontier-markets/conditional-market-definition.schema.json";

export const conditionalMarketDefinitionSchema = {
  $id: CONDITIONAL_MARKET_DEFINITION_SCHEMA_ID,
  $schema: "https://json-schema.org/draft/2020-12/schema",
  type: "object",
  additionalProperties: false,
  required: [
    "id",
    "version",
    "trigger_condition",
    "dependent_contract_type",
    "dependent_outcome_schema",
    "activation_policy",
    "invalidation_policy",
    "deadline_resolution",
    "conditional_validation_status",
    "metadata",
  ],
  properties: {
    id: { type: "string", pattern: "^fco_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$" },
    version: { type: "integer", minimum: 1 },
    trigger_condition: {
      $ref: "https://market-design-engine.dev/schemas/frontier-markets/trigger-condition.schema.json",
    },
    dependent_contract_type: { type: "string", enum: Object.values(ContractType) },
    dependent_outcome_schema: {
      type: "object",
      additionalProperties: false,
      required: ["schema_version", "required_outcome_keys"],
      properties: {
        schema_version: { type: "string", minLength: 1 },
        required_outcome_keys: {
          type: "array",
          minItems: 1,
          items: { type: "string", minLength: 1 },
        },
      },
    },
    activation_policy: { type: "string", enum: Object.values(ActivationPolicy) },
    invalidation_policy: { type: "string", enum: Object.values(InvalidationPolicy) },
    deadline_resolution: {
      $ref: "https://market-design-engine.dev/schemas/market-design/deadline-resolution.schema.json",
    },
    conditional_validation_status: {
      type: "string",
      enum: Object.values(ConditionalValidationStatus),
    },
    metadata: {
      type: "object",
      additionalProperties: {
        type: ["string", "number", "boolean", "null"],
      },
    },
  },
} as const;
