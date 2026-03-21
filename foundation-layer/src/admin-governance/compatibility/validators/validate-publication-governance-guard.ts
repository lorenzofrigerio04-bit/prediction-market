import { type ValidationReport } from "../../../entities/validation-report.entity.js";
import { buildValidationReport, requireSchemaValidator, resolveGeneratedAt, type ValidationOptions, validateBySchema } from "../../../validators/common/validation-result.js";
import type { PublicationGovernanceGuard } from "../entities/publication-governance-guard.entity.js";
import { PUBLICATION_GOVERNANCE_GUARD_SCHEMA_ID } from "../../schemas/publication-governance-guard.schema.js";

export const validatePublicationGovernanceGuard = (input: PublicationGovernanceGuard, options?: ValidationOptions): ValidationReport => {
  const v = requireSchemaValidator(PUBLICATION_GOVERNANCE_GUARD_SCHEMA_ID);
  return buildValidationReport("PublicationGovernanceGuard", "publication-guard", validateBySchema(v, input), resolveGeneratedAt(options));
};
