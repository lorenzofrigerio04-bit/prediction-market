import { ClaimPolarity } from "../enums/claim-polarity.enum.js";
import { MarketResolutionBasis } from "../enums/market-resolution-basis.enum.js";
import type { ClaimId } from "../value-objects/claim-id.vo.js";
import type { ConfidenceScore } from "../value-objects/confidence-score.vo.js";
import type { EntityVersion } from "../value-objects/entity-version.vo.js";
import type { EventId } from "../value-objects/event-id.vo.js";
import type { ResolutionWindow } from "../value-objects/resolution-window.vo.js";
import type { SourceId } from "../value-objects/source-id.vo.js";
import type { Tag } from "../value-objects/tag.vo.js";
export type StructuredClaim = Readonly<{
    id: ClaimId;
    canonicalEventId: EventId;
    claimText: string;
    normalizedClaimText: string;
    polarity: ClaimPolarity;
    claimSubject: string;
    claimPredicate: string;
    claimObject: string | null;
    resolutionBasis: MarketResolutionBasis;
    resolutionWindow: ResolutionWindow;
    confidenceScore: ConfidenceScore;
    sourceRecordIds: readonly SourceId[];
    tags: readonly Tag[];
    entityVersion: EntityVersion;
}>;
export declare const createStructuredClaim: (input: StructuredClaim) => StructuredClaim;
//# sourceMappingURL=structured-claim.entity.d.ts.map