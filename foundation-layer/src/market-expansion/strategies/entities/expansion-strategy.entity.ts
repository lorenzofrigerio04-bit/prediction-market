import { ValidationError } from "../../../common/errors/validation-error.js";
import { deepFreeze } from "../../../common/utils/deep-freeze.js";
import type { EntityVersion } from "../../../value-objects/entity-version.vo.js";
import { ContractType } from "../../../market-design/enums/contract-type.enum.js";
import { StrategyType } from "../../enums/strategy-type.enum.js";
import type { ExpansionStrategyId } from "../../value-objects/market-expansion-ids.vo.js";
import {
  createAntiCannibalizationPolicy,
  createExpansionNote,
  createSourceContextRef,
  type AntiCannibalizationPolicy,
  type ExpansionNote,
  type SourceContextRef,
} from "../../value-objects/market-expansion-shared.vo.js";

export type ExpansionStrategy = Readonly<{
  id: ExpansionStrategyId;
  version: EntityVersion;
  source_context_ref: SourceContextRef;
  strategy_type: StrategyType;
  allowed_contract_types: readonly ContractType[];
  max_satellite_count: number;
  max_derivative_count: number;
  anti_cannibalization_policy: AntiCannibalizationPolicy;
  expansion_notes_nullable: ExpansionNote | null;
}>;

export const createExpansionStrategy = (input: ExpansionStrategy): ExpansionStrategy => {
  if (!Object.values(StrategyType).includes(input.strategy_type)) {
    throw new ValidationError("INVALID_EXPANSION_STRATEGY", "strategy_type is invalid");
  }
  if (input.allowed_contract_types.length === 0) {
    throw new ValidationError(
      "INVALID_EXPANSION_STRATEGY",
      "allowed_contract_types must contain at least one contract type",
    );
  }
  if (new Set(input.allowed_contract_types).size !== input.allowed_contract_types.length) {
    throw new ValidationError(
      "INVALID_EXPANSION_STRATEGY",
      "allowed_contract_types must not contain duplicates",
    );
  }
  if (!Number.isInteger(input.max_satellite_count) || input.max_satellite_count < 0) {
    throw new ValidationError(
      "INVALID_EXPANSION_STRATEGY",
      "max_satellite_count must be an integer >= 0",
    );
  }
  if (!Number.isInteger(input.max_derivative_count) || input.max_derivative_count < 0) {
    throw new ValidationError(
      "INVALID_EXPANSION_STRATEGY",
      "max_derivative_count must be an integer >= 0",
    );
  }
  return deepFreeze({
    ...input,
    source_context_ref: createSourceContextRef(input.source_context_ref),
    anti_cannibalization_policy: createAntiCannibalizationPolicy(input.anti_cannibalization_policy),
    expansion_notes_nullable:
      input.expansion_notes_nullable === null ? null : createExpansionNote(input.expansion_notes_nullable),
  });
};
