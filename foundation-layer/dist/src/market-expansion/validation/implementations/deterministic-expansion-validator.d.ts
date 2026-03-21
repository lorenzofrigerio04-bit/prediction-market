import { ExpansionValidationStatus } from "../../enums/expansion-validation-status.enum.js";
import type { ExpansionValidator, ExpansionValidatorInput } from "../interfaces/expansion-validator.js";
export declare class DeterministicExpansionValidator implements ExpansionValidator {
    validate(input: ExpansionValidatorInput): Readonly<{
        id: import("../../index.js").ExpansionValidationReportId;
        version: import("../../../index.js").EntityVersion;
        family_id: import("../../index.js").MarketFamilyId;
        validation_status: ExpansionValidationStatus;
        blocking_issues: readonly import("../../index.js").ExpansionNote[];
        warnings: readonly import("../../index.js").ExpansionNote[];
        checked_invariants: readonly import("../entities/expansion-validation-report.entity.js").CheckedInvariant[];
        compatibility_notes: readonly import("../../index.js").ExpansionNote[];
    }>;
}
//# sourceMappingURL=deterministic-expansion-validator.d.ts.map