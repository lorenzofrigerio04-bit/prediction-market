import { buildValidationReport, requireSchemaValidator, resolveGeneratedAt, validateBySchema, } from "../../validators/common/validation-result.js";
import { CANDIDATE_LIST_VIEW_SCHEMA_ID } from "../schemas/candidate-list-view.schema.js";
export const validateCandidateListView = (input, options) => {
    const schemaValidator = requireSchemaValidator(CANDIDATE_LIST_VIEW_SCHEMA_ID);
    const schemaIssues = validateBySchema(schemaValidator, input);
    return buildValidationReport("CandidateListView", input.id, schemaIssues, resolveGeneratedAt(options));
};
//# sourceMappingURL=validate-candidate-list-view.js.map