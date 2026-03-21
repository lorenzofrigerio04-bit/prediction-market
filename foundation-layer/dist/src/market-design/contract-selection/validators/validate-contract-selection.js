import { errorIssue } from "../../../entities/validation-report.entity.js";
import { buildValidationReport, requireSchemaValidator, resolveGeneratedAt, validateBySchema, } from "../../../validators/common/validation-result.js";
import { OPERATIVE_CONTRACT_TYPES } from "../../enums/contract-type.enum.js";
import { CONTRACT_SELECTION_SCHEMA_ID } from "../../schemas/contract-selection.schema.js";
const validateContractSelectionInvariants = (input) => {
    const operativeContractTypes = new Set(OPERATIVE_CONTRACT_TYPES);
    const issues = [];
    if (!operativeContractTypes.has(input.selected_contract_type)) {
        issues.push(errorIssue("UNSUPPORTED_OPERATIVE_CONTRACT_TYPE", "/selected_contract_type", "selected_contract_type is not currently supported"));
    }
    if (input.rejected_contract_types.includes(input.selected_contract_type)) {
        issues.push(errorIssue("INVALID_CONTRACT_SELECTION", "/rejected_contract_types", "selected_contract_type cannot be present in rejected_contract_types"));
    }
    return issues;
};
export const validateContractSelection = (input, options) => {
    const schemaValidator = requireSchemaValidator(CONTRACT_SELECTION_SCHEMA_ID);
    const schemaIssues = validateBySchema(schemaValidator, input);
    const issues = [...schemaIssues, ...validateContractSelectionInvariants(input)];
    return buildValidationReport("ContractSelection", input.id, issues, resolveGeneratedAt(options));
};
//# sourceMappingURL=validate-contract-selection.js.map