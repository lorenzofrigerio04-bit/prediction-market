import { buildValidationReport, requireSchemaValidator, resolveGeneratedAt, validateBySchema } from "../../../validators/common/validation-result.js";
import { PUBLICATION_GOVERNANCE_GUARD_SCHEMA_ID } from "../../schemas/publication-governance-guard.schema.js";
export const validatePublicationGovernanceGuard = (input, options) => {
    const v = requireSchemaValidator(PUBLICATION_GOVERNANCE_GUARD_SCHEMA_ID);
    return buildValidationReport("PublicationGovernanceGuard", "publication-guard", validateBySchema(v, input), resolveGeneratedAt(options));
};
//# sourceMappingURL=validate-publication-governance-guard.js.map