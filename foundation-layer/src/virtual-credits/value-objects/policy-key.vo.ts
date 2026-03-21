import type { Branded } from "../../common/types/branded.js";
import { ValidationError } from "../../common/errors/validation-error.js";
import { createNonEmpty } from "./shared.vo.js";

export type PolicyKey = Branded<string, "PolicyKey">;

export const createPolicyKey = (value: string): PolicyKey => {
  const normalized = createNonEmpty(value, "policyKey");
  if (normalized.length > 512) {
    throw new ValidationError("POLICY_KEY_EMPTY", "PolicyKey exceeds max length", { length: normalized.length });
  }
  return normalized as PolicyKey;
};
