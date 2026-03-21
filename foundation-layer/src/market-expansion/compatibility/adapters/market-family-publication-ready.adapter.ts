import { FamilyCompatibilityStatus } from "../../enums/family-compatibility-status.enum.js";
import { ExpansionValidationStatus } from "../../enums/expansion-validation-status.enum.js";
import { FamilyStatus } from "../../enums/family-status.enum.js";
import { createMarketFamilyCompatibilityResult } from "./market-family-compatibility-result.entity.js";
import type { FamilyCompatibilityAdapter } from "../interfaces/family-compatibility-adapter.js";
import type { MarketFamily } from "../../families/entities/market-family.entity.js";
import type { ExpansionValidationReport } from "../../validation/entities/expansion-validation-report.entity.js";
import { createMarketFamilyCompatibilityResultId } from "../../value-objects/market-expansion-ids.vo.js";

const toStatus = (report?: ExpansionValidationReport): FamilyCompatibilityStatus => {
  if (report === undefined) {
    return FamilyCompatibilityStatus.COMPATIBLE_WITH_WARNINGS;
  }
  if (report.validation_status === ExpansionValidationStatus.INVALID) {
    return FamilyCompatibilityStatus.INCOMPATIBLE;
  }
  return FamilyCompatibilityStatus.COMPATIBLE_WITH_WARNINGS;
};

export class MarketFamilyPublicationReadyAdapter implements FamilyCompatibilityAdapter {
  adapt(family: MarketFamily, validation_report?: ExpansionValidationReport) {
    const baseStatus = toStatus(validation_report);
    const status =
      family.family_status === FamilyStatus.BLOCKED || family.family_status === FamilyStatus.INVALID
        ? FamilyCompatibilityStatus.INCOMPATIBLE
        : baseStatus;
    return createMarketFamilyCompatibilityResult({
      id: createMarketFamilyCompatibilityResultId(`mcp_${family.id.slice(4)}ra`),
      target: "publication_ready_artifact",
      status,
      mapped_artifact: {
        family_id: family.id,
        ready_flagship_ref: family.flagship_market_ref,
        readiness: status,
        validation_status: validation_report?.validation_status ?? null,
        needs_manual_gate: true,
        lossy_fields: ["editorial_decision_artifacts"],
      },
      notes: ["publication-ready compatibility keeps editorial gating outside this module"],
    });
  }
}
