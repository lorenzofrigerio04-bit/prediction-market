import { StrategyType } from "../enums/strategy-type.enum.js";
import { ContractType } from "../../market-design/enums/contract-type.enum.js";

export const EXPANSION_STRATEGY_SCHEMA_ID =
  "https://market-design-engine.dev/schemas/market-expansion/expansion-strategy.schema.json";

export const expansionStrategySchema = {
  $id: EXPANSION_STRATEGY_SCHEMA_ID,
  $schema: "https://json-schema.org/draft/2020-12/schema",
  type: "object",
  additionalProperties: false,
  required: [
    "id",
    "version",
    "source_context_ref",
    "strategy_type",
    "allowed_contract_types",
    "max_satellite_count",
    "max_derivative_count",
    "anti_cannibalization_policy",
    "expansion_notes_nullable",
  ],
  properties: {
    id: { type: "string", pattern: "^mes_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$" },
    version: { type: "integer", minimum: 1 },
    source_context_ref: { type: "string", minLength: 1 },
    strategy_type: { type: "string", enum: Object.values(StrategyType) },
    allowed_contract_types: {
      type: "array",
      minItems: 1,
      uniqueItems: true,
      items: { type: "string", enum: Object.values(ContractType) },
    },
    max_satellite_count: { type: "integer", minimum: 0 },
    max_derivative_count: { type: "integer", minimum: 0 },
    anti_cannibalization_policy: { type: "string", minLength: 1 },
    expansion_notes_nullable: { anyOf: [{ type: "null" }, { type: "string", minLength: 1 }] },
  },
} as const;
