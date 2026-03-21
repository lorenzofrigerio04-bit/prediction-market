import type { Branded } from "../../common/types/branded.js";
import { ValidationError } from "../../common/errors/validation-error.js";
import { createNonEmpty } from "./shared.vo.js";

export type AuditRef = Branded<string, "AuditRef">;

export const createAuditRef = (value: string): AuditRef => {
  const normalized = createNonEmpty(value, "auditRef");
  if (normalized.length > 512) {
    throw new ValidationError("AUDIT_REF_EMPTY", "AuditRef exceeds max length", { length: normalized.length });
  }
  return normalized as AuditRef;
};
