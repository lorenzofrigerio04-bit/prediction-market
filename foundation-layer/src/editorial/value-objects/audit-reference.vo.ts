import { ValidationError } from "../../common/errors/validation-error.js";
import { createPrefixedId } from "../../common/utils/id.js";
import type { Branded } from "../../common/types/branded.js";

export type AuditReferenceId = Branded<string, "AuditReferenceId">;
export type AuditCorrelationId = Branded<string, "AuditCorrelationId">;

export const createAuditReferenceId = (value: string): AuditReferenceId =>
  createPrefixedId(value, "aref_", "AuditReferenceId") as AuditReferenceId;

export const createAuditCorrelationId = (value: string): AuditCorrelationId =>
  createPrefixedId(value, "corr_", "AuditCorrelationId") as AuditCorrelationId;

export const assertAuditReferencePresent = (value: string): AuditReferenceId => {
  if (value.trim().length === 0) {
    throw new ValidationError("MISSING_AUDIT_REFERENCE", "audit reference is required");
  }
  return createAuditReferenceId(value);
};
