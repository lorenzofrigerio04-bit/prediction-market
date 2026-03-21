import type { ValidationReport } from "../../entities/validation-report.entity.js";
import {
  buildValidationReport,
  requireSchemaValidator,
  resolveGeneratedAt,
  type ValidationOptions,
  validateBySchema,
} from "../../validators/common/validation-result.js";
import { SEQUENCE_TARGET_SCHEMA_ID } from "../schemas/sequence-target.schema.js";
import type { SequenceTarget } from "../sequence/entities/sequence-target.entity.js";

export const validateSequenceTarget = (
  input: SequenceTarget,
  options?: ValidationOptions,
): ValidationReport => {
  const schemaValidator = requireSchemaValidator(SEQUENCE_TARGET_SCHEMA_ID);
  const schemaIssues = validateBySchema(schemaValidator, input);
  return buildValidationReport(
    "SequenceTarget",
    input.target_key,
    schemaIssues,
    resolveGeneratedAt(options),
  );
};
