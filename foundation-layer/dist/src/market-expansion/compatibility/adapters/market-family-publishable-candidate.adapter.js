import { FamilyCompatibilityStatus } from "../../enums/family-compatibility-status.enum.js";
import { ExpansionValidationStatus } from "../../enums/expansion-validation-status.enum.js";
import { FamilyStatus } from "../../enums/family-status.enum.js";
import { createMarketFamilyCompatibilityResult } from "./market-family-compatibility-result.entity.js";
import { createMarketFamilyCompatibilityResultId } from "../../value-objects/market-expansion-ids.vo.js";
const toStatus = (report) => {
    if (report === undefined || report.validation_status !== ExpansionValidationStatus.VALID) {
        return FamilyCompatibilityStatus.COMPATIBLE_WITH_WARNINGS;
    }
    return FamilyCompatibilityStatus.COMPATIBLE;
};
export class MarketFamilyPublishableCandidateAdapter {
    adapt(family, validation_report) {
        const baseStatus = toStatus(validation_report);
        const status = family.family_status === FamilyStatus.BLOCKED || family.family_status === FamilyStatus.INVALID
            ? FamilyCompatibilityStatus.INCOMPATIBLE
            : family.family_status === FamilyStatus.DRAFT &&
                baseStatus === FamilyCompatibilityStatus.COMPATIBLE
                ? FamilyCompatibilityStatus.COMPATIBLE_WITH_WARNINGS
                : baseStatus;
        return createMarketFamilyCompatibilityResult({
            id: createMarketFamilyCompatibilityResultId(`mcp_${family.id.slice(4)}pb`),
            target: "publishable_candidate",
            status,
            mapped_artifact: {
                family_id: family.id,
                headline_hint: `Family flagship: ${family.flagship_market_ref}`,
                summary_hint: `Family includes ${family.satellite_market_refs.length} satellites and ${family.derivative_market_refs.length} derivatives`,
                rulebook_sections: ["family_scope", "flagship_market", "satellite_markets", "derivative_markets"],
                readiness: status,
                validation_status: validation_report?.validation_status ?? null,
                lossy_fields: ["full_family_context_graph"],
            },
            notes: ["publishable candidate mapping is deterministic and loss-aware"],
        });
    }
}
//# sourceMappingURL=market-family-publishable-candidate.adapter.js.map