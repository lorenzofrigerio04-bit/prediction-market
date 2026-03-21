import { FamilyStatus } from "../../enums/family-status.enum.js";
import { SourceContextType } from "../../enums/source-context-type.enum.js";
import type { MarketFamilyBuilder, MarketFamilyBuilderInput } from "../interfaces/market-family-builder.js";
export declare class DeterministicMarketFamilyBuilder implements MarketFamilyBuilder {
    build(input: MarketFamilyBuilderInput): Readonly<{
        id: import("../../index.js").MarketFamilyId;
        version: import("../../../index.js").EntityVersion;
        family_key: import("../../index.js").FamilyKey;
        source_context_type: SourceContextType;
        source_context_ref: import("../../index.js").SourceContextRef;
        flagship_market_ref: import("../../index.js").MarketRef;
        satellite_market_refs: readonly import("../../index.js").MarketRef[];
        derivative_market_refs: readonly import("../../index.js").MarketRef[];
        family_status: FamilyStatus;
        family_metadata: import("../entities/market-family.entity.js").MarketFamilyMetadata;
    }>;
}
//# sourceMappingURL=deterministic-market-family-builder.d.ts.map