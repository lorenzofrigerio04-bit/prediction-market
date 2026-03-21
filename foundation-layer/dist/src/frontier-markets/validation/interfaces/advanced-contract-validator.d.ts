import { ContractType } from "../../../market-design/enums/contract-type.enum.js";
import type { ConditionalMarketDefinition } from "../../conditional/entities/conditional-market-definition.entity.js";
import type { RaceMarketDefinition } from "../../race/entities/race-market-definition.entity.js";
import type { SequenceMarketDefinition } from "../../sequence/entities/sequence-market-definition.entity.js";
import type { AdvancedContractValidationReport } from "../entities/advanced-contract-validation-report.entity.js";
export type AdvancedContractInput = Readonly<{
    contract_type: ContractType.RACE;
    payload: RaceMarketDefinition;
}> | Readonly<{
    contract_type: ContractType.SEQUENCE;
    payload: SequenceMarketDefinition;
}> | Readonly<{
    contract_type: ContractType.CONDITIONAL;
    payload: ConditionalMarketDefinition;
}>;
export interface AdvancedContractValidator {
    validate(input: AdvancedContractInput): AdvancedContractValidationReport;
}
//# sourceMappingURL=advanced-contract-validator.d.ts.map