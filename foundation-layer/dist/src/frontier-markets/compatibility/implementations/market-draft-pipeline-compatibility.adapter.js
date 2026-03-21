import { AdvancedCompatibilityStatus } from "../../enums/advanced-compatibility-status.enum.js";
import { ContractType } from "../../../market-design/enums/contract-type.enum.js";
import { RaceValidationStatus } from "../../enums/race-validation-status.enum.js";
import { SequenceValidationStatus } from "../../enums/sequence-validation-status.enum.js";
import { ConditionalValidationStatus } from "../../enums/conditional-validation-status.enum.js";
import { createAdvancedMarketCompatibilityResult } from "../entities/advanced-market-compatibility-result.entity.js";
import { AdvancedValidationStatus } from "../../enums/advanced-validation-status.enum.js";
import { createAdvancedMarketCompatibilityResultId } from "../../value-objects/frontier-market-ids.vo.js";
import { createCompatibilityNote } from "../../value-objects/frontier-text.vo.js";
const deriveCompatibility = (contract) => {
    if ("race_targets" in contract) {
        if (contract.race_validation_status === RaceValidationStatus.INVALID) {
            return {
                contract_type: ContractType.RACE,
                status: AdvancedCompatibilityStatus.INCOMPATIBLE,
                notes: ["race contract is invalid and cannot be mapped to market draft pipeline"],
            };
        }
        if (contract.race_validation_status === RaceValidationStatus.REVIEW_REQUIRED) {
            return {
                contract_type: ContractType.RACE,
                status: AdvancedCompatibilityStatus.COMPATIBLE_WITH_WARNINGS,
                notes: ["race contract requires review before full market draft promotion"],
            };
        }
        return {
            contract_type: ContractType.RACE,
            status: AdvancedCompatibilityStatus.COMPATIBLE,
            notes: [],
        };
    }
    if ("sequence_targets" in contract) {
        if (contract.sequence_validation_status === SequenceValidationStatus.INVALID) {
            return {
                contract_type: ContractType.SEQUENCE,
                status: AdvancedCompatibilityStatus.INCOMPATIBLE,
                notes: ["sequence contract is invalid and cannot be mapped to market draft pipeline"],
            };
        }
        if (contract.sequence_validation_status === SequenceValidationStatus.REVIEW_REQUIRED) {
            return {
                contract_type: ContractType.SEQUENCE,
                status: AdvancedCompatibilityStatus.COMPATIBLE_WITH_WARNINGS,
                notes: ["sequence contract requires review before full market draft promotion"],
            };
        }
        return {
            contract_type: ContractType.SEQUENCE,
            status: AdvancedCompatibilityStatus.COMPATIBLE,
            notes: [],
        };
    }
    if (contract.conditional_validation_status === ConditionalValidationStatus.INVALID) {
        return {
            contract_type: ContractType.CONDITIONAL,
            status: AdvancedCompatibilityStatus.INCOMPATIBLE,
            notes: ["conditional contract trigger is invalid for market draft pipeline"],
        };
    }
    if (contract.conditional_validation_status === ConditionalValidationStatus.TRIGGER_PENDING) {
        return {
            contract_type: ContractType.CONDITIONAL,
            status: AdvancedCompatibilityStatus.COMPATIBLE_WITH_WARNINGS,
            notes: ["conditional contract trigger is pending; market draft should remain non-publishable"],
        };
    }
    return {
        contract_type: ContractType.CONDITIONAL,
        status: AdvancedCompatibilityStatus.COMPATIBLE,
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
                "advanced validation status is not ready; market draft promotion remains non-ready",
            ],
        };
    }
    return compatibility;
};
export class MarketDraftPipelineCompatibilityAdapter {
    adapt(contract, validation_report) {
        const compatibility = applyValidationStatusGate(deriveCompatibility(contract), validation_report);
        return createAdvancedMarketCompatibilityResult({
            id: createAdvancedMarketCompatibilityResultId(`fcp_${contract.id.slice(4)}md`),
            target: "market_draft_pipeline",
            status: compatibility.status,
            mapped_artifact: {
                frontier_contract_id: contract.id,
                frontier_version: contract.version,
                contract_type: compatibility.contract_type,
                mode: "deterministic-bridge",
                readiness: compatibility.status,
                validation_status: validation_report?.validation_status ?? null,
                lossy_fields: ["advanced_dependency_graph", "trigger_eval_state"],
            },
            notes: [
                createCompatibilityNote("advanced contract mapped to market draft pipeline shape"),
                ...compatibility.notes.map(createCompatibilityNote),
            ],
        });
    }
}
//# sourceMappingURL=market-draft-pipeline-compatibility.adapter.js.map