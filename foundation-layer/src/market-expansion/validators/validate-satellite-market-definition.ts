import { errorIssue, type ValidationIssue, type ValidationReport } from "../../entities/validation-report.entity.js";
import {
  buildValidationReport,
  requireSchemaValidator,
  resolveGeneratedAt,
  type ValidationOptions,
  validateBySchema,
} from "../../validators/common/validation-result.js";
import { SATELLITE_MARKET_DEFINITION_SCHEMA_ID } from "../schemas/satellite-market-definition.schema.js";
import type { SatelliteMarketDefinition } from "../satellites/entities/satellite-market-definition.entity.js";

const validateInvariants = (input: SatelliteMarketDefinition): readonly ValidationIssue[] => {
  if (input.parent_market_ref === input.market_ref) {
    return [
      errorIssue(
        "SATELLITE_EQUALS_FLAGSHIP",
        "/market_ref",
        "satellite market_ref cannot be equal to parent_market_ref",
      ),
    ];
  }
  return [];
};

export const validateSatelliteMarketDefinition = (
  input: SatelliteMarketDefinition,
  options?: ValidationOptions,
): ValidationReport => {
  const schemaValidator = requireSchemaValidator(SATELLITE_MARKET_DEFINITION_SCHEMA_ID);
  const schemaIssues = validateBySchema(schemaValidator, input);
  const invariantIssues = validateInvariants(input);
  return buildValidationReport(
    "SatelliteMarketDefinition",
    input.id,
    [...schemaIssues, ...invariantIssues],
    resolveGeneratedAt(options),
  );
};
