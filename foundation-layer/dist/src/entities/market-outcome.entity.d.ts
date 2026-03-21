import { CandidateOutcomeType } from "../enums/candidate-outcome-type.enum.js";
import type { EntityVersion } from "../value-objects/entity-version.vo.js";
import type { OutcomeId } from "../value-objects/outcome-id.vo.js";
import type { Probability } from "../value-objects/probability.vo.js";
export type MarketOutcome = Readonly<{
    id: OutcomeId;
    outcomeType: CandidateOutcomeType;
    label: string;
    shortLabel: string | null;
    description: string | null;
    orderIndex: number;
    probabilityHint: Probability | null;
    entityVersion: EntityVersion;
}>;
export declare const createMarketOutcome: (input: MarketOutcome) => MarketOutcome;
//# sourceMappingURL=market-outcome.entity.d.ts.map