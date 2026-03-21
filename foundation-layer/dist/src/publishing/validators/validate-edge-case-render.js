import { errorIssue } from "../../entities/validation-report.entity.js";
import { buildValidationReport, requireSchemaValidator, resolveGeneratedAt, validateBySchema, } from "../../validators/common/validation-result.js";
import { EDGE_CASE_RENDER_SCHEMA_ID } from "../schemas/edge-case-render.schema.js";
const validateEdgeCaseRenderInvariants = (input) => {
    const issues = [];
    if (input.edge_case_items.length === 0) {
        issues.push(errorIssue("EMPTY_EDGE_CASE_ITEMS", "/edge_case_items", "edge_case_items must be non-empty"));
    }
    if (input.invalidation_items.length === 0) {
        issues.push(errorIssue("EMPTY_INVALIDATION_ITEMS", "/invalidation_items", "invalidation_items must be non-empty"));
    }
    return issues;
};
export const validateEdgeCaseRender = (input, options) => {
    const schemaValidator = requireSchemaValidator(EDGE_CASE_RENDER_SCHEMA_ID);
    const schemaIssues = validateBySchema(schemaValidator, input);
    const issues = [...schemaIssues, ...validateEdgeCaseRenderInvariants(input)];
    return buildValidationReport("EdgeCaseRender", "edge-case-render", issues, resolveGeneratedAt(options));
};
//# sourceMappingURL=validate-edge-case-render.js.map