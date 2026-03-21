import { ValidationError } from "../../common/errors/validation-error.js";
const VERSION_PATTERN = /^v?[0-9]+\.[0-9]+\.[0-9]+$/;
export const createContractVersion = (value) => {
    const normalized = value.trim();
    if (!VERSION_PATTERN.test(normalized)) {
        throw new ValidationError("INVALID_CONTRACT_VERSION", "contract version must be semver-like", {
            value,
        });
    }
    return normalized;
};
//# sourceMappingURL=contract-version.vo.js.map