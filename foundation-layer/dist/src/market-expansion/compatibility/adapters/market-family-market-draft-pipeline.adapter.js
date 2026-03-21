import { FamilyCompatibilityStatus } from "../../enums/family-compatibility-status.enum.js";
import { ExpansionValidationStatus } from "../../enums/expansion-validation-status.enum.js";
import { FamilyStatus } from "../../enums/family-status.enum.js";
import { createMarketFamilyCompatibilityResult } from "./market-family-compatibility-result.entity.js";
import { createMarketFamilyCompatibilityResultId } from "../../value-objects/market-expansion-ids.vo.js";
const toStatus = (report) => {
    if (report === undefined) {
        return FamilyCompatibilityStatus.COMPATIBLE_WITH_WARNINGS;
    }
    if (report.validation_status === ExpansionValidationStatus.INVALID) {
        return FamilyCompatibilityStatus.INCOMPATIBLE;
    }
    if (report.validation_status === ExpansionValidationStatus.VALID_WITH_WARNINGS) {
        return FamilyCompatibilityStatus.COMPATIBLE_WITH_WARNINGS;
    }
    return FamilyCompatibilityStatus.COMPATIBLE;
};
export class MarketFamilyMarketDraftPipelineAdapter {
    adapt(family, validation_report) {
        const baseStatus = toStatus(validation_report);
        const status = family.family_status === FamilyStatus.BLOCKED || family.family_status === FamilyStatus.INVALID
            ? FamilyCompatibilityStatus.INCOMPATIBLE
            : family.family_status === FamilyStatus.DRAFT &&
                baseStatus === FamilyCompatibilityStatus.COMPATIBLE
                ? FamilyCompatibilityStatus.COMPATIBLE_WITH_WARNINGS
                : baseStatus;
        return createMarketFamilyCompatibilityResult({
            id: createMarketFamilyCompatibilityResultId(`mcp_${family.id.slice(4)}md`),
            target: "market_draft_pipeline",
            status,
            mapped_artifact: {
                family_id: family.id,
                flagship_market_ref: family.flagship_market_ref,
                generated_market_refs: [
                    family.flagship_market_ref,
                    ...family.satellite_market_refs,
                    ...family.derivative_market_refs,
                ],
                readiness: status,
                validation_status: validation_report?.validation_status ?? null,
                lossy_fields: ["family_relationship_graph"],
            },
            notes: ["market family mapped to market draft pipeline compatibility envelope"],
        });
    }
}
//# sourceMappingURL=market-family-market-draft-pipeline.adapter.js.map