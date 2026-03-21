import { ValidationError } from "../../../common/errors/validation-error.js";
import { deepFreeze } from "../../../common/utils/deep-freeze.js";
import type { EntityVersion } from "../../../value-objects/entity-version.vo.js";
import { DerivativeType } from "../../enums/derivative-type.enum.js";
import type {
  DerivativeMarketDefinitionId,
  MarketFamilyId,
} from "../../value-objects/market-expansion-ids.vo.js";
import {
  createDependencyStrength,
  createMarketRef,
  createRelationRef,
  type DerivativeDependencyStrength,
  type MarketRef,
  type RelationRef,
} from "../../value-objects/market-expansion-shared.vo.js";

export type DerivativeMarketDefinition = Readonly<{
  id: DerivativeMarketDefinitionId;
  version: EntityVersion;
  parent_family_id: MarketFamilyId;
  source_relation_ref: RelationRef;
  market_ref: MarketRef;
  derivative_type: DerivativeType;
  dependency_strength: DerivativeDependencyStrength;
  active: boolean;
}>;

export const createDerivativeMarketDefinition = (
  input: DerivativeMarketDefinition,
): DerivativeMarketDefinition => {
  if (!Object.values(DerivativeType).includes(input.derivative_type)) {
    throw new ValidationError("INVALID_DERIVATIVE_MARKET_DEFINITION", "derivative_type is invalid");
  }
  const source_relation_ref = createRelationRef(input.source_relation_ref);
  if (source_relation_ref.startsWith("invalid_")) {
    throw new ValidationError(
      "INVALID_DERIVATIVE_MARKET_DEFINITION",
      "derivative cannot be active with invalid source_relation_ref",
    );
  }
  return deepFreeze({
    ...input,
    source_relation_ref,
    market_ref: createMarketRef(input.market_ref),
    dependency_strength: createDependencyStrength(input.dependency_strength),
  });
};
