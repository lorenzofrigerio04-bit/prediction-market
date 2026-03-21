import type { EntityVersion } from "../../../value-objects/entity-version.vo.js";
import type { FlagshipMarketSelectionId } from "../../value-objects/market-expansion-ids.vo.js";
import { type ConfidenceScore01, type MarketRef, type SelectionReason, type SourceContextRef, type StrategicPriority } from "../../value-objects/market-expansion-shared.vo.js";
export type FlagshipMarketSelection = Readonly<{
    id: FlagshipMarketSelectionId;
    version: EntityVersion;
    source_context_ref: SourceContextRef;
    selected_market_ref: MarketRef;
    selection_reason: SelectionReason;
    strategic_priority: StrategicPriority;
    selection_confidence: ConfidenceScore01;
}>;
export declare const createFlagshipMarketSelection: (input: FlagshipMarketSelection) => FlagshipMarketSelection;
//# sourceMappingURL=flagship-market-selection.entity.d.ts.map