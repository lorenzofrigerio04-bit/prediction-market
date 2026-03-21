import type { MarketFamily } from "../../families/entities/market-family.entity.js";
import type { CannibalizationCheckResult } from "../../cannibalization/entities/cannibalization-check-result.entity.js";
import type { MarketRelationship } from "../../relationships/entities/market-relationship.entity.js";
import type { ExpansionValidationReport } from "../entities/expansion-validation-report.entity.js";

export type ExpansionValidatorInput = Readonly<{
  family: MarketFamily;
  relationships: readonly MarketRelationship[];
  cannibalization: CannibalizationCheckResult;
}>;

export interface ExpansionValidator {
  validate(input: ExpansionValidatorInput): ExpansionValidationReport;
}
