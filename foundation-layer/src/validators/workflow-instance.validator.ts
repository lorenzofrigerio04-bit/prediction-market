import type { WorkflowInstance } from "../entities/workflow-instance.entity.js";
import type { ValidationReport } from "../entities/validation-report.entity.js";
import { WORKFLOW_INSTANCE_SCHEMA_ID } from "../schemas/entities/workflow-instance.schema.js";
import {
  buildValidationReport,
  requireSchemaValidator,
  resolveGeneratedAt,
  type ValidationOptions,
  validateBySchema,
} from "./common/validation-result.js";
import { validateWorkflowInstanceInvariants } from "./domain-invariants.validator.js";

export const validateWorkflowInstance = (
  input: WorkflowInstance,
  options?: ValidationOptions,
): ValidationReport => {
  const schemaValidator = requireSchemaValidator(WORKFLOW_INSTANCE_SCHEMA_ID);
  const schemaIssues = validateBySchema(schemaValidator, input);
  const issues = [...schemaIssues, ...validateWorkflowInstanceInvariants(input)];
  return buildValidationReport(
    "WorkflowInstance",
    input.workflowId,
    issues,
    resolveGeneratedAt(options),
  );
};
