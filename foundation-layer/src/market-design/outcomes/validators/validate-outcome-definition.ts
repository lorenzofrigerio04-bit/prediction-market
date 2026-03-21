import { type ValidationReport } from "../../../entities/validation-report.entity.js";
import {
  buildValidationReport,
  requireSchemaValidator,
  resolveGeneratedAt,
  type ValidationOptions,
  validateBySchema,
} from "../../../validators/common/validation-result.js";
import type { OutcomeDefinition } from "../entities/outcome-definition.entity.js";
import { OUTCOME_DEFINITION_SCHEMA_ID } from "../../schemas/outcome-definition.schema.js";

export const validateOutcomeDefinition = (
  input: OutcomeDefinition,
  options?: ValidationOptions,
): ValidationReport => {
  const schemaValidator = requireSchemaValidator(OUTCOME_DEFINITION_SCHEMA_ID);
  const schemaIssues = validateBySchema(schemaValidator, input);
  return buildValidationReport("OutcomeDefinition", input.id, schemaIssues, resolveGeneratedAt(options));
};
