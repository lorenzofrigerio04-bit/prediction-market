import type { EntityVersion } from "../../../value-objects/entity-version.vo.js";
import type { ContractType } from "../../../market-design/enums/contract-type.enum.js";
import type { DeadlineResolution } from "../../../market-design/deadlines/entities/deadline-resolution.entity.js";
import type { ActivationPolicy } from "../../enums/activation-policy.enum.js";
import type { ConditionalValidationStatus } from "../../enums/conditional-validation-status.enum.js";
import type { InvalidationPolicy } from "../../enums/invalidation-policy.enum.js";
import type { ConditionalMarketDefinition, DependentOutcomeSchema } from "../entities/conditional-market-definition.entity.js";
import type { TriggerCondition } from "../entities/trigger-condition.entity.js";

export type ConditionalContractBuilderInput = Readonly<{
  id: string;
  version: EntityVersion;
  trigger_condition: TriggerCondition;
  dependent_contract_type: ContractType;
  dependent_outcome_schema: DependentOutcomeSchema;
  activation_policy: ActivationPolicy;
  invalidation_policy: InvalidationPolicy;
  deadline_resolution: DeadlineResolution;
  conditional_validation_status?: ConditionalValidationStatus;
  metadata?: Readonly<Record<string, string | number | boolean | null>>;
}>;

export interface ConditionalContractBuilder {
  build(input: ConditionalContractBuilderInput): ConditionalMarketDefinition;
}
