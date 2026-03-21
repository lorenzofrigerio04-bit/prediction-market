import type { EntityVersion } from "../../../value-objects/entity-version.vo.js";
import { DerivativeType } from "../../enums/derivative-type.enum.js";
import type { DerivativeMarketDefinitionId, MarketFamilyId } from "../../value-objects/market-expansion-ids.vo.js";
import { type DerivativeDependencyStrength, type MarketRef, type RelationRef } from "../../value-objects/market-expansion-shared.vo.js";
export type DerivativeMarketDefinition = Readonly<{
    id: DerivativeMarketDefinitionId;
    version: EntityVersion;
    parent_family_id: MarketFamilyId;
    source_relation_ref: RelationRef;
    market_ref: MarketRef;
    derivative_type: DerivativeType;
    dependency_strength: DerivativeDependencyStrength;
    active: boolean;
}>;
export declare const createDerivativeMarketDefinition: (input: DerivativeMarketDefinition) => DerivativeMarketDefinition;
//# sourceMappingURL=derivative-market-definition.entity.d.ts.map