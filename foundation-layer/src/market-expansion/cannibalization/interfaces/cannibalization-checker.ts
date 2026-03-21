import type { MarketFamily } from "../../families/entities/market-family.entity.js";
import type { MarketRelationship } from "../../relationships/entities/market-relationship.entity.js";
import type { CannibalizationCheckResult } from "../entities/cannibalization-check-result.entity.js";

export type CannibalizationCheckerInput = Readonly<{
  family: MarketFamily;
  relationships: readonly MarketRelationship[];
}>;

export interface CannibalizationChecker {
  check(input: CannibalizationCheckerInput): CannibalizationCheckResult;
}
