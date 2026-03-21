import type { Branded } from "../../common/types/branded.js";
import { ValidationError } from "../../common/errors/validation-error.js";
import { createNonEmpty } from "./shared.vo.js";

export type GrantReason = Branded<string, "GrantReason">;

export const createGrantReason = (value: string): GrantReason => {
  const normalized = createNonEmpty(value, "grantReason");
  if (normalized.length > 512) {
    throw new ValidationError("GRANT_REASON_EMPTY", "GrantReason exceeds max length", { length: normalized.length });
  }
  return normalized as GrantReason;
};
