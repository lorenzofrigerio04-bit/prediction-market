import { ValidationError } from "../../../common/errors/validation-error.js";
import { deepFreeze } from "../../../common/utils/deep-freeze.js";
import { FUTURE_CONTRACT_TYPES, } from "../../../market-design/enums/contract-type.enum.js";
import { AdvancedValidationStatus } from "../../enums/advanced-validation-status.enum.js";
import { createInvariantCheck } from "../../value-objects/invariant-check.vo.js";
import { createCompatibilityNote } from "../../value-objects/frontier-text.vo.js";
const normalizeMessage = (input, field) => {
    if (input.code.trim().length === 0 || input.message.trim().length === 0 || input.path.trim().length === 0) {
        throw new ValidationError("INVALID_ADVANCED_VALIDATION_REPORT", `${field} entries must be non-empty`);
    }
    return {
        code: input.code.trim(),
        message: input.message.trim(),
        path: input.path.trim(),
    };
};
export const createAdvancedContractValidationReport = (input) => {
    const futureContractTypes = new Set(FUTURE_CONTRACT_TYPES);
    if (!futureContractTypes.has(input.contract_type)) {
        throw new ValidationError("INVALID_ADVANCED_VALIDATION_REPORT", "contract_type must be a frontier advanced contract type");
    }
    if (!Object.values(AdvancedValidationStatus).includes(input.validation_status)) {
        throw new ValidationError("INVALID_ADVANCED_VALIDATION_REPORT", "validation_status is invalid");
    }
    if (input.checked_invariants.length === 0) {
        throw new ValidationError("INVALID_ADVANCED_VALIDATION_REPORT", "checked_invariants must not be empty");
    }
    return deepFreeze({
        ...input,
        blocking_issues: input.blocking_issues.map((item) => normalizeMessage(item, "blocking_issues")),
        warnings: input.warnings.map((item) => normalizeMessage(item, "warnings")),
        checked_invariants: input.checked_invariants.map(createInvariantCheck),
        compatibility_notes: input.compatibility_notes.map(createCompatibilityNote),
    });
};
//# sourceMappingURL=advanced-contract-validation-report.entity.js.map