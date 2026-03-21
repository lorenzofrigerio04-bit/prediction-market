import { buildValidationReport, requireSchemaValidator, resolveGeneratedAt, validateBySchema, } from "../../../validators/common/validation-result.js";
import { GUARDRAIL_POLICY_SCHEMA_ID } from "../../schemas/guardrail-policy.schema.js";
export const validateGuardrailPolicy = (input, options) => {
    const schemaValidator = requireSchemaValidator(GUARDRAIL_POLICY_SCHEMA_ID);
    const schemaIssues = validateBySchema(schemaValidator, input);
    return buildValidationReport("GuardrailPolicy", input.id, schemaIssues, resolveGeneratedAt(options));
};
//# sourceMappingURL=validate-guardrail-policy.js.map