import { ActivationPolicy } from "../../enums/activation-policy.enum.js";
import { ConditionalValidationStatus } from "../../enums/conditional-validation-status.enum.js";
import { InvalidationPolicy } from "../../enums/invalidation-policy.enum.js";
import type { ConditionalContractBuilder, ConditionalContractBuilderInput } from "../interfaces/conditional-contract-builder.js";
export declare class DeterministicConditionalContractBuilder implements ConditionalContractBuilder {
    build(input: ConditionalContractBuilderInput): Readonly<{
        id: import("../../index.js").ConditionalMarketDefinitionId;
        version: import("../../../index.js").EntityVersion;
        trigger_condition: import("../entities/trigger-condition.entity.js").TriggerCondition;
        dependent_contract_type: import("../../../index.js").ContractType;
        dependent_outcome_schema: import("../entities/conditional-market-definition.entity.js").DependentOutcomeSchema;
        activation_policy: ActivationPolicy;
        invalidation_policy: InvalidationPolicy;
        deadline_resolution: import("../../../index.js").DeadlineResolution;
        conditional_validation_status: ConditionalValidationStatus;
        metadata: import("../entities/conditional-market-definition.entity.js").ConditionalMarketDefinitionMetadata;
    }>;
}
//# sourceMappingURL=deterministic-conditional-contract-builder.d.ts.map