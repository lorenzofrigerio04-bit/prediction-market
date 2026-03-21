import { type ValidationReport } from "../../../entities/validation-report.entity.js";
import { buildValidationReport, requireSchemaValidator, resolveGeneratedAt, type ValidationOptions, validateBySchema } from "../../../validators/common/validation-result.js";
import type { VirtualCreditsGovernanceGuard } from "../entities/virtual-credits-governance-guard.entity.js";
import { VIRTUAL_CREDITS_GOVERNANCE_GUARD_SCHEMA_ID } from "../../schemas/virtual-credits-governance-guard.schema.js";

export const validateVirtualCreditsGovernanceGuard = (input: VirtualCreditsGovernanceGuard, options?: ValidationOptions): ValidationReport => {
  const v = requireSchemaValidator(VIRTUAL_CREDITS_GOVERNANCE_GUARD_SCHEMA_ID);
  return buildValidationReport("VirtualCreditsGovernanceGuard", "virtual-credits-guard", validateBySchema(v, input), resolveGeneratedAt(options));
};
