import { FamilyCompatibilityStatus } from "../../enums/family-compatibility-status.enum.js";
import { ExpansionValidationStatus } from "../../enums/expansion-validation-status.enum.js";
import { FamilyStatus } from "../../enums/family-status.enum.js";
import { createMarketFamilyCompatibilityResult } from "./market-family-compatibility-result.entity.js";
import type { FamilyCompatibilityAdapter } from "../interfaces/family-compatibility-adapter.js";
import type { MarketFamily } from "../../families/entities/market-family.entity.js";
import type { ExpansionValidationReport } from "../../validation/entities/expansion-validation-report.entity.js";
import { createMarketFamilyCompatibilityResultId } from "../../value-objects/market-expansion-ids.vo.js";

const toStatus = (report?: ExpansionValidationReport): FamilyCompatibilityStatus => {
  if (report === undefined || report.validation_status !== ExpansionValidationStatus.VALID) {
    return FamilyCompatibilityStatus.COMPATIBLE_WITH_WARNINGS;
  }
  return FamilyCompatibilityStatus.COMPATIBLE;
};

export class FamilyEditorialCompatibilityAdapter implements FamilyCompatibilityAdapter {
  adapt(family: MarketFamily, validation_report?: ExpansionValidationReport) {
    const baseStatus = toStatus(validation_report);
    const status =
      family.family_status === FamilyStatus.BLOCKED || family.family_status === FamilyStatus.INVALID
        ? FamilyCompatibilityStatus.INCOMPATIBLE
        : family.family_status === FamilyStatus.DRAFT &&
            baseStatus === FamilyCompatibilityStatus.COMPATIBLE
          ? FamilyCompatibilityStatus.COMPATIBLE_WITH_WARNINGS
          : baseStatus;
    return createMarketFamilyCompatibilityResult({
      id: createMarketFamilyCompatibilityResultId(`mcp_${family.id.slice(4)}ed`),
      target: "editorial_pipeline",
      status,
      mapped_artifact: {
        family_id: family.id,
        reviewable: true,
        needs_manual_review: status !== FamilyCompatibilityStatus.COMPATIBLE,
        readiness: status,
        validation_status: validation_report?.validation_status ?? null,
      },
      notes: ["editorial compatibility is provided as transport mapping only"],
    });
  }
}
