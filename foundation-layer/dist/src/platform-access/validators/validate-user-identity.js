import { buildValidationReport, requireSchemaValidator, resolveGeneratedAt, validateBySchema, } from "../../validators/common/validation-result.js";
import { USER_IDENTITY_SCHEMA_ID } from "../schemas/user-identity.schema.js";
export const validateUserIdentity = (input, options) => {
    const schemaValidator = requireSchemaValidator(USER_IDENTITY_SCHEMA_ID);
    const schemaIssues = validateBySchema(schemaValidator, input);
    return buildValidationReport("UserIdentity", input.id, schemaIssues, resolveGeneratedAt(options));
};
//# sourceMappingURL=validate-user-identity.js.map