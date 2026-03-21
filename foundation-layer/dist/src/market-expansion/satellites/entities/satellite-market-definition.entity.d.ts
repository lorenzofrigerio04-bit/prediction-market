import type { EntityVersion } from "../../../value-objects/entity-version.vo.js";
import { SatelliteRole } from "../../enums/satellite-role.enum.js";
import type { MarketFamilyId, SatelliteMarketDefinitionId } from "../../value-objects/market-expansion-ids.vo.js";
import { type ExpansionNote, type MarketRef } from "../../value-objects/market-expansion-shared.vo.js";
export type SatelliteMarketDefinition = Readonly<{
    id: SatelliteMarketDefinitionId;
    version: EntityVersion;
    parent_family_id: MarketFamilyId;
    parent_market_ref: MarketRef;
    market_ref: MarketRef;
    satellite_role: SatelliteRole;
    dependency_notes_nullable: ExpansionNote | null;
    active: boolean;
}>;
export declare const createSatelliteMarketDefinition: (input: SatelliteMarketDefinition) => SatelliteMarketDefinition;
//# sourceMappingURL=satellite-market-definition.entity.d.ts.map