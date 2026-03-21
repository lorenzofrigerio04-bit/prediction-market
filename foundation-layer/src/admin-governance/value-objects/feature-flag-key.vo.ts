import type { Branded } from "../../common/types/branded.js";
import { ValidationError } from "../../common/errors/validation-error.js";
import { createNonEmpty } from "./shared.vo.js";

export type FeatureFlagKey = Branded<string, "FeatureFlagKey">;

export const createFeatureFlagKey = (value: string): FeatureFlagKey => {
  const normalized = createNonEmpty(value, "feature_flag_key");
  if (normalized.length > 128) {
    throw new ValidationError("FEATURE_FLAG_KEY_TOO_LONG", "feature_flag_key exceeds max length", { length: normalized.length });
  }
  return normalized as FeatureFlagKey;
};
