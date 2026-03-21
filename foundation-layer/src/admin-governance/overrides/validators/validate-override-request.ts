import { errorIssue, type ValidationIssue, type ValidationReport } from "../../../entities/validation-report.entity.js";
import {
  buildValidationReport,
  requireSchemaValidator,
  resolveGeneratedAt,
  type ValidationOptions,
  validateBySchema,
} from "../../../validators/common/validation-result.js";
import { OverrideStatus } from "../../enums/override-status.enum.js";
import type { OverrideRequest } from "../entities/override-request.entity.js";
import { OVERRIDE_REQUEST_SCHEMA_ID } from "../../schemas/override-request.schema.js";

const validateInvariants = (input: OverrideRequest): readonly ValidationIssue[] => {
  const issues: ValidationIssue[] = [];
  if (input.expires_at_nullable !== null && input.expires_at_nullable <= input.requested_at) {
    issues.push(errorIssue("OVERRIDE_EXPIRATION_ORDER_INVALID", "/expires_at_nullable", "expires_at_nullable must be after requested_at"));
  }
  if ((input.status === OverrideStatus.APPROVED || input.status === OverrideStatus.REJECTED) && input.resolved_by_nullable === null) {
    issues.push(errorIssue("OVERRIDE_RESOLVER_REQUIRED", "/resolved_by_nullable", "resolved_by_nullable is required for terminal statuses"));
  }
  return issues;
};

export const validateOverrideRequest = (
  input: OverrideRequest,
  options?: ValidationOptions,
): ValidationReport => {
  const schemaValidator = requireSchemaValidator(OVERRIDE_REQUEST_SCHEMA_ID);
  const schemaIssues = validateBySchema(schemaValidator, input);
  const invariantIssues = validateInvariants(input);
  return buildValidationReport("OverrideRequest", input.id, [...schemaIssues, ...invariantIssues], resolveGeneratedAt(options));
};
