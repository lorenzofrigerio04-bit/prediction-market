import type { Branded } from "../../common/types/branded.js";
import { ValidationError } from "../../common/errors/validation-error.js";
import { createNonEmpty } from "./shared.vo.js";

export type RelatedRef = Branded<string, "RelatedRef">;

export const createRelatedRef = (value: string): RelatedRef => {
  const normalized = createNonEmpty(value, "relatedRef");
  if (normalized.length > 512) {
    throw new ValidationError("RELATED_REF_EMPTY", "RelatedRef exceeds max length", { length: normalized.length });
  }
  return normalized as RelatedRef;
};
