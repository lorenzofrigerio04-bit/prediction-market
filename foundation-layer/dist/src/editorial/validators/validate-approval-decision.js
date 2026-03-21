import { buildValidationReport, requireSchemaValidator, resolveGeneratedAt, validateBySchema, } from "../../validators/common/validation-result.js";
import { APPROVAL_DECISION_SCHEMA_ID } from "../schemas/approval-decision.schema.js";
export const validateApprovalDecision = (input, options) => {
    const schemaValidator = requireSchemaValidator(APPROVAL_DECISION_SCHEMA_ID);
    const schemaIssues = validateBySchema(schemaValidator, input);
    return buildValidationReport("ApprovalDecision", input.id, schemaIssues, resolveGeneratedAt(options));
};
//# sourceMappingURL=validate-approval-decision.js.map