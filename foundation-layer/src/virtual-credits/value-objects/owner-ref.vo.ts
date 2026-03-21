import type { Branded } from "../../common/types/branded.js";
import { ValidationError } from "../../common/errors/validation-error.js";
import { createNonEmpty } from "./shared.vo.js";

export type OwnerRef = Branded<string, "OwnerRef">;

export const createOwnerRef = (value: string): OwnerRef => {
  const normalized = createNonEmpty(value, "ownerRef");
  if (normalized.length > 512) {
    throw new ValidationError("OWNER_REF_EMPTY", "OwnerRef exceeds max length", { length: normalized.length });
  }
  return normalized as OwnerRef;
};
