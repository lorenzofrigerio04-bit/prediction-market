import { type FutureContractType } from "../../../market-design/enums/contract-type.enum.js";
import { AdvancedValidationStatus } from "../../enums/advanced-validation-status.enum.js";
import type { AdvancedContractValidationReportId } from "../../value-objects/frontier-market-ids.vo.js";
import { type InvariantCheck } from "../../value-objects/invariant-check.vo.js";
import { type CompatibilityNote } from "../../value-objects/frontier-text.vo.js";
export type ValidationMessage = Readonly<{
    code: string;
    message: string;
    path: string;
}>;
export type AdvancedContractValidationReport = Readonly<{
    id: AdvancedContractValidationReportId;
    contract_type: FutureContractType;
    validation_status: AdvancedValidationStatus;
    blocking_issues: readonly ValidationMessage[];
    warnings: readonly ValidationMessage[];
    checked_invariants: readonly InvariantCheck[];
    compatibility_notes: readonly CompatibilityNote[];
}>;
export declare const createAdvancedContractValidationReport: (input: AdvancedContractValidationReport) => AdvancedContractValidationReport;
//# sourceMappingURL=advanced-contract-validation-report.entity.d.ts.map