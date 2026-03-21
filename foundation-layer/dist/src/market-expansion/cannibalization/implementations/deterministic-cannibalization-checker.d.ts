import { CannibalizationStatus } from "../../enums/cannibalization-status.enum.js";
import type { CannibalizationChecker, CannibalizationCheckerInput } from "../interfaces/cannibalization-checker.js";
export declare class DeterministicCannibalizationChecker implements CannibalizationChecker {
    check(input: CannibalizationCheckerInput): Readonly<{
        id: import("../../index.js").CannibalizationCheckResultId;
        family_id: import("../../index.js").MarketFamilyId;
        checked_market_pairs: readonly import("../entities/cannibalization-check-result.entity.js").CheckedMarketPair[];
        blocking_conflicts: readonly import("../../index.js").ExpansionNote[];
        warnings: readonly import("../../index.js").ExpansionNote[];
        check_status: CannibalizationStatus;
    }>;
}
//# sourceMappingURL=deterministic-cannibalization-checker.d.ts.map