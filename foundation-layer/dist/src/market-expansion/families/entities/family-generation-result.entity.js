import { deepFreeze } from "../../../common/utils/deep-freeze.js";
import { createConfidenceScore01, createDistinctMarketRefs, createExpansionNote, createMarketRef, } from "../../value-objects/market-expansion-shared.vo.js";
export const createFamilyGenerationResult = (input) => deepFreeze({
    ...input,
    generated_market_refs: createDistinctMarketRefs(input.generated_market_refs, "generated_market_refs"),
    flagship_ref: createMarketRef(input.flagship_ref),
    generation_confidence: createConfidenceScore01(input.generation_confidence, "generation_confidence"),
    output_notes_nullable: input.output_notes_nullable === null ? null : createExpansionNote(input.output_notes_nullable),
});
//# sourceMappingURL=family-generation-result.entity.js.map