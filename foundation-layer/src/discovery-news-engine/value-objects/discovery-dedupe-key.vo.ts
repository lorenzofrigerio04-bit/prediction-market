import { ValidationError } from "../../common/errors/validation-error.js";
import type { Branded } from "../../common/types/branded.js";

export type DiscoveryDedupeKey = Branded<string, "DiscoveryDedupeKey">;

export const createDiscoveryDedupeKey = (value: string): DiscoveryDedupeKey => {
  const trimmed = value.trim();
  if (trimmed.length === 0) {
    throw new ValidationError("INVALID_DISCOVERY_DEDUPE_KEY", "DiscoveryDedupeKey must be non-empty");
  }
  return trimmed as DiscoveryDedupeKey;
};
