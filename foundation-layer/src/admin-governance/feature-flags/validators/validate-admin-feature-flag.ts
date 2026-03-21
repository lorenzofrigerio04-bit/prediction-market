import { errorIssue, type ValidationIssue, type ValidationReport } from "../../../entities/validation-report.entity.js";
import {
  buildValidationReport,
  requireSchemaValidator,
  resolveGeneratedAt,
  type ValidationOptions,
  validateBySchema,
} from "../../../validators/common/validation-result.js";
import { FeatureFlagDefaultState } from "../../enums/feature-flag-default-state.enum.js";
import type { AdminFeatureFlag } from "../entities/admin-feature-flag.entity.js";
import { ADMIN_FEATURE_FLAG_SCHEMA_ID } from "../../schemas/admin-feature-flag.schema.js";

const validateInvariants = (input: AdminFeatureFlag): readonly ValidationIssue[] => {
  const issues: ValidationIssue[] = [];
  if (input.enabled !== (input.default_state === FeatureFlagDefaultState.ENABLED)) {
    issues.push(
      errorIssue(
        "FEATURE_FLAG_STATE_MISMATCH",
        "/enabled",
        "enabled must strictly match default_state semantic",
      ),
    );
  }
  return issues;
};

export const validateAdminFeatureFlag = (
  input: AdminFeatureFlag,
  options?: ValidationOptions,
): ValidationReport => {
  const schemaValidator = requireSchemaValidator(ADMIN_FEATURE_FLAG_SCHEMA_ID);
  const schemaIssues = validateBySchema(schemaValidator, input);
  const invariantIssues = validateInvariants(input);
  return buildValidationReport("AdminFeatureFlag", input.id, [...schemaIssues, ...invariantIssues], resolveGeneratedAt(options));
};
