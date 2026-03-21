import { createDeterministicToken } from "../../../publishing/value-objects/publishing-shared.vo.js";
import { CannibalizationStatus } from "../../enums/cannibalization-status.enum.js";
import { createCannibalizationCheckResult } from "../entities/cannibalization-check-result.entity.js";
import { createCannibalizationCheckResultId } from "../../value-objects/market-expansion-ids.vo.js";
export class DeterministicCannibalizationChecker {
    check(input) {
        const checkedPairs = input.relationships.map((relation) => ({
            source_market_ref: relation.source_market_ref,
            target_market_ref: relation.target_market_ref,
        }));
        const blocking = input.relationships
            .filter((relation) => relation.blocking_cannibalization)
            .map((relation) => `blocking relation detected: ${relation.id}`);
        const warnings = input.relationships
            .filter((relation) => !relation.blocking_cannibalization)
            .map((relation) => `non-blocking overlap monitored: ${relation.id}`);
        const status = blocking.length > 0
            ? CannibalizationStatus.BLOCKING
            : warnings.length > 0
                ? CannibalizationStatus.WARNING
                : CannibalizationStatus.PASS;
        const token = createDeterministicToken(`${input.family.id}|${checkedPairs.length}|${blocking.length}`);
        return createCannibalizationCheckResult({
            id: createCannibalizationCheckResultId(`mcc_${token}chk`),
            family_id: input.family.id,
            checked_market_pairs: checkedPairs,
            blocking_conflicts: blocking,
            warnings,
            check_status: status,
        });
    }
}
//# sourceMappingURL=deterministic-cannibalization-checker.js.map