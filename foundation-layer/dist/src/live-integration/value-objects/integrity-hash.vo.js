import { ValidationError } from "../../common/errors/validation-error.js";
import { assertNonEmpty } from "../../common/utils/normalization.js";
const SHA256_PATTERN = /^([a-fA-F0-9]{64}|sha256:[a-fA-F0-9]{64})$/;
export const createIntegrityHash = (value) => {
    const normalized = assertNonEmpty(value, "integrity_hash");
    if (!SHA256_PATTERN.test(normalized)) {
        throw new ValidationError("INVALID_INTEGRITY_HASH", "integrity_hash must be sha256-like", {
            value: normalized,
        });
    }
    return normalized;
};
//# sourceMappingURL=integrity-hash.vo.js.map