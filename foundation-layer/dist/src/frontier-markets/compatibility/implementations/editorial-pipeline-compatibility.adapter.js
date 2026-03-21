import { AdvancedCompatibilityStatus } from "../../enums/advanced-compatibility-status.enum.js";
import { ContractType } from "../../../market-design/enums/contract-type.enum.js";
import { RaceValidationStatus } from "../../enums/race-validation-status.enum.js";
import { SequenceValidationStatus } from "../../enums/sequence-validation-status.enum.js";
import { ConditionalValidationStatus } from "../../enums/conditional-validation-status.enum.js";
import { createAdvancedMarketCompatibilityResult } from "../entities/advanced-market-compatibility-result.entity.js";
import { AdvancedValidationStatus } from "../../enums/advanced-validation-status.enum.js";
import { createAdvancedMarketCompatibilityResultId } from "../../value-objects/frontier-market-ids.vo.js";
import { createCompatibilityNote } from "../../value-objects/frontier-text.vo.js";
const toEditorialContractType = (contract) => {
    if ("race_targets" in contract) {
        return ContractType.RACE;
    }
    if ("sequence_targets" in contract) {
        return ContractType.SEQUENCE;
    }
    return ContractType.CONDITIONAL;
};
const toNeedsManualReview = (contract) => {
    if ("race_targets" in contract) {
        return contract.race_validation_status !== RaceValidationStatus.VALID;
    }
    if ("sequence_targets" in contract) {
        return contract.sequence_validation_status !== SequenceValidationStatus.VALID;
    }
    return contract.conditional_validation_status !== ConditionalValidationStatus.ACTIVE_READY;
};
const applyValidationStatusGate = (status, needsManualReview, validationReport) => {
    if (validationReport !== undefined &&
        validationReport.validation_status !== AdvancedValidationStatus.VALID) {
        return {
            status: AdvancedCompatibilityStatus.COMPATIBLE_WITH_WARNINGS,
            needsManualReview: true,
        };
    }
    return { status, needsManualReview };
};
export class EditorialPipelineCompatibilityAdapter {
    adapt(contract, validation_report) {
        const needsManualReview = toNeedsManualReview(contract);
        const gated = applyValidationStatusGate(needsManualReview
            ? AdvancedCompatibilityStatus.COMPATIBLE_WITH_WARNINGS
            : AdvancedCompatibilityStatus.COMPATIBLE, needsManualReview, validation_report);
        return createAdvancedMarketCompatibilityResult({
            id: createAdvancedMarketCompatibilityResultId(`fcp_${contract.id.slice(4)}ed`),
            target: "editorial_pipeline",
            status: gated.status,
            mapped_artifact: {
                contract_type: toEditorialContractType(contract),
                review_artifact_key: contract.id,
                reviewable: true,
                readiness: gated.status,
                validation_status: validation_report?.validation_status ?? null,
                needs_manual_review: gated.needsManualReview,
                deterministic_notes: true,
            },
            notes: [
                createCompatibilityNote("editorial review transport shape generated deterministically"),
                ...(gated.needsManualReview
                    ? [
                        createCompatibilityNote("contract status requires manual editorial review before promotion"),
                    ]
                    : []),
                ...(validation_report !== undefined &&
                    validation_report.validation_status !== AdvancedValidationStatus.VALID
                    ? [
                        createCompatibilityNote("advanced validation status is not ready; editorial flow remains manual-review gated"),
                    ]
                    : []),
            ],
        });
    }
}
//# sourceMappingURL=editorial-pipeline-compatibility.adapter.js.map