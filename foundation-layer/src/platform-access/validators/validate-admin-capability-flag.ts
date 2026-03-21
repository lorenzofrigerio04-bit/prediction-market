import { errorIssue, type ValidationIssue, type ValidationReport } from "../../entities/validation-report.entity.js";
import {
  buildValidationReport,
  requireSchemaValidator,
  resolveGeneratedAt,
  type ValidationOptions,
  validateBySchema,
} from "../../validators/common/validation-result.js";
import type { AdminCapabilityFlag } from "../capabilities/entities/admin-capability-flag.entity.js";
import { ADMIN_CAPABILITY_FLAG_SCHEMA_ID } from "../schemas/admin-capability-flag.schema.js";

const validateAdminCapabilitySafety = (input: AdminCapabilityFlag): readonly ValidationIssue[] => {
  const issues: ValidationIssue[] = [];
  if (input.sensitive && input.default_enabled) {
    issues.push(
      errorIssue(
        "SENSITIVE_CAPABILITY_DEFAULT_DISABLED",
        "/default_enabled",
        "sensitive capability flags must never be default enabled",
      ),
    );
  }
  return issues;
};

export const validateAdminCapabilityFlag = (
  input: AdminCapabilityFlag,
  options?: ValidationOptions,
): ValidationReport => {
  const schemaValidator = requireSchemaValidator(ADMIN_CAPABILITY_FLAG_SCHEMA_ID);
  const schemaIssues = validateBySchema(schemaValidator, input);
  const invariantIssues = validateAdminCapabilitySafety(input);
  return buildValidationReport(
    "AdminCapabilityFlag",
    input.flag_key as string,
    [...schemaIssues, ...invariantIssues],
    resolveGeneratedAt(options),
  );
};
