import { type ValidationReport } from "../../../entities/validation-report.entity.js";
import {
  buildValidationReport,
  requireSchemaValidator,
  resolveGeneratedAt,
  type ValidationOptions,
  validateBySchema,
} from "../../../validators/common/validation-result.js";
import type { GuardrailPolicy } from "../entities/guardrail-policy.entity.js";
import { GUARDRAIL_POLICY_SCHEMA_ID } from "../../schemas/guardrail-policy.schema.js";

export const validateGuardrailPolicy = (
  input: GuardrailPolicy,
  options?: ValidationOptions,
): ValidationReport => {
  const schemaValidator = requireSchemaValidator(GUARDRAIL_POLICY_SCHEMA_ID);
  const schemaIssues = validateBySchema(schemaValidator, input);
  return buildValidationReport("GuardrailPolicy", input.id, schemaIssues, resolveGeneratedAt(options));
};
