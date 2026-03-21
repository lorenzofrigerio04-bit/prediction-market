import { type ValidationReport } from "../../../entities/validation-report.entity.js";
import { buildValidationReport, requireSchemaValidator, resolveGeneratedAt, type ValidationOptions, validateBySchema } from "../../../validators/common/validation-result.js";
import type { OperationsConsoleGovernanceView } from "../entities/operations-console-governance-view.entity.js";
import { OPERATIONS_CONSOLE_GOVERNANCE_VIEW_SCHEMA_ID } from "../../schemas/operations-console-governance-view.schema.js";

export const validateOperationsConsoleGovernanceView = (input: OperationsConsoleGovernanceView, options?: ValidationOptions): ValidationReport => {
  const v = requireSchemaValidator(OPERATIONS_CONSOLE_GOVERNANCE_VIEW_SCHEMA_ID);
  return buildValidationReport("OperationsConsoleGovernanceView", input.module_key, validateBySchema(v, input), resolveGeneratedAt(options));
};
