import { ValidationError } from "../../../common/errors/validation-error.js";
import { deepFreeze } from "../../../common/utils/deep-freeze.js";
import type { EntityVersion } from "../../../value-objects/entity-version.vo.js";
import { FamilyStatus } from "../../enums/family-status.enum.js";
import { SourceContextType } from "../../enums/source-context-type.enum.js";
import type { MarketFamilyId } from "../../value-objects/market-expansion-ids.vo.js";
import {
  createDistinctMarketRefs,
  createFamilyKey,
  createMarketRef,
  createSourceContextRef,
  type FamilyKey,
  type MarketRef,
  type SourceContextRef,
} from "../../value-objects/market-expansion-shared.vo.js";

export type MarketFamilyMetadata = Readonly<{
  context_hash: string;
  generation_mode: "deterministic-v1";
  tags: readonly string[];
  notes: readonly string[];
}>;

export type MarketFamily = Readonly<{
  id: MarketFamilyId;
  version: EntityVersion;
  family_key: FamilyKey;
  source_context_type: SourceContextType;
  source_context_ref: SourceContextRef;
  flagship_market_ref: MarketRef;
  satellite_market_refs: readonly MarketRef[];
  derivative_market_refs: readonly MarketRef[];
  family_status: FamilyStatus;
  family_metadata: MarketFamilyMetadata;
}>;

export const getMarketFamilyTotalMarkets = (family: MarketFamily): number =>
  1 + family.satellite_market_refs.length + family.derivative_market_refs.length;

export const createMarketFamily = (input: MarketFamily): MarketFamily => {
  if (!Object.values(SourceContextType).includes(input.source_context_type)) {
    throw new ValidationError("INVALID_MARKET_FAMILY", "source_context_type is invalid");
  }
  if (!Object.values(FamilyStatus).includes(input.family_status)) {
    throw new ValidationError("INVALID_MARKET_FAMILY", "family_status is invalid");
  }
  const family_key = createFamilyKey(input.family_key);
  const source_context_ref = createSourceContextRef(input.source_context_ref);
  const flagship_market_ref = createMarketRef(input.flagship_market_ref);
  const satellite_market_refs = createDistinctMarketRefs(
    input.satellite_market_refs,
    "satellite_market_refs",
  );
  const derivative_market_refs = createDistinctMarketRefs(
    input.derivative_market_refs,
    "derivative_market_refs",
  );
  if (satellite_market_refs.includes(flagship_market_ref)) {
    throw new ValidationError(
      "INVALID_MARKET_FAMILY",
      "flagship_market_ref cannot appear in satellite_market_refs",
    );
  }
  if (derivative_market_refs.includes(flagship_market_ref)) {
    throw new ValidationError(
      "INVALID_MARKET_FAMILY",
      "flagship_market_ref cannot appear in derivative_market_refs",
    );
  }
  const allRefs = [flagship_market_ref, ...satellite_market_refs, ...derivative_market_refs];
  if (new Set(allRefs).size !== allRefs.length) {
    throw new ValidationError(
      "INVALID_MARKET_FAMILY",
      "all market references in family must be unique",
    );
  }
  return deepFreeze({
    ...input,
    family_key,
    source_context_ref,
    flagship_market_ref,
    satellite_market_refs,
    derivative_market_refs,
    family_metadata: deepFreeze({
      context_hash: input.family_metadata.context_hash,
      generation_mode: "deterministic-v1",
      tags: [...input.family_metadata.tags],
      notes: [...input.family_metadata.notes],
    }),
  });
};
