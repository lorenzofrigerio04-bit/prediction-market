import { errorIssue } from "../../entities/validation-report.entity.js";
import { buildValidationReport, requireSchemaValidator, resolveGeneratedAt, validateBySchema, } from "../../validators/common/validation-result.js";
import { SOURCE_POLICY_RENDER_SCHEMA_ID } from "../schemas/source-policy-render.schema.js";
const validateSourcePolicyRenderInvariants = (input) => {
    const issues = [];
    if (input.selected_source_priority.length === 0) {
        issues.push(errorIssue("EMPTY_SELECTED_SOURCE_PRIORITY", "/selected_source_priority", "selected_source_priority must be non-empty"));
    }
    return issues;
};
export const validateSourcePolicyRender = (input, options) => {
    const schemaValidator = requireSchemaValidator(SOURCE_POLICY_RENDER_SCHEMA_ID);
    const schemaIssues = validateBySchema(schemaValidator, input);
    const issues = [...schemaIssues, ...validateSourcePolicyRenderInvariants(input)];
    return buildValidationReport("SourcePolicyRender", input.selected_source_priority[0] ?? "source-policy", issues, resolveGeneratedAt(options));
};
//# sourceMappingURL=validate-source-policy-render.js.map