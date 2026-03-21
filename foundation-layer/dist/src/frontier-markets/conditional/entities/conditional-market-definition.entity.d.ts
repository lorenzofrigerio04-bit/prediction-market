import type { EntityVersion } from "../../../value-objects/entity-version.vo.js";
import type { DeadlineResolution } from "../../../market-design/deadlines/entities/deadline-resolution.entity.js";
import type { ContractType } from "../../../market-design/enums/contract-type.enum.js";
import { ActivationPolicy } from "../../enums/activation-policy.enum.js";
import { ConditionalValidationStatus } from "../../enums/conditional-validation-status.enum.js";
import { InvalidationPolicy } from "../../enums/invalidation-policy.enum.js";
import type { ConditionalMarketDefinitionId } from "../../value-objects/frontier-market-ids.vo.js";
import { type TriggerCondition } from "./trigger-condition.entity.js";
export type DependentOutcomeSchema = Readonly<{
    schema_version: string;
    required_outcome_keys: readonly string[];
}>;
export type ConditionalMarketDefinitionMetadata = Readonly<Record<string, string | number | boolean | null>>;
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
export declare const createConditionalMarketDefinition: (input: ConditionalMarketDefinition) => ConditionalMarketDefinition;
//# sourceMappingURL=conditional-market-definition.entity.d.ts.map