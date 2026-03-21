import { ValidationError } from "../../common/errors/validation-error.js";
const normalize = (value) => value.trim().toLowerCase();
const validateDistinctNonEmpty = (values, field) => {
    const trimmed = values.map((value) => value.trim()).filter((value) => value.length > 0);
    if (trimmed.length !== values.length) {
        throw new ValidationError("INVALID_REASON_COLLECTION", `${field} must not include empty values`, {
            field,
        });
    }
    if (new Set(trimmed.map(normalize)).size !== trimmed.length) {
        throw new ValidationError("INVALID_REASON_COLLECTION", `${field} must contain unique values`, {
            field,
        });
    }
    return trimmed;
};
export const createBlockingReasons = (values) => validateDistinctNonEmpty(values, "blocking_reasons");
export const createRejectedContractTypes = (values) => validateDistinctNonEmpty(values, "rejected_contract_types");
//# sourceMappingURL=reason-collections.vo.js.map