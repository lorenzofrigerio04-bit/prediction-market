import { ValidationError } from "../../../common/errors/validation-error.js";
import { createDeterministicToken } from "../../../publishing/value-objects/publishing-shared.vo.js";
import { createEntityVersion } from "../../../value-objects/entity-version.vo.js";
import { createFlagshipMarketSelection } from "../entities/flagship-market-selection.entity.js";
import type { FlagshipMarketSelector, FlagshipMarketSelectorInput } from "../interfaces/flagship-market-selector.js";
import { createFlagshipMarketSelectionId } from "../../value-objects/market-expansion-ids.vo.js";

export class DeterministicFlagshipMarketSelector implements FlagshipMarketSelector {
  select(input: FlagshipMarketSelectorInput) {
    if (input.candidate_markets.length === 0) {
      throw new ValidationError(
        "FLAGSHIP_SELECTION_FAILED",
        "candidate_markets must include at least one market",
      );
    }
    const sorted = [...input.candidate_markets].sort((left, right) =>
      right.confidenceScore - left.confidenceScore || left.id.localeCompare(right.id),
    );
    const selected = sorted[0]!;
    const token = createDeterministicToken(`${input.source_context_ref}|${selected.id}`);
    return createFlagshipMarketSelection({
      id: createFlagshipMarketSelectionId(`mfs_${token}sel`),
      version: createEntityVersion(1),
      source_context_ref: input.source_context_ref,
      selected_market_ref: selected.id,
      selection_reason: `highest-confidence candidate selected under ${input.strategy.strategy_type} strategy`,
      strategic_priority: 8,
      selection_confidence: selected.confidenceScore,
    });
  }
}
