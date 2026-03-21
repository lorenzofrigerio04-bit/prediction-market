import { type ValidationReport } from "../../../entities/validation-report.entity.js";
import { buildValidationReport, requireSchemaValidator, resolveGeneratedAt, type ValidationOptions, validateBySchema } from "../../../validators/common/validation-result.js";
import type { ReliabilityGovernanceGuard } from "../entities/reliability-governance-guard.entity.js";
import { RELIABILITY_GOVERNANCE_GUARD_SCHEMA_ID } from "../../schemas/reliability-governance-guard.schema.js";

export const validateReliabilityGovernanceGuard = (input: ReliabilityGovernanceGuard, options?: ValidationOptions): ValidationReport => {
  const v = requireSchemaValidator(RELIABILITY_GOVERNANCE_GUARD_SCHEMA_ID);
  return buildValidationReport("ReliabilityGovernanceGuard", "reliability-guard", validateBySchema(v, input), resolveGeneratedAt(options));
};
