import { ValidationError } from "../../common/errors/validation-error.js";
import { deepFreeze } from "../../common/utils/deep-freeze.js";

export type JurisdictionCandidate = Readonly<{
  code: string;
  confidence: number;
}>;

export const createJurisdictionCandidate = (
  code: string,
  confidence: number,
): JurisdictionCandidate => {
  const normalizedCode = code.trim().toUpperCase();
  if (!/^[A-Z]{2,8}$/.test(normalizedCode)) {
    throw new ValidationError(
      "INVALID_JURISDICTION_CANDIDATE",
      "Jurisdiction code must be 2..8 uppercase letters",
      { code },
    );
  }
  if (!Number.isFinite(confidence) || confidence < 0 || confidence > 1) {
    throw new ValidationError(
      "INVALID_JURISDICTION_CANDIDATE",
      "Jurisdiction confidence must be within [0,1]",
      { confidence },
    );
  }
  return deepFreeze({
    code: normalizedCode,
    confidence,
  });
};
