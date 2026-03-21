import { buildValidationReport, requireSchemaValidator, resolveGeneratedAt, validateBySchema, } from "../../validators/common/validation-result.js";
import { WORKSPACE_SCHEMA_ID } from "../schemas/workspace.schema.js";
export const validateWorkspace = (input, options) => {
    const schemaValidator = requireSchemaValidator(WORKSPACE_SCHEMA_ID);
    const schemaIssues = validateBySchema(schemaValidator, input);
    return buildValidationReport("Workspace", input.id, schemaIssues, resolveGeneratedAt(options));
};
//# sourceMappingURL=validate-workspace.js.map