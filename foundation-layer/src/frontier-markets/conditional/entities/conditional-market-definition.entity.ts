import { ValidationError } from "../../../common/errors/validation-error.js";
import { deepFreeze } from "../../../common/utils/deep-freeze.js";
import type { EntityVersion } from "../../../value-objects/entity-version.vo.js";
import type { DeadlineResolution } from "../../../market-design/deadlines/entities/deadline-resolution.entity.js";
import type { ContractType } from "../../../market-design/enums/contract-type.enum.js";
import { ActivationPolicy } from "../../enums/activation-policy.enum.js";
import { ConditionalValidationStatus } from "../../enums/conditional-validation-status.enum.js";
import { InvalidationPolicy } from "../../enums/invalidation-policy.enum.js";
import type { ConditionalMarketDefinitionId } from "../../value-objects/frontier-market-ids.vo.js";
import { createTriggerCondition, type TriggerCondition } from "./trigger-condition.entity.js";

export type DependentOutcomeSchema = Readonly<{
  schema_version: string;
  required_outcome_keys: readonly string[];
}>;

export type ConditionalMarketDefinitionMetadata = Readonly<
  Record<string, string | number | boolean | null>
>;

export type ConditionalMarketDefinition = Readonly<{
  id: ConditionalMarketDefinitionId;
  version: EntityVersion;
  trigger_condition: TriggerCondition;
  dependent_contract_type: ContractType;
  dependent_outcome_schema: DependentOutcomeSchema;
  activation_policy: ActivationPolicy;
  invalidation_policy: InvalidationPolicy;
  deadline_resolution: DeadlineResolution;
  conditional_validation_status: ConditionalValidationStatus;
  metadata: ConditionalMarketDefinitionMetadata;
}>;

export const createConditionalMarketDefinition = (
  input: ConditionalMarketDefinition,
): ConditionalMarketDefinition => {
  if (!Object.values(ActivationPolicy).includes(input.activation_policy)) {
    throw new ValidationError("INVALID_CONDITIONAL_MARKET_DEFINITION", "activation_policy is invalid");
  }
  if (!Object.values(InvalidationPolicy).includes(input.invalidation_policy)) {
    throw new ValidationError("INVALID_CONDITIONAL_MARKET_DEFINITION", "invalidation_policy is invalid");
  }
  if (!Object.values(ConditionalValidationStatus).includes(input.conditional_validation_status)) {
    throw new ValidationError(
      "INVALID_CONDITIONAL_MARKET_DEFINITION",
      "conditional_validation_status is invalid",
    );
  }
  if (input.dependent_outcome_schema.schema_version.trim().length === 0) {
    throw new ValidationError(
      "INVALID_CONDITIONAL_MARKET_DEFINITION",
      "dependent_outcome_schema.schema_version must be non-empty",
    );
  }
  if (input.dependent_outcome_schema.required_outcome_keys.length === 0) {
    throw new ValidationError(
      "INVALID_CONDITIONAL_MARKET_DEFINITION",
      "dependent_outcome_schema.required_outcome_keys must not be empty",
    );
  }
  return deepFreeze({
    ...input,
    trigger_condition: createTriggerCondition(input.trigger_condition),
    dependent_outcome_schema: {
      ...input.dependent_outcome_schema,
      schema_version: input.dependent_outcome_schema.schema_version.trim(),
      required_outcome_keys: [...input.dependent_outcome_schema.required_outcome_keys],
    },
    metadata: { ...input.metadata },
  });
};
