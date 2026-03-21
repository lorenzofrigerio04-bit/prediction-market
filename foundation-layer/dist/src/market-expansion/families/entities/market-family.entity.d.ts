import type { EntityVersion } from "../../../value-objects/entity-version.vo.js";
import { FamilyStatus } from "../../enums/family-status.enum.js";
import { SourceContextType } from "../../enums/source-context-type.enum.js";
import type { MarketFamilyId } from "../../value-objects/market-expansion-ids.vo.js";
import { type FamilyKey, type MarketRef, type SourceContextRef } from "../../value-objects/market-expansion-shared.vo.js";
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
export declare const getMarketFamilyTotalMarkets: (family: MarketFamily) => number;
export declare const createMarketFamily: (input: MarketFamily) => MarketFamily;
//# sourceMappingURL=market-family.entity.d.ts.map