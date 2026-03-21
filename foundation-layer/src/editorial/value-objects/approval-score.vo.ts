import { ValidationError } from "../../common/errors/validation-error.js";

export type ApprovalScore = number & { readonly __brand: "ApprovalScore" };

export const createApprovalScore = (value: number): ApprovalScore => {
  if (!Number.isFinite(value) || value < 0 || value > 100) {
    throw new ValidationError(
      "INVALID_APPROVAL_SCORE",
      "publication_readiness_score must be in range [0,100]",
      { value },
    );
  }
  return value as ApprovalScore;
};
