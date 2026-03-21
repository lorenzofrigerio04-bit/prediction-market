import { type ValidationReport } from "../../../entities/validation-report.entity.js";
import { buildValidationReport, requireSchemaValidator, resolveGeneratedAt, type ValidationOptions, validateBySchema } from "../../../validators/common/validation-result.js";
import type { EditorialGovernanceGuard } from "../entities/editorial-governance-guard.entity.js";
import { EDITORIAL_GOVERNANCE_GUARD_SCHEMA_ID } from "../../schemas/editorial-governance-guard.schema.js";

export const validateEditorialGovernanceGuard = (input: EditorialGovernanceGuard, options?: ValidationOptions): ValidationReport => {
  const v = requireSchemaValidator(EDITORIAL_GOVERNANCE_GUARD_SCHEMA_ID);
  return buildValidationReport("EditorialGovernanceGuard", "editorial-guard", validateBySchema(v, input), resolveGeneratedAt(options));
};
