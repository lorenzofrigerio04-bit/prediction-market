import type { StructuredClaim } from "../entities/structured-claim.entity.js";
import type { ValidationReport } from "../entities/validation-report.entity.js";
import { STRUCTURED_CLAIM_SCHEMA_ID } from "../schemas/entities/structured-claim.schema.js";
import {
  buildValidationReport,
  requireSchemaValidator,
  resolveGeneratedAt,
  type ValidationOptions,
  validateBySchema,
} from "./common/validation-result.js";
import { validateStructuredClaimInvariants } from "./domain-invariants.validator.js";

export const validateStructuredClaim = (
  input: StructuredClaim,
  options?: ValidationOptions,
): ValidationReport => {
  const schemaValidator = requireSchemaValidator(STRUCTURED_CLAIM_SCHEMA_ID);
  const schemaIssues = validateBySchema(schemaValidator, input);
  const issues = [...schemaIssues, ...validateStructuredClaimInvariants(input)];
  return buildValidationReport(
    "StructuredClaim",
    input.id,
    issues,
    resolveGeneratedAt(options),
  );
};
