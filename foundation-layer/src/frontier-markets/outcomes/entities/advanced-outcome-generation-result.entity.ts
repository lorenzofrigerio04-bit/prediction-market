import { ValidationError } from "../../../common/errors/validation-error.js";
import { deepFreeze } from "../../../common/utils/deep-freeze.js";
import {
  FUTURE_CONTRACT_TYPES,
  type FutureContractType,
} from "../../../market-design/enums/contract-type.enum.js";
import type { OutcomeExclusivityPolicy } from "../../../market-design/enums/outcome-exclusivity-policy.enum.js";
import type { OutcomeExhaustivenessPolicy } from "../../../market-design/enums/outcome-exhaustiveness-policy.enum.js";
import { createOutcomeDefinition, type OutcomeDefinition } from "../../../market-design/outcomes/entities/outcome-definition.entity.js";
import {
  createGenerationConfidence,
  type GenerationConfidence,
} from "../../value-objects/generation-confidence.vo.js";
import type { AdvancedOutcomeGenerationResultId } from "../../value-objects/frontier-market-ids.vo.js";
import {
  createValidationNote,
  type ValidationNote,
} from "../../value-objects/frontier-text.vo.js";

export type AdvancedOutcomeGenerationResult = Readonly<{
  id: AdvancedOutcomeGenerationResultId;
  contract_type: FutureContractType;
  generated_outcomes: readonly OutcomeDefinition[];
  validation_notes: readonly ValidationNote[];
  exhaustiveness_policy: OutcomeExhaustivenessPolicy;
  exclusivity_policy: OutcomeExclusivityPolicy;
  generation_confidence: GenerationConfidence;
}>;

export const createAdvancedOutcomeGenerationResult = (
  input: AdvancedOutcomeGenerationResult,
): AdvancedOutcomeGenerationResult => {
  const futureContractTypes = new Set<FutureContractType>(FUTURE_CONTRACT_TYPES);
  if (!futureContractTypes.has(input.contract_type)) {
    throw new ValidationError(
      "INVALID_ADVANCED_OUTCOME_GENERATION",
      "contract_type must be a frontier advanced contract type",
    );
  }
  if (input.generated_outcomes.length === 0) {
    throw new ValidationError(
      "INVALID_ADVANCED_OUTCOME_GENERATION",
      "generated_outcomes must not be empty",
    );
  }
  const normalizedOutcomes = input.generated_outcomes.map(createOutcomeDefinition);
  return deepFreeze({
    ...input,
    generated_outcomes: normalizedOutcomes,
    validation_notes: input.validation_notes.map(createValidationNote),
    generation_confidence: createGenerationConfidence(input.generation_confidence),
  });
};
