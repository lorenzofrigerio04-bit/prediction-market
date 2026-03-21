import type { Branded } from "../../common/types/branded.js";
import { ValidationError } from "../../common/errors/validation-error.js";

export type ContractVersion = Branded<string, "ContractVersion">;

const VERSION_PATTERN = /^v?[0-9]+\.[0-9]+\.[0-9]+$/;

export const createContractVersion = (value: string): ContractVersion => {
  const normalized = value.trim();
  if (!VERSION_PATTERN.test(normalized)) {
    throw new ValidationError("INVALID_CONTRACT_VERSION", "contract version must be semver-like", {
      value,
    });
  }
  return normalized as ContractVersion;
};
