import { type ValidationReport } from "../../../entities/validation-report.entity.js";
import { buildValidationReport, requireSchemaValidator, resolveGeneratedAt, type ValidationOptions, validateBySchema } from "../../../validators/common/validation-result.js";
import type { PlatformAccessGovernanceContext } from "../entities/platform-access-governance-context.entity.js";
import { PLATFORM_ACCESS_GOVERNANCE_CONTEXT_SCHEMA_ID } from "../../schemas/platform-access-governance-context.schema.js";

export const validatePlatformAccessGovernanceContext = (input: PlatformAccessGovernanceContext, options?: ValidationOptions): ValidationReport => {
  const v = requireSchemaValidator(PLATFORM_ACCESS_GOVERNANCE_CONTEXT_SCHEMA_ID);
  return buildValidationReport("PlatformAccessGovernanceContext", input.module_key, validateBySchema(v, input), resolveGeneratedAt(options));
};
