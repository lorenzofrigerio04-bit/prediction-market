import { type ValidationReport } from "../../entities/validation-report.entity.js";
import {
  buildValidationReport,
  requireSchemaValidator,
  resolveGeneratedAt,
  type ValidationOptions,
  validateBySchema,
} from "../../validators/common/validation-result.js";
import type { UserIdentity } from "../identities/entities/user-identity.entity.js";
import { USER_IDENTITY_SCHEMA_ID } from "../schemas/user-identity.schema.js";

export const validateUserIdentity = (input: UserIdentity, options?: ValidationOptions): ValidationReport => {
  const schemaValidator = requireSchemaValidator(USER_IDENTITY_SCHEMA_ID);
  const schemaIssues = validateBySchema(schemaValidator, input);
  return buildValidationReport("UserIdentity", input.id, schemaIssues, resolveGeneratedAt(options));
};
