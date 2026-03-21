import type { MarketFamily } from "../../families/entities/market-family.entity.js";
import type { ExpansionValidationReport } from "../../validation/entities/expansion-validation-report.entity.js";
import type { MarketFamilyCompatibilityResult } from "../adapters/market-family-compatibility-result.entity.js";

export interface FamilyCompatibilityAdapter {
  adapt(
    family: MarketFamily,
    validation_report?: ExpansionValidationReport,
  ): MarketFamilyCompatibilityResult;
}
