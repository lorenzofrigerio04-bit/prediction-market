import { ActivationPolicy } from "../../enums/activation-policy.enum.js";
import { ConditionalValidationStatus } from "../../enums/conditional-validation-status.enum.js";
import { InvalidationPolicy } from "../../enums/invalidation-policy.enum.js";
import { createConditionalMarketDefinition } from "../entities/conditional-market-definition.entity.js";
import type {
  ConditionalContractBuilder,
  ConditionalContractBuilderInput,
} from "../interfaces/conditional-contract-builder.js";
import { createConditionalMarketDefinitionId } from "../../value-objects/frontier-market-ids.vo.js";

export class DeterministicConditionalContractBuilder implements ConditionalContractBuilder {
  build(input: ConditionalContractBuilderInput) {
    const hasTrigger = input.trigger_condition.triggering_outcome.trim().length > 0;
    const status = hasTrigger
      ? input.conditional_validation_status ?? ConditionalValidationStatus.TRIGGER_PENDING
      : ConditionalValidationStatus.INVALID;
    return createConditionalMarketDefinition({
      id: createConditionalMarketDefinitionId(input.id),
      version: input.version,
      trigger_condition: input.trigger_condition,
      dependent_contract_type: input.dependent_contract_type,
      dependent_outcome_schema: input.dependent_outcome_schema,
      activation_policy: input.activation_policy ?? ActivationPolicy.EXPLICIT_TRIGGER_ONLY,
      invalidation_policy: input.invalidation_policy ?? InvalidationPolicy.INVALIDATE_IF_TRIGGER_FAILS,
      deadline_resolution: input.deadline_resolution,
      conditional_validation_status: status,
      metadata: input.metadata ?? {},
    });
  }
}
