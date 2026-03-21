import { deepFreeze } from "../../../common/utils/deep-freeze.js";
import { createConfidenceScore01, createMarketRef, createSelectionReason, createSourceContextRef, createStrategicPriority, } from "../../value-objects/market-expansion-shared.vo.js";
export const createFlagshipMarketSelection = (input) => deepFreeze({
    ...input,
    source_context_ref: createSourceContextRef(input.source_context_ref),
    selected_market_ref: createMarketRef(input.selected_market_ref),
    selection_reason: createSelectionReason(input.selection_reason),
    strategic_priority: createStrategicPriority(input.strategic_priority),
    selection_confidence: createConfidenceScore01(input.selection_confidence, "selection_confidence"),
});
//# sourceMappingURL=flagship-market-selection.entity.js.map