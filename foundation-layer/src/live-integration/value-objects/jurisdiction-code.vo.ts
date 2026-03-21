import { ValidationError } from "../../common/errors/validation-error.js";
import type { Branded } from "../../common/types/branded.js";

export type JurisdictionCode = Branded<string, "JurisdictionCode">;

const JURISDICTION_PATTERN = /^[A-Z]{2,3}$/;

export const createJurisdictionCode = (value: string): JurisdictionCode => {
  const normalized = value.trim().toUpperCase();
  if (!JURISDICTION_PATTERN.test(normalized)) {
    throw new ValidationError(
      "INVALID_JURISDICTION_CODE",
      "jurisdiction must be a 2-3 letter uppercase code",
      { value },
    );
  }
  return normalized as JurisdictionCode;
};
