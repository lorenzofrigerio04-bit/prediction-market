import { ContractType } from "../../../market-design/enums/contract-type.enum.js";
import { AdvancedValidationStatus } from "../../enums/advanced-validation-status.enum.js";
import { createAdvancedContractValidationReport } from "../entities/advanced-contract-validation-report.entity.js";
import { createAdvancedContractValidationReportId } from "../../value-objects/frontier-market-ids.vo.js";
import { createInvariantCheck } from "../../value-objects/invariant-check.vo.js";
import { createCompatibilityNote } from "../../value-objects/frontier-text.vo.js";
const toInvariantChecks = (input) => {
    if (input.contract_type === ContractType.RACE) {
        return [
            createInvariantCheck({
                code: "RACE_MIN_TARGETS",
                passed: input.payload.race_targets.filter((target) => target.active).length >= 2,
                message: "race requires at least two active targets",
            }),
        ];
    }
    if (input.contract_type === ContractType.SEQUENCE) {
        return [
            createInvariantCheck({
                code: "SEQUENCE_MIN_TARGETS",
                passed: input.payload.sequence_targets.length >= 2,
                message: "sequence requires at least two targets",
            }),
        ];
    }
    return [
        createInvariantCheck({
            code: "CONDITIONAL_TRIGGER_DEFINED",
            passed: input.payload.trigger_condition.triggering_outcome.length > 0,
            message: "conditional trigger must be explicitly defined",
        }),
    ];
};
export class DeterministicAdvancedContractValidator {
    validate(input) {
        const checked_invariants = toInvariantChecks(input);
        const blocking_issues = checked_invariants
            .filter((item) => !item.passed)
            .map((item) => ({
            code: item.code,
            message: item.message,
            path: "/",
        }));
        return createAdvancedContractValidationReport({
            id: createAdvancedContractValidationReportId(`fvr_${input.payload.id.slice(4)}`),
            contract_type: input.contract_type,
            validation_status: blocking_issues.length === 0
                ? AdvancedValidationStatus.VALID
                : AdvancedValidationStatus.INVALID,
            blocking_issues,
            warnings: [],
            checked_invariants,
            compatibility_notes: blocking_issues.length === 0
                ? [createCompatibilityNote("validated with deterministic advanced validator")]
                : [createCompatibilityNote("blocking issues detected by deterministic advanced validator")],
        });
    }
}
//# sourceMappingURL=deterministic-advanced-contract-validator.js.map