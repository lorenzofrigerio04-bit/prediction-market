import { ValidationError } from "../../common/errors/validation-error.js";
import { deepFreeze } from "../../common/utils/deep-freeze.js";
import type { Timestamp } from "../../value-objects/timestamp.vo.js";

export type AuditMetadata = Readonly<{
  createdBy: string;
  createdAt: Timestamp;
  updatedBy: string;
  updatedAt: Timestamp;
}>;

export const createAuditMetadata = (input: AuditMetadata): AuditMetadata => {
  const createdBy = input.createdBy.trim();
  const updatedBy = input.updatedBy.trim();

  if (createdBy.length === 0 || updatedBy.length === 0) {
    throw new ValidationError(
      "INVALID_AUDIT_METADATA",
      "createdBy and updatedBy must be non-empty",
      { createdBy: input.createdBy, updatedBy: input.updatedBy },
    );
  }

  return deepFreeze({
    createdBy,
    createdAt: input.createdAt,
    updatedBy,
    updatedAt: input.updatedAt,
  });
};
