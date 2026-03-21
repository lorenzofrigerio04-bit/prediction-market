import { ValidationError } from "../../../common/errors/validation-error.js";
import { deepFreeze } from "../../../common/utils/deep-freeze.js";
import type { CanonicalEventIntelligenceId } from "../../../event-intelligence/value-objects/event-intelligence-ids.vo.js";
import type { EntityVersion } from "../../../value-objects/entity-version.vo.js";
import { ContractSelectionStatus } from "../../enums/contract-selection-status.enum.js";
import { ContractType, OPERATIVE_CONTRACT_TYPES } from "../../enums/contract-type.enum.js";
import type { ContractSelectionId } from "../../value-objects/market-design-ids.vo.js";
import { createRejectedContractTypes } from "../../value-objects/reason-collections.vo.js";
import { createScore01 } from "../../value-objects/score.vo.js";

export type ContractSelection = Readonly<{
  id: ContractSelectionId;
  version: EntityVersion;
  canonical_event_id: CanonicalEventIntelligenceId;
  status: ContractSelectionStatus;
  selected_contract_type: ContractType;
  contract_type_reason: string;
  selection_confidence: number;
  rejected_contract_types: readonly ContractType[];
  selection_metadata: Readonly<Record<string, unknown>>;
}>;

export const createContractSelection = (input: ContractSelection): ContractSelection => {
  const operativeContractTypes = new Set<ContractType>(OPERATIVE_CONTRACT_TYPES as readonly ContractType[]);
  createScore01(input.selection_confidence, "selection_confidence");
  if (!Object.values(ContractType).includes(input.selected_contract_type)) {
    throw new ValidationError("INVALID_CONTRACT_TYPE", "selected_contract_type is invalid");
  }
  if (!Object.values(ContractSelectionStatus).includes(input.status)) {
    throw new ValidationError("INVALID_CONTRACT_SELECTION_STATUS", "status is invalid");
  }
  if (!operativeContractTypes.has(input.selected_contract_type)) {
    throw new ValidationError(
      "UNSUPPORTED_OPERATIVE_CONTRACT_TYPE",
      "selected_contract_type is not currently supported by operational validators",
    );
  }
  const rejected = createRejectedContractTypes(input.rejected_contract_types);
  if (rejected.includes(input.selected_contract_type)) {
    throw new ValidationError(
      "INVALID_CONTRACT_SELECTION",
      "selected_contract_type cannot be present in rejected_contract_types",
    );
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
