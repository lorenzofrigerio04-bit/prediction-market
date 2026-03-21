import { buildValidationReport, requireSchemaValidator, resolveGeneratedAt, validateBySchema } from "../../../validators/common/validation-result.js";
import { EDITORIAL_GOVERNANCE_GUARD_SCHEMA_ID } from "../../schemas/editorial-governance-guard.schema.js";
export const validateEditorialGovernanceGuard = (input, options) => {
    const v = requireSchemaValidator(EDITORIAL_GOVERNANCE_GUARD_SCHEMA_ID);
    return buildValidationReport("EditorialGovernanceGuard", "editorial-guard", validateBySchema(v, input), resolveGeneratedAt(options));
};
//# sourceMappingURL=validate-editorial-governance-guard.js.map