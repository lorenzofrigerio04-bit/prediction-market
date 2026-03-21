import type { Branded } from "../../common/types/branded.js";
import { createPrefixedId } from "../../common/utils/id.js";
import { ValidationError } from "../../common/errors/validation-error.js";

export type AuditReference = Branded<string, "LiveIntegrationAuditReference">;

export const createAuditReference = (value: string): AuditReference =>
  createPrefixedId(value, "aref_", "LiveIntegrationAuditReference") as AuditReference;

export const assertAuditReferencePresent = (value: string): AuditReference => {
  if (value.trim().length === 0) {
    throw new ValidationError("MISSING_AUDIT_REFERENCE", "audit_ref is required");
  }
  return createAuditReference(value);
};
