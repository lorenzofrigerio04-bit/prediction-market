import { errorIssue } from "../../entities/validation-report.entity.js";
import { buildValidationReport, requireSchemaValidator, resolveGeneratedAt, validateBySchema, } from "../../validators/common/validation-result.js";
import { DependencyStrength } from "../enums/dependency-strength.enum.js";
import { DEPENDENCY_LINK_SCHEMA_ID } from "../schemas/dependency-link.schema.js";
const validateDependencyInvariants = (input) => {
    const issues = [];
    if (input.blocking && input.dependency_strength === DependencyStrength.WEAK) {
        issues.push(errorIssue("BLOCKING_DEPENDENCY_WEAK_STRENGTH", "/dependency_strength", "blocking DependencyLink requires medium or strong dependency_strength"));
    }
    if (input.source_ref.ref_type === input.target_ref.ref_type &&
        input.source_ref.ref_id === input.target_ref.ref_id) {
        issues.push(errorIssue("SELF_LINK_NOT_ALLOWED", "/", "dependency link cannot target itself"));
    }
    return issues;
};
export const validateDependencyLink = (input, options) => {
    const schemaValidator = requireSchemaValidator(DEPENDENCY_LINK_SCHEMA_ID);
    const schemaIssues = validateBySchema(schemaValidator, input);
    const invariantIssues = validateDependencyInvariants(input);
    return buildValidationReport("DependencyLink", input.id, [...schemaIssues, ...invariantIssues], resolveGeneratedAt(options));
};
//# sourceMappingURL=validate-dependency-link.js.map