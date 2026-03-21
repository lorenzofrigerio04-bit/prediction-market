import { ComplianceFlag } from "../enums/compliance-flag.enum.js";
import { MarketVisibility } from "../enums/market-visibility.enum.js";
export const PUBLICATION_METADATA_SCHEMA_ID = "https://market-design-engine.dev/schemas/live-integration/publication-metadata.schema.json";
export const publicationMetadataSchema = {
    $id: PUBLICATION_METADATA_SCHEMA_ID,
    $schema: "https://json-schema.org/draft/2020-12/schema",
    type: "object",
    additionalProperties: false,
    required: [
        "category",
        "tags",
        "jurisdiction",
        "display_priority",
        "market_visibility",
        "compliance_flags",
    ],
    properties: {
        category: { type: "string", minLength: 1 },
        tags: {
            type: "array",
            items: { type: "string", minLength: 1 },
        },
        jurisdiction: { type: "string", pattern: "^[A-Z]{2,3}$" },
        display_priority: { type: "integer", minimum: 0 },
        market_visibility: { type: "string", enum: Object.values(MarketVisibility) },
        compliance_flags: {
            type: "array",
            items: { type: "string", enum: Object.values(ComplianceFlag) },
        },
    },
};
//# sourceMappingURL=publication-metadata.schema.js.map