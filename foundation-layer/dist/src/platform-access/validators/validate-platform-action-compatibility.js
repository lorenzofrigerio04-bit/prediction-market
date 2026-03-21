import { errorIssue } from "../../entities/validation-report.entity.js";
import { buildValidationReport, requireSchemaValidator, resolveGeneratedAt, validateBySchema, } from "../../validators/common/validation-result.js";
import { ScopeType } from "../enums/scope-type.enum.js";
import { TargetModule } from "../enums/target-module.enum.js";
import { PLATFORM_ACTION_COMPATIBILITY_SCHEMA_ID } from "../schemas/platform-action-compatibility.schema.js";
const validateCrossModuleCompatibility = (input) => {
    const issues = [];
    if (input.target_module === TargetModule.PLATFORM_ACCESS && input.required_scope_type === ScopeType.ENTITY) {
        issues.push(errorIssue("PLATFORM_ACCESS_ENTITY_SCOPE_UNSUPPORTED", "/required_scope_type", "PLATFORM_ACCESS actions cannot require ENTITY scope directly"));
    }
    if (input.required_capabilities_nullable !== null &&
        input.required_capabilities_nullable.length > 0 &&
        !input.active) {
        issues.push(errorIssue("INACTIVE_COMPATIBILITY_WITH_REQUIRED_CAPABILITIES", "/active", "inactive compatibility entries must not advertise required capabilities"));
    }
    return issues;
};
export const validatePlatformActionCompatibility = (input, options) => {
    const schemaValidator = requireSchemaValidator(PLATFORM_ACTION_COMPATIBILITY_SCHEMA_ID);
    const schemaIssues = validateBySchema(schemaValidator, input);
    const invariantIssues = validateCrossModuleCompatibility(input);
    return buildValidationReport("PlatformActionCompatibility", input.id, [...schemaIssues, ...invariantIssues], resolveGeneratedAt(options));
};
//# sourceMappingURL=validate-platform-action-compatibility.js.map