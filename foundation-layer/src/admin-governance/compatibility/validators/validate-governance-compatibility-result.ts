import { type ValidationReport } from "../../../entities/validation-report.entity.js";
import { buildValidationReport, requireSchemaValidator, resolveGeneratedAt, type ValidationOptions, validateBySchema } from "../../../validators/common/validation-result.js";
import type { GovernanceCompatibilityResult } from "../entities/governance-compatibility-result.entity.js";
import { GOVERNANCE_COMPATIBILITY_RESULT_SCHEMA_ID } from "../../schemas/governance-compatibility-result.schema.js";

export const validateGovernanceCompatibilityResult = (input: GovernanceCompatibilityResult, options?: ValidationOptions): ValidationReport => {
  const v = requireSchemaValidator(GOVERNANCE_COMPATIBILITY_RESULT_SCHEMA_ID);
  return buildValidationReport("GovernanceCompatibilityResult", input.id, validateBySchema(v, input), resolveGeneratedAt(options));
};
