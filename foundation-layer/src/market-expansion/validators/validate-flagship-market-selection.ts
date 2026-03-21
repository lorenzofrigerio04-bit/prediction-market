import { type ValidationReport } from "../../entities/validation-report.entity.js";
import {
  buildValidationReport,
  requireSchemaValidator,
  resolveGeneratedAt,
  type ValidationOptions,
  validateBySchema,
} from "../../validators/common/validation-result.js";
import { FLAGSHIP_MARKET_SELECTION_SCHEMA_ID } from "../schemas/flagship-market-selection.schema.js";
import type { FlagshipMarketSelection } from "../flagship/entities/flagship-market-selection.entity.js";

export const validateFlagshipMarketSelection = (
  input: FlagshipMarketSelection,
  options?: ValidationOptions,
): ValidationReport => {
  const schemaValidator = requireSchemaValidator(FLAGSHIP_MARKET_SELECTION_SCHEMA_ID);
  const schemaIssues = validateBySchema(schemaValidator, input);
  return buildValidationReport(
    "FlagshipMarketSelection",
    input.id,
    schemaIssues,
    resolveGeneratedAt(options),
  );
};
