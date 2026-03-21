import type { CandidateMarket } from "../entities/candidate-market.entity.js";
import type { ValidationReport } from "../entities/validation-report.entity.js";
import { CANDIDATE_MARKET_SCHEMA_ID } from "../schemas/entities/candidate-market.schema.js";
import {
  buildValidationReport,
  requireSchemaValidator,
  resolveGeneratedAt,
  type ValidationOptions,
  validateBySchema,
} from "./common/validation-result.js";
import { validateCandidateMarketInvariants } from "./domain-invariants.validator.js";

export const validateCandidateMarket = (
  input: CandidateMarket,
  options?: ValidationOptions,
): ValidationReport => {
  const schemaValidator = requireSchemaValidator(CANDIDATE_MARKET_SCHEMA_ID);
  const schemaIssues = validateBySchema(schemaValidator, input);
  const issues = [...schemaIssues, ...validateCandidateMarketInvariants(input)];
  return buildValidationReport(
    "CandidateMarket",
    input.id,
    issues,
    resolveGeneratedAt(options),
  );
};
