import { errorIssue, type ValidationIssue, type ValidationReport } from "../../entities/validation-report.entity.js";
import {
  buildValidationReport,
  requireSchemaValidator,
  resolveGeneratedAt,
  type ValidationOptions,
  validateBySchema,
} from "../../validators/common/validation-result.js";
import { FRESHNESS_PROFILE_SCHEMA_ID } from "../schemas/freshness-profile.schema.js";
import type { FreshnessProfile } from "../value-objects/freshness-profile.vo.js";

const validateFreshnessProfileInvariants = (
  input: FreshnessProfile,
): readonly ValidationIssue[] => {
  const issues: ValidationIssue[] = [];
  if (input.expectedUpdateFrequency.trim().length === 0) {
    issues.push(
      errorIssue(
        "INVALID_EXPECTED_UPDATE_FREQUENCY",
        "/expectedUpdateFrequency",
        "expectedUpdateFrequency must be non-empty",
      ),
    );
  }
  if (!Number.isInteger(input.freshnessTtl) || input.freshnessTtl < 0) {
    issues.push(
      errorIssue("INVALID_FRESHNESS_TTL", "/freshnessTtl", "freshnessTtl must be a non-negative integer"),
    );
  }
  return issues;
};

export const validateFreshnessProfile = (
  input: FreshnessProfile,
  options?: ValidationOptions,
): ValidationReport => {
  const schemaValidator = requireSchemaValidator(FRESHNESS_PROFILE_SCHEMA_ID);
  const schemaIssues = validateBySchema(schemaValidator, input);
  const issues = [...schemaIssues, ...validateFreshnessProfileInvariants(input)];
  return buildValidationReport("FreshnessProfile", "freshness-profile", issues, resolveGeneratedAt(options));
};
