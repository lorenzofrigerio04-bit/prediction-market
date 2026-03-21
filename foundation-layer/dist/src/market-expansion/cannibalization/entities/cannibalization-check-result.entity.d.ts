import { CannibalizationStatus } from "../../enums/cannibalization-status.enum.js";
import type { CannibalizationCheckResultId, MarketFamilyId } from "../../value-objects/market-expansion-ids.vo.js";
import { type ExpansionNote } from "../../value-objects/market-expansion-shared.vo.js";
export type CheckedMarketPair = Readonly<{
    source_market_ref: string;
    target_market_ref: string;
}>;
export type CannibalizationCheckResult = Readonly<{
    id: CannibalizationCheckResultId;
    family_id: MarketFamilyId;
    checked_market_pairs: readonly CheckedMarketPair[];
    blocking_conflicts: readonly ExpansionNote[];
    warnings: readonly ExpansionNote[];
    check_status: CannibalizationStatus;
}>;
export declare const createCannibalizationCheckResult: (input: CannibalizationCheckResult) => CannibalizationCheckResult;
//# sourceMappingURL=cannibalization-check-result.entity.d.ts.map