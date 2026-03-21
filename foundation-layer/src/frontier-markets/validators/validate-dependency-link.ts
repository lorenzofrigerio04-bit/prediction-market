import { errorIssue, type ValidationIssue, type ValidationReport } from "../../entities/validation-report.entity.js";
import {
  buildValidationReport,
  requireSchemaValidator,
  resolveGeneratedAt,
  type ValidationOptions,
  validateBySchema,
} from "../../validators/common/validation-result.js";
import { DependencyStrength } from "../enums/dependency-strength.enum.js";
import { DEPENDENCY_LINK_SCHEMA_ID } from "../schemas/dependency-link.schema.js";
import type { DependencyLink } from "../dependencies/entities/dependency-link.entity.js";

const validateDependencyInvariants = (input: DependencyLink): readonly ValidationIssue[] => {
  const issues: ValidationIssue[] = [];
  if (input.blocking && input.dependency_strength === DependencyStrength.WEAK) {
    issues.push(
      errorIssue(
        "BLOCKING_DEPENDENCY_WEAK_STRENGTH",
        "/dependency_strength",
        "blocking DependencyLink requires medium or strong dependency_strength",
      ),
    );
  }
  if (
    input.source_ref.ref_type === input.target_ref.ref_type &&
    input.source_ref.ref_id === input.target_ref.ref_id
  ) {
    issues.push(errorIssue("SELF_LINK_NOT_ALLOWED", "/", "dependency link cannot target itself"));
  }
  return issues;
};

export const validateDependencyLink = (
  input: DependencyLink,
  options?: ValidationOptions,
): ValidationReport => {
  const schemaValidator = requireSchemaValidator(DEPENDENCY_LINK_SCHEMA_ID);
  const schemaIssues = validateBySchema(schemaValidator, input);
  const invariantIssues = validateDependencyInvariants(input);
  return buildValidationReport(
    "DependencyLink",
    input.id,
    [...schemaIssues, ...invariantIssues],
    resolveGeneratedAt(options),
  );
};
