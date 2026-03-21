import type { ValidationReport } from "../../entities/validation-report.entity.js";
import {
  buildValidationReport,
  requireSchemaValidator,
  resolveGeneratedAt,
  type ValidationOptions,
  validateBySchema,
} from "../../validators/common/validation-result.js";
import { RACE_TARGET_SCHEMA_ID } from "../schemas/race-target.schema.js";
import type { RaceTarget } from "../race/entities/race-target.entity.js";

export const validateRaceTarget = (
  input: RaceTarget,
  options?: ValidationOptions,
): ValidationReport => {
  const schemaValidator = requireSchemaValidator(RACE_TARGET_SCHEMA_ID);
  const schemaIssues = validateBySchema(schemaValidator, input);
  return buildValidationReport("RaceTarget", input.target_key, schemaIssues, resolveGeneratedAt(options));
};
