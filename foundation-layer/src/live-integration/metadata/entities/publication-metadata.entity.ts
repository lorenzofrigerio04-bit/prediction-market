import { ValidationError } from "../../../common/errors/validation-error.js";
import { deepFreeze } from "../../../common/utils/deep-freeze.js";
import { ComplianceFlag } from "../../enums/compliance-flag.enum.js";
import { MarketVisibility } from "../../enums/market-visibility.enum.js";
import {
  createJurisdictionCode,
  type JurisdictionCode,
} from "../../value-objects/jurisdiction-code.vo.js";
import { createPublicationTag, type PublicationTag } from "../../value-objects/publication-tag.vo.js";

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

export const createPublicationMetadata = (input: PublicationMetadataInput): PublicationMetadata => {
  const category = input.category.trim();
  if (category.length === 0) {
    throw new ValidationError("INVALID_PUBLICATION_METADATA", "category is required");
  }
  if (!Number.isInteger(input.display_priority) || input.display_priority < 0) {
    throw new ValidationError(
      "INVALID_PUBLICATION_METADATA",
      "display_priority must be a non-negative integer",
    );
  }
  if (!Object.values(MarketVisibility).includes(input.market_visibility)) {
    throw new ValidationError("INVALID_PUBLICATION_METADATA", "market_visibility is invalid");
  }
  const tags = input.tags.map(createPublicationTag);
  const jurisdiction = createJurisdictionCode(input.jurisdiction);
  const complianceFlags = [...input.compliance_flags];
  for (const flag of complianceFlags) {
    if (!Object.values(ComplianceFlag).includes(flag)) {
      throw new ValidationError("INVALID_PUBLICATION_METADATA", "compliance_flags contains invalid values");
    }
  }
  return deepFreeze({
    category,
    tags: deepFreeze([...tags]),
    jurisdiction,
    display_priority: input.display_priority,
    market_visibility: input.market_visibility,
    compliance_flags: deepFreeze(complianceFlags),
  });
};
