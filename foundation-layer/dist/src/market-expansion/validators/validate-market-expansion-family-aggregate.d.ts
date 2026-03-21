import { type ValidationReport } from "../../entities/validation-report.entity.js";
import { type ValidationOptions } from "../../validators/common/validation-result.js";
import type { MarketFamily } from "../families/entities/market-family.entity.js";
import type { FlagshipMarketSelection } from "../flagship/entities/flagship-market-selection.entity.js";
import type { SatelliteMarketDefinition } from "../satellites/entities/satellite-market-definition.entity.js";
import type { DerivativeMarketDefinition } from "../derivatives/entities/derivative-market-definition.entity.js";
import type { MarketRelationship } from "../relationships/entities/market-relationship.entity.js";
import type { CannibalizationCheckResult } from "../cannibalization/entities/cannibalization-check-result.entity.js";
export type MarketExpansionFamilyAggregateInput = Readonly<{
    family: MarketFamily;
    flagship: FlagshipMarketSelection;
    satellites: readonly SatelliteMarketDefinition[];
    derivatives: readonly DerivativeMarketDefinition[];
    relationships: readonly MarketRelationship[];
    cannibalization: CannibalizationCheckResult;
}>;
export declare const validateMarketExpansionFamilyAggregate: (input: MarketExpansionFamilyAggregateInput, options?: ValidationOptions) => ValidationReport;
//# sourceMappingURL=validate-market-expansion-family-aggregate.d.ts.map