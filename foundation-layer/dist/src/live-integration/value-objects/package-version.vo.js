import { ValidationError } from "../../common/errors/validation-error.js";
const VERSION_PATTERN = /^v?[0-9]+\.[0-9]+\.[0-9]+$/;
export const createPackageVersion = (value) => {
    const normalized = value.trim();
    if (!VERSION_PATTERN.test(normalized)) {
        throw new ValidationError("INVALID_PACKAGE_VERSION", "package version must be semver-like", {
            value,
        });
    }
    return normalized;
};
//# sourceMappingURL=package-version.vo.js.map