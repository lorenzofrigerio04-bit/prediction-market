import type { Branded } from "../../common/types/branded.js";
import { ValidationError } from "../../common/errors/validation-error.js";

export type PackageVersion = Branded<string, "PackageVersion">;

const VERSION_PATTERN = /^v?[0-9]+\.[0-9]+\.[0-9]+$/;

export const createPackageVersion = (value: string): PackageVersion => {
  const normalized = value.trim();
  if (!VERSION_PATTERN.test(normalized)) {
    throw new ValidationError("INVALID_PACKAGE_VERSION", "package version must be semver-like", {
      value,
    });
  }
  return normalized as PackageVersion;
};
