import { ValidationError } from "../../../common/errors/validation-error.js";
import { deepFreeze } from "../../../common/utils/deep-freeze.js";
import { ExpansionValidationStatus } from "../../enums/expansion-validation-status.enum.js";
import { createExpansionNote } from "../../value-objects/market-expansion-shared.vo.js";
export const createExpansionValidationReport = (input) => {
    if (!Object.values(ExpansionValidationStatus).includes(input.validation_status)) {
        throw new ValidationError("INVALID_EXPANSION_VALIDATION_REPORT", "validation_status is invalid");
    }
    if (input.validation_status === ExpansionValidationStatus.INVALID &&
        input.blocking_issues.length === 0) {
        throw new ValidationError("INVALID_EXPANSION_VALIDATION_REPORT", "invalid validation_status requires blocking issues");
    }
    return deepFreeze({
        ...input,
        blocking_issues: input.blocking_issues.map(createExpansionNote),
        warnings: input.warnings.map(createExpansionNote),
        checked_invariants: deepFreeze(input.checked_invariants.map((invariant) => deepFreeze({
            code: invariant.code,
            passed: invariant.passed,
            description: invariant.description,
        }))),
        compatibility_notes: input.compatibility_notes.map(createExpansionNote),
    });
};
//# sourceMappingURL=expansion-validation-report.entity.js.map