import { buildValidationReport, requireSchemaValidator, resolveGeneratedAt, validateBySchema } from "../../../validators/common/validation-result.js";
import { OPERATIONS_CONSOLE_GOVERNANCE_VIEW_SCHEMA_ID } from "../../schemas/operations-console-governance-view.schema.js";
export const validateOperationsConsoleGovernanceView = (input, options) => {
    const v = requireSchemaValidator(OPERATIONS_CONSOLE_GOVERNANCE_VIEW_SCHEMA_ID);
    return buildValidationReport("OperationsConsoleGovernanceView", input.module_key, validateBySchema(v, input), resolveGeneratedAt(options));
};
//# sourceMappingURL=validate-operations-console-governance-view.js.map