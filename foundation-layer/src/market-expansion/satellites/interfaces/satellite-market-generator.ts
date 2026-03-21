import type { CandidateMarket } from "../../../entities/candidate-market.entity.js";
import type { MarketFamilyId } from "../../value-objects/market-expansion-ids.vo.js";
import type { ExpansionStrategy } from "../../strategies/entities/expansion-strategy.entity.js";
import type { FlagshipMarketSelection } from "../../flagship/entities/flagship-market-selection.entity.js";
import type { SatelliteMarketDefinition } from "../entities/satellite-market-definition.entity.js";

export type SatelliteMarketGeneratorInput = Readonly<{
  family_id: MarketFamilyId;
  flagship: FlagshipMarketSelection;
  strategy: ExpansionStrategy;
  candidate_markets: readonly CandidateMarket[];
}>;

export interface SatelliteMarketGenerator {
  generate(input: SatelliteMarketGeneratorInput): readonly SatelliteMarketDefinition[];
}
