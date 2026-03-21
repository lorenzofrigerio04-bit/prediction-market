import { createDeterministicToken } from "../../../publishing/value-objects/publishing-shared.vo.js";
import { createEntityVersion } from "../../../value-objects/entity-version.vo.js";
import { SatelliteRole } from "../../enums/satellite-role.enum.js";
import { createSatelliteMarketDefinition } from "../entities/satellite-market-definition.entity.js";
import { createSatelliteMarketDefinitionId } from "../../value-objects/market-expansion-ids.vo.js";
const ROLE_ORDER = [
    SatelliteRole.HEDGE,
    SatelliteRole.SEGMENT,
    SatelliteRole.TIMING,
    SatelliteRole.EXPLAINER,
];
export class DeterministicSatelliteMarketGenerator {
    generate(input) {
        const candidates = input.candidate_markets
            .filter((item) => item.id !== input.flagship.selected_market_ref)
            .sort((left, right) => right.confidenceScore - left.confidenceScore || left.id.localeCompare(right.id))
            .slice(0, input.strategy.max_satellite_count);
        return candidates.map((item, index) => {
            const token = createDeterministicToken(`${input.family_id}|${item.id}|satellite|${index}`);
            return createSatelliteMarketDefinition({
                id: createSatelliteMarketDefinitionId(`msd_${token}sat`),
                version: createEntityVersion(1),
                parent_family_id: input.family_id,
                parent_market_ref: input.flagship.selected_market_ref,
                market_ref: item.id,
                satellite_role: ROLE_ORDER[index % ROLE_ORDER.length] ?? SatelliteRole.EXPLAINER,
                dependency_notes_nullable: `linked to flagship ${input.flagship.selected_market_ref}`,
                active: true,
            });
        });
    }
}
//# sourceMappingURL=deterministic-satellite-market-generator.js.map