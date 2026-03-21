import type { MarketOutcome } from "../entities/market-outcome.entity.js";
import type { ValidationReport } from "../entities/validation-report.entity.js";
import { MARKET_OUTCOME_SCHEMA_ID } from "../schemas/entities/market-outcome.schema.js";
import {
  buildValidationReport,
  requireSchemaValidator,
  resolveGeneratedAt,
  type ValidationOptions,
  validateBySchema,
} from "./common/validation-result.js";
import { validateMarketOutcomeInvariants } from "./domain-invariants.validator.js";

export const validateMarketOutcome = (
  input: MarketOutcome,
  options?: ValidationOptions,
): ValidationReport => {
  const schemaValidator = requireSchemaValidator(MARKET_OUTCOME_SCHEMA_ID);
  const schemaIssues = validateBySchema(schemaValidator, input);
  const issues = [...schemaIssues, ...validateMarketOutcomeInvariants(input)];
  return buildValidationReport(
    "MarketOutcome",
    input.id,
    issues,
    resolveGeneratedAt(options),
  );
};
