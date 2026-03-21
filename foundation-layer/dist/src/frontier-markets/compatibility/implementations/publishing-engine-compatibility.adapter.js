import { ContractType } from "../../../market-design/enums/contract-type.enum.js";
import { AdvancedCompatibilityStatus } from "../../enums/advanced-compatibility-status.enum.js";
import { RaceValidationStatus } from "../../enums/race-validation-status.enum.js";
import { SequenceValidationStatus } from "../../enums/sequence-validation-status.enum.js";
import { ConditionalValidationStatus } from "../../enums/conditional-validation-status.enum.js";
import { createAdvancedMarketCompatibilityResult } from "../entities/advanced-market-compatibility-result.entity.js";
import { AdvancedValidationStatus } from "../../enums/advanced-validation-status.enum.js";
import { createAdvancedMarketCompatibilityResultId } from "../../value-objects/frontier-market-ids.vo.js";
import { createCompatibilityNote } from "../../value-objects/frontier-text.vo.js";
const derivePublishingCompatibility = (contract) => {
    if ("race_targets" in contract) {
        if (contract.race_validation_status === RaceValidationStatus.INVALID) {
            return {
                contract_type: ContractType.RACE,
                status: AdvancedCompatibilityStatus.INCOMPATIBLE,
                notes: ["invalid race contract cannot be promoted to publishing candidate"],
            };
        }
        return {
            contract_type: ContractType.RACE,
            status: AdvancedCompatibilityStatus.COMPATIBLE_WITH_WARNINGS,
            notes: contract.race_validation_status === RaceValidationStatus.REVIEW_REQUIRED
                ? ["race contract is review_required; keep candidate as non-ready"]
                : [],
        };
    }
    if ("sequence_targets" in contract) {
        if (contract.sequence_validation_status === SequenceValidationStatus.INVALID) {
            return {
                contract_type: ContractType.SEQUENCE,
                status: AdvancedCompatibilityStatus.INCOMPATIBLE,
                notes: ["invalid sequence contract cannot be promoted to publishing candidate"],
            };
        }
        return {
            contract_type: ContractType.SEQUENCE,
            status: AdvancedCompatibilityStatus.COMPATIBLE_WITH_WARNINGS,
            notes: contract.sequence_validation_status === SequenceValidationStatus.REVIEW_REQUIRED
                ? ["sequence contract is review_required; keep candidate as non-ready"]
                : [],
        };
    }
    if (contract.conditional_validation_status === ConditionalValidationStatus.INVALID) {
        return {
            contract_type: ContractType.CONDITIONAL,
            status: AdvancedCompatibilityStatus.INCOMPATIBLE,
            notes: ["invalid conditional contract cannot be promoted to publishing candidate"],
        };
    }
    if (contract.conditional_validation_status === ConditionalValidationStatus.TRIGGER_PENDING) {
        return {
            contract_type: ContractType.CONDITIONAL,
            status: AdvancedCompatibilityStatus.COMPATIBLE_WITH_WARNINGS,
            notes: ["conditional trigger pending; publishing candidate must remain non-ready"],
        };
    }
    return {
        contract_type: ContractType.CONDITIONAL,
        status: AdvancedCompatibilityStatus.COMPATIBLE_WITH_WARNINGS,
        notes: [],
    };
};
const applyValidationStatusGate = (compatibility, validationReport) => {
    if (validationReport !== undefined &&
        validationReport.validation_status !== AdvancedValidationStatus.VALID) {
        return {
            ...compatibility,
            status: compatibility.status === AdvancedCompatibilityStatus.INCOMPATIBLE
                ? AdvancedCompatibilityStatus.INCOMPATIBLE
                : AdvancedCompatibilityStatus.COMPATIBLE_WITH_WARNINGS,
            notes: [
                ...compatibility.notes,
                "advanced validation status is not ready; publishing promotion remains non-ready",
            ],
        };
    }
    return compatibility;
};
export class PublishingEngineCompatibilityAdapter {
    adapt(contract, validation_report) {
        const compatibility = applyValidationStatusGate(derivePublishingCompatibility(contract), validation_report);
        return createAdvancedMarketCompatibilityResult({
            id: createAdvancedMarketCompatibilityResultId(`fcp_${contract.id.slice(4)}pb`),
            target: "publishing_engine",
            status: compatibility.status,
            mapped_artifact: {
                contract_type: compatibility.contract_type,
                readiness: compatibility.status,
                validation_status: validation_report?.validation_status ?? null,
                headline_hint: `Advanced ${compatibility.contract_type} contract`,
                summary_hint: `Deterministic publishing bridge for ${contract.id}`,
                rulebook_sections: ["contract_definition", "resolution_criteria", "invalidation"],
                lossy_fields: ["full_frontier_logic", "dependency_graph_resolution"],
            },
            notes: [
                createCompatibilityNote("publishing candidate generation supported via deterministic hints"),
                ...compatibility.notes.map(createCompatibilityNote),
            ],
        });
    }
}
//# sourceMappingURL=publishing-engine-compatibility.adapter.js.map