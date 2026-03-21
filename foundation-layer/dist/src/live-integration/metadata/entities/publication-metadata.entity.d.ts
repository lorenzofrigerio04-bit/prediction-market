import { ComplianceFlag } from "../../enums/compliance-flag.enum.js";
import { MarketVisibility } from "../../enums/market-visibility.enum.js";
import { type JurisdictionCode } from "../../value-objects/jurisdiction-code.vo.js";
import { type PublicationTag } from "../../value-objects/publication-tag.vo.js";
export type PublicationMetadata = Readonly<{
    category: string;
    tags: readonly PublicationTag[];
    jurisdiction: JurisdictionCode;
    display_priority: number;
    market_visibility: MarketVisibility;
    compliance_flags: readonly ComplianceFlag[];
}>;
export type PublicationMetadataInput = Readonly<{
    category: string;
    tags: readonly string[];
    jurisdiction: string;
    display_priority: number;
    market_visibility: MarketVisibility;
    compliance_flags: readonly ComplianceFlag[];
}>;
export declare const createPublicationMetadata: (input: PublicationMetadataInput) => PublicationMetadata;
//# sourceMappingURL=publication-metadata.entity.d.ts.map