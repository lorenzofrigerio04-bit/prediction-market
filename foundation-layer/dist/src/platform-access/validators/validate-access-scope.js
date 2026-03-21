import { errorIssue } from "../../entities/validation-report.entity.js";
import { buildValidationReport, requireSchemaValidator, resolveGeneratedAt, validateBySchema, } from "../../validators/common/validation-result.js";
import { ScopeType } from "../enums/scope-type.enum.js";
import { ACCESS_SCOPE_SCHEMA_ID } from "../schemas/access-scope.schema.js";
const validateAccessScopeInvariants = (input) => {
    const issues = [];
    if ((input.scope_type === ScopeType.WORKSPACE ||
        input.scope_type === ScopeType.WORKSPACE_MODULE ||
        input.scope_type === ScopeType.WORKSPACE_ENTITY) &&
        input.workspace_id_nullable === null) {
        issues.push(errorIssue("ACCESS_SCOPE_WORKSPACE_REQUIRED", "/workspace_id_nullable", "workspace-specific scope requires workspace_id_nullable"));
    }
    if ((input.scope_type === ScopeType.MODULE || input.scope_type === ScopeType.WORKSPACE_MODULE) &&
        input.module_scope_nullable === null) {
        issues.push(errorIssue("ACCESS_SCOPE_MODULE_REQUIRED", "/module_scope_nullable", "module scope type requires module_scope_nullable"));
    }
    if ((input.scope_type === ScopeType.ENTITY || input.scope_type === ScopeType.WORKSPACE_ENTITY) &&
        input.entity_scope_nullable === null) {
        issues.push(errorIssue("ACCESS_SCOPE_ENTITY_REQUIRED", "/entity_scope_nullable", "entity scope type requires entity_scope_nullable"));
    }
    return issues;
};
export const validateAccessScope = (input, options) => {
    const schemaValidator = requireSchemaValidator(ACCESS_SCOPE_SCHEMA_ID);
    const schemaIssues = validateBySchema(schemaValidator, input);
    const invariantIssues = validateAccessScopeInvariants(input);
    return buildValidationReport("AccessScope", "access_scope", [...schemaIssues, ...invariantIssues], resolveGeneratedAt(options));
};
//# sourceMappingURL=validate-access-scope.js.map