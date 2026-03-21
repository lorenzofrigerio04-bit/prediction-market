import { type ValidationReport } from "../../../entities/validation-report.entity.js";
import {
  buildValidationReport,
  requireSchemaValidator,
  resolveGeneratedAt,
  type ValidationOptions,
  validateBySchema,
} from "../../../validators/common/validation-result.js";
import type { PreliminaryScorecard } from "../entities/preliminary-scorecard.entity.js";
import { PRELIMINARY_SCORECARD_SCHEMA_ID } from "../../schemas/preliminary-scorecard.schema.js";

export const validatePreliminaryScorecard = (
  input: PreliminaryScorecard,
  options?: ValidationOptions,
): ValidationReport => {
  const schemaValidator = requireSchemaValidator(PRELIMINARY_SCORECARD_SCHEMA_ID);
  const schemaIssues = validateBySchema(schemaValidator, input);
  return buildValidationReport("PreliminaryScorecard", "preliminary-scorecard", schemaIssues, resolveGeneratedAt(options));
};
