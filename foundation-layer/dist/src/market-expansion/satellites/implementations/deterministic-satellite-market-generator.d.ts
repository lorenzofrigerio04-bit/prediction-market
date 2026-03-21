import { SatelliteRole } from "../../enums/satellite-role.enum.js";
import type { SatelliteMarketGenerator, SatelliteMarketGeneratorInput } from "../interfaces/satellite-market-generator.js";
export declare class DeterministicSatelliteMarketGenerator implements SatelliteMarketGenerator {
    generate(input: SatelliteMarketGeneratorInput): Readonly<{
        id: import("../../index.js").SatelliteMarketDefinitionId;
        version: import("../../../index.js").EntityVersion;
        parent_family_id: import("../../index.js").MarketFamilyId;
        parent_market_ref: import("../../index.js").MarketRef;
        market_ref: import("../../index.js").MarketRef;
        satellite_role: SatelliteRole;
        dependency_notes_nullable: import("../../index.js").ExpansionNote | null;
        active: boolean;
    }>[];
}
//# sourceMappingURL=deterministic-satellite-market-generator.d.ts.map