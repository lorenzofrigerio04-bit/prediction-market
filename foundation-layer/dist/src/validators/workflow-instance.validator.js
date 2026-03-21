import { WORKFLOW_INSTANCE_SCHEMA_ID } from "../schemas/entities/workflow-instance.schema.js";
import { buildValidationReport, requireSchemaValidator, resolveGeneratedAt, validateBySchema, } from "./common/validation-result.js";
import { validateWorkflowInstanceInvariants } from "./domain-invariants.validator.js";
export const validateWorkflowInstance = (input, options) => {
    const schemaValidator = requireSchemaValidator(WORKFLOW_INSTANCE_SCHEMA_ID);
    const schemaIssues = validateBySchema(schemaValidator, input);
    const issues = [...schemaIssues, ...validateWorkflowInstanceInvariants(input)];
    return buildValidationReport("WorkflowInstance", input.workflowId, issues, resolveGeneratedAt(options));
};
//# sourceMappingURL=workflow-instance.validator.js.map