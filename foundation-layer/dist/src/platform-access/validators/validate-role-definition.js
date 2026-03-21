import { errorIssue } from "../../entities/validation-report.entity.js";
import { buildValidationReport, requireSchemaValidator, resolveGeneratedAt, validateBySchema, } from "../../validators/common/validation-result.js";
import { ROLE_DEFINITION_SCHEMA_ID } from "../schemas/role-definition.schema.js";
const validateRoleDefinitionInvariants = (input) => {
    if (input.permission_set.length === 0) {
        return [errorIssue("ROLE_PERMISSION_SET_EMPTY", "/permission_set", "permission_set must not be empty")];
    }
    return [];
};
export const validateRoleDefinition = (input, options) => {
    const schemaValidator = requireSchemaValidator(ROLE_DEFINITION_SCHEMA_ID);
    const schemaIssues = validateBySchema(schemaValidator, input);
    const invariantIssues = validateRoleDefinitionInvariants(input);
    return buildValidationReport("RoleDefinition", input.id, [...schemaIssues, ...invariantIssues], resolveGeneratedAt(options));
};
//# sourceMappingURL=validate-role-definition.js.map