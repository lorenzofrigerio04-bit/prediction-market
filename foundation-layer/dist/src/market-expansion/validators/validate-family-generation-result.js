import { errorIssue } from "../../entities/validation-report.entity.js";
import { buildValidationReport, requireSchemaValidator, resolveGeneratedAt, validateBySchema, } from "../../validators/common/validation-result.js";
import { FAMILY_GENERATION_RESULT_SCHEMA_ID } from "../schemas/family-generation-result.schema.js";
const validateInvariants = (input) => {
    const issues = [];
    if (!input.generated_market_refs.includes(input.flagship_ref)) {
        issues.push(errorIssue("FAMILY_GENERATION_FLAGSHIP_MISSING", "/generated_market_refs", "generated_market_refs must include flagship_ref"));
    }
    return issues;
};
export const validateFamilyGenerationResult = (input, options) => {
    const schemaValidator = requireSchemaValidator(FAMILY_GENERATION_RESULT_SCHEMA_ID);
    const schemaIssues = validateBySchema(schemaValidator, input);
    const invariantIssues = validateInvariants(input);
    return buildValidationReport("FamilyGenerationResult", input.id, [...schemaIssues, ...invariantIssues], resolveGeneratedAt(options));
};
//# sourceMappingURL=validate-family-generation-result.js.map