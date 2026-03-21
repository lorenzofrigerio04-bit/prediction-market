import { deepFreeze } from "../../../common/utils/deep-freeze.js";
import type { EntityVersion } from "../../../value-objects/entity-version.vo.js";
import type { FlagshipMarketSelectionId } from "../../value-objects/market-expansion-ids.vo.js";
import {
  createConfidenceScore01,
  createMarketRef,
  createSelectionReason,
  createSourceContextRef,
  createStrategicPriority,
  type ConfidenceScore01,
  type MarketRef,
  type SelectionReason,
  type SourceContextRef,
  type StrategicPriority,
} from "../../value-objects/market-expansion-shared.vo.js";

export type FlagshipMarketSelection = Readonly<{
  id: FlagshipMarketSelectionId;
  version: EntityVersion;
  source_context_ref: SourceContextRef;
  selected_market_ref: MarketRef;
  selection_reason: SelectionReason;
  strategic_priority: StrategicPriority;
  selection_confidence: ConfidenceScore01;
}>;

export const createFlagshipMarketSelection = (
  input: FlagshipMarketSelection,
): FlagshipMarketSelection =>
  deepFreeze({
    ...input,
    source_context_ref: createSourceContextRef(input.source_context_ref),
    selected_market_ref: createMarketRef(input.selected_market_ref),
    selection_reason: createSelectionReason(input.selection_reason),
    strategic_priority: createStrategicPriority(input.strategic_priority),
    selection_confidence: createConfidenceScore01(input.selection_confidence, "selection_confidence"),
  });
