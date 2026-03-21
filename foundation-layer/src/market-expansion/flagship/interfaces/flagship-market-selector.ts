import type { CandidateMarket } from "../../../entities/candidate-market.entity.js";
import type { ExpansionStrategy } from "../../strategies/entities/expansion-strategy.entity.js";
import type { FlagshipMarketSelection } from "../entities/flagship-market-selection.entity.js";

export type FlagshipMarketSelectorInput = Readonly<{
  candidate_markets: readonly CandidateMarket[];
  strategy: ExpansionStrategy;
  source_context_ref: string;
}>;

export interface FlagshipMarketSelector {
  select(input: FlagshipMarketSelectorInput): FlagshipMarketSelection;
}
