import {
  errorIssue,
  type ValidationIssue,
  type ValidationReport,
} from "../../entities/validation-report.entity.js";
import {
  buildValidationReport,
  requireSchemaValidator,
  resolveGeneratedAt,
  type ValidationOptions,
  validateBySchema,
} from "../../validators/common/validation-result.js";
import { RELIABILITY_PROFILE_SCHEMA_ID } from "../schemas/reliability-profile.schema.js";
import type { ReliabilityProfile } from "../value-objects/reliability-profile.vo.js";

const validateReliabilityProfileInvariants = (
  input: ReliabilityProfile,
): readonly ValidationIssue[] => {
  const issues: ValidationIssue[] = [];
  if (!Number.isFinite(input.authorityScore) || input.authorityScore < 0 || input.authorityScore > 1) {
    issues.push(
      errorIssue(
        "INVALID_RELIABILITY_SCORE",
        "/authorityScore",
        "authorityScore must be within [0,1]",
      ),
    );
  }
  if (
    !Number.isFinite(input.historicalStabilityScore) ||
    input.historicalStabilityScore < 0 ||
    input.historicalStabilityScore > 1
  ) {
    issues.push(
      errorIssue(
        "INVALID_RELIABILITY_SCORE",
        "/historicalStabilityScore",
        "historicalStabilityScore must be within [0,1]",
      ),
    );
  }
  return issues;
};

export const validateReliabilityProfile = (
  input: ReliabilityProfile,
  options?: ValidationOptions,
): ValidationReport => {
  const schemaValidator = requireSchemaValidator(RELIABILITY_PROFILE_SCHEMA_ID);
  const schemaIssues = validateBySchema(schemaValidator, input);
  const issues = [...schemaIssues, ...validateReliabilityProfileInvariants(input)];
  return buildValidationReport(
    "ReliabilityProfile",
    "reliability-profile",
    issues,
    resolveGeneratedAt(options),
  );
};
