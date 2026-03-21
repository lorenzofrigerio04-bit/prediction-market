import { buildValidationReport, requireSchemaValidator, resolveGeneratedAt, validateBySchema } from "../../../validators/common/validation-result.js";
import { RELIABILITY_GOVERNANCE_GUARD_SCHEMA_ID } from "../../schemas/reliability-governance-guard.schema.js";
export const validateReliabilityGovernanceGuard = (input, options) => {
    const v = requireSchemaValidator(RELIABILITY_GOVERNANCE_GUARD_SCHEMA_ID);
    return buildValidationReport("ReliabilityGovernanceGuard", "reliability-guard", validateBySchema(v, input), resolveGeneratedAt(options));
};
//# sourceMappingURL=validate-reliability-governance-guard.js.map