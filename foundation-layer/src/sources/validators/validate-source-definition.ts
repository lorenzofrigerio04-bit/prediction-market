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
import { SourceUseCase } from "../enums/source-use-case.enum.js";
import { SOURCE_DEFINITION_SCHEMA_ID } from "../schemas/source-definition.schema.js";
import type { SourceDefinition } from "../entities/source-definition.entity.js";

const validateSourceDefinitionInvariants = (
  input: SourceDefinition,
): readonly ValidationIssue[] => {
  const issues: ValidationIssue[] = [];
  const hasUseCase = (useCase: SourceUseCase): boolean => input.supportedUseCases.includes(useCase);
  const checkCapabilityAlignment = (
    field: "supportsDiscovery" | "supportsValidation" | "supportsResolution" | "supportsAttentionScoring",
    expectedUseCase: SourceUseCase,
  ): void => {
    if (input.capability[field] !== hasUseCase(expectedUseCase)) {
      issues.push(
        errorIssue(
          "CAPABILITY_USE_CASE_MISMATCH",
          `/capability/${field}`,
          `${field} must match explicit supportedUseCases`,
        ),
      );
    }
  };

  if (input.displayName.trim().length === 0) {
    issues.push(errorIssue("INVALID_SOURCE_DEFINITION", "/displayName", "displayName must be non-empty"));
  }
  if (input.supportedUseCases.length === 0) {
    issues.push(
      errorIssue(
        "MISSING_SUPPORTED_USE_CASES",
        "/supportedUseCases",
        "supportedUseCases must contain at least one use case",
      ),
    );
  }
  if (new Set(input.supportedUseCases).size !== input.supportedUseCases.length) {
    issues.push(
      errorIssue(
        "DUPLICATE_SUPPORTED_USE_CASES",
        "/supportedUseCases",
        "supportedUseCases must contain unique values",
      ),
    );
  }
  checkCapabilityAlignment("supportsDiscovery", SourceUseCase.DISCOVERY);
  checkCapabilityAlignment("supportsValidation", SourceUseCase.VALIDATION);
  checkCapabilityAlignment("supportsResolution", SourceUseCase.RESOLUTION);
  checkCapabilityAlignment("supportsAttentionScoring", SourceUseCase.ATTENTION);

  return issues;
};

export const validateSourceDefinition = (
  input: SourceDefinition,
  options?: ValidationOptions,
): ValidationReport => {
  const schemaValidator = requireSchemaValidator(SOURCE_DEFINITION_SCHEMA_ID);
  const schemaIssues = validateBySchema(schemaValidator, input);
  const issues = [...schemaIssues, ...validateSourceDefinitionInvariants(input)];
  return buildValidationReport("SourceDefinition", input.id, issues, resolveGeneratedAt(options));
};
