import type { FlagshipMarketSelector, FlagshipMarketSelectorInput } from "../interfaces/flagship-market-selector.js";
export declare class DeterministicFlagshipMarketSelector implements FlagshipMarketSelector {
    select(input: FlagshipMarketSelectorInput): Readonly<{
        id: import("../../index.js").FlagshipMarketSelectionId;
        version: import("../../../index.js").EntityVersion;
        source_context_ref: import("../../index.js").SourceContextRef;
        selected_market_ref: import("../../index.js").MarketRef;
        selection_reason: import("../../index.js").SelectionReason;
        strategic_priority: import("../../index.js").StrategicPriority;
        selection_confidence: import("../../index.js").ConfidenceScore01;
    }>;
}
//# sourceMappingURL=deterministic-flagship-market-selector.d.ts.map