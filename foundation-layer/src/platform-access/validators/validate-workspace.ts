import { type ValidationReport } from "../../entities/validation-report.entity.js";
import {
  buildValidationReport,
  requireSchemaValidator,
  resolveGeneratedAt,
  type ValidationOptions,
  validateBySchema,
} from "../../validators/common/validation-result.js";
import type { Workspace } from "../workspaces/entities/workspace.entity.js";
import { WORKSPACE_SCHEMA_ID } from "../schemas/workspace.schema.js";

export const validateWorkspace = (input: Workspace, options?: ValidationOptions): ValidationReport => {
  const schemaValidator = requireSchemaValidator(WORKSPACE_SCHEMA_ID);
  const schemaIssues = validateBySchema(schemaValidator, input);
  return buildValidationReport("Workspace", input.id, schemaIssues, resolveGeneratedAt(options));
};
