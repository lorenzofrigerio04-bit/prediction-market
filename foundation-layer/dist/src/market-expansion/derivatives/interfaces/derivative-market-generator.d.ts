import type { CandidateMarket } from "../../../entities/candidate-market.entity.js";
import type { EventRelation } from "../../../event-intelligence/graph/entities/event-relation.entity.js";
import type { MarketFamilyId } from "../../value-objects/market-expansion-ids.vo.js";
import type { ExpansionStrategy } from "../../strategies/entities/expansion-strategy.entity.js";
import type { FlagshipMarketSelection } from "../../flagship/entities/flagship-market-selection.entity.js";
import type { DerivativeMarketDefinition } from "../entities/derivative-market-definition.entity.js";
export type DerivativeMarketGeneratorInput = Readonly<{
    family_id: MarketFamilyId;
    flagship: FlagshipMarketSelection;
    strategy: ExpansionStrategy;
    candidate_markets: readonly CandidateMarket[];
    event_relations: readonly EventRelation[];
}>;
export interface DerivativeMarketGenerator {
    generate(input: DerivativeMarketGeneratorInput): readonly DerivativeMarketDefinition[];
}
//# sourceMappingURL=derivative-market-generator.d.ts.map