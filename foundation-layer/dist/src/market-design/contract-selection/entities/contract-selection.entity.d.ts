import type { CanonicalEventIntelligenceId } from "../../../event-intelligence/value-objects/event-intelligence-ids.vo.js";
import type { EntityVersion } from "../../../value-objects/entity-version.vo.js";
import { ContractSelectionStatus } from "../../enums/contract-selection-status.enum.js";
import { ContractType } from "../../enums/contract-type.enum.js";
import type { ContractSelectionId } from "../../value-objects/market-design-ids.vo.js";
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
export declare const createContractSelection: (input: ContractSelection) => ContractSelection;
//# sourceMappingURL=contract-selection.entity.d.ts.map