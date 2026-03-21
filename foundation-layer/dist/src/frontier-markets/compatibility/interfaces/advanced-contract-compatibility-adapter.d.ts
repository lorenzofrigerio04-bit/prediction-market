import type { ConditionalMarketDefinition } from "../../conditional/entities/conditional-market-definition.entity.js";
import type { RaceMarketDefinition } from "../../race/entities/race-market-definition.entity.js";
import type { SequenceMarketDefinition } from "../../sequence/entities/sequence-market-definition.entity.js";
import type { AdvancedMarketCompatibilityResult } from "../entities/advanced-market-compatibility-result.entity.js";
import type { AdvancedContractValidationReport } from "../../validation/entities/advanced-contract-validation-report.entity.js";
export type FrontierContract = RaceMarketDefinition | SequenceMarketDefinition | ConditionalMarketDefinition;
export interface AdvancedContractCompatibilityAdapter {
    adapt(contract: FrontierContract, validation_report?: AdvancedContractValidationReport): AdvancedMarketCompatibilityResult;
}
//# sourceMappingURL=advanced-contract-compatibility-adapter.d.ts.map