import { AdvancedValidationStatus } from "../../enums/advanced-validation-status.enum.js";
import type { AdvancedContractInput, AdvancedContractValidator } from "../interfaces/advanced-contract-validator.js";
export declare class DeterministicAdvancedContractValidator implements AdvancedContractValidator {
    validate(input: AdvancedContractInput): Readonly<{
        id: import("../../index.js").AdvancedContractValidationReportId;
        contract_type: import("../../../index.js").FutureContractType;
        validation_status: AdvancedValidationStatus;
        blocking_issues: readonly import("../entities/advanced-contract-validation-report.entity.js").ValidationMessage[];
        warnings: readonly import("../entities/advanced-contract-validation-report.entity.js").ValidationMessage[];
        checked_invariants: readonly import("../../index.js").InvariantCheck[];
        compatibility_notes: readonly import("../../index.js").CompatibilityNote[];
    }>;
}
//# sourceMappingURL=deterministic-advanced-contract-validator.d.ts.map