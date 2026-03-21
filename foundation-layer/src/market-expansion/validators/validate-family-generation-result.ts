import { errorIssue, type ValidationIssue, type ValidationReport } from "../../entities/validation-report.entity.js";
import {
  buildValidationReport,
  requireSchemaValidator,
  resolveGeneratedAt,
  type ValidationOptions,
  validateBySchema,
} from "../../validators/common/validation-result.js";
import { FAMILY_GENERATION_RESULT_SCHEMA_ID } from "../schemas/family-generation-result.schema.js";
import type { FamilyGenerationResult } from "../families/entities/family-generation-result.entity.js";

const validateInvariants = (input: FamilyGenerationResult): readonly ValidationIssue[] => {
  const issues: ValidationIssue[] = [];
  if (!input.generated_market_refs.includes(input.flagship_ref)) {
    issues.push(
      errorIssue(
        "FAMILY_GENERATION_FLAGSHIP_MISSING",
        "/generated_market_refs",
        "generated_market_refs must include flagship_ref",
      ),
    );
  }
  return issues;
};

export const validateFamilyGenerationResult = (
  input: FamilyGenerationResult,
  options?: ValidationOptions,
): ValidationReport => {
  const schemaValidator = requireSchemaValidator(FAMILY_GENERATION_RESULT_SCHEMA_ID);
  const schemaIssues = validateBySchema(schemaValidator, input);
  const invariantIssues = validateInvariants(input);
  return buildValidationReport(
    "FamilyGenerationResult",
    input.id,
    [...schemaIssues, ...invariantIssues],
    resolveGeneratedAt(options),
  );
};
