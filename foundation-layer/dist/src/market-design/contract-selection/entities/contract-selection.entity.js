import { ValidationError } from "../../../common/errors/validation-error.js";
import { deepFreeze } from "../../../common/utils/deep-freeze.js";
import { ContractSelectionStatus } from "../../enums/contract-selection-status.enum.js";
import { ContractType, OPERATIVE_CONTRACT_TYPES } from "../../enums/contract-type.enum.js";
import { createRejectedContractTypes } from "../../value-objects/reason-collections.vo.js";
import { createScore01 } from "../../value-objects/score.vo.js";
export const createContractSelection = (input) => {
    const operativeContractTypes = new Set(OPERATIVE_CONTRACT_TYPES);
    createScore01(input.selection_confidence, "selection_confidence");
    if (!Object.values(ContractType).includes(input.selected_contract_type)) {
        throw new ValidationError("INVALID_CONTRACT_TYPE", "selected_contract_type is invalid");
    }
    if (!Object.values(ContractSelectionStatus).includes(input.status)) {
        throw new ValidationError("INVALID_CONTRACT_SELECTION_STATUS", "status is invalid");
    }
    if (!operativeContractTypes.has(input.selected_contract_type)) {
        throw new ValidationError("UNSUPPORTED_OPERATIVE_CONTRACT_TYPE", "selected_contract_type is not currently supported by operational validators");
    }
    const rejected = createRejectedContractTypes(input.rejected_contract_types);
    if (rejected.includes(input.selected_contract_type)) {
        throw new ValidationError("INVALID_CONTRACT_SELECTION", "selected_contract_type cannot be present in rejected_contract_types");
    }
    if (input.contract_type_reason.trim().length === 0) {
        throw new ValidationError("INVALID_CONTRACT_SELECTION", "contract_type_reason must be non-empty");
    }
    return deepFreeze({
        ...input,
        contract_type_reason: input.contract_type_reason.trim(),
        rejected_contract_types: [...input.rejected_contract_types],
    });
};
//# sourceMappingURL=contract-selection.entity.js.map