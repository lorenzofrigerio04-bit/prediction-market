import { AuthorityLevel } from "../enums/authority-level.enum.js";
import { EnablementStatus } from "../enums/enablement-status.enum.js";
import { IdentifierKind } from "../enums/identifier-kind.enum.js";
import { LanguageCoverageMode } from "../enums/language-coverage-mode.enum.js";
import { ParseStrategy } from "../enums/parse-strategy.enum.js";
import { SourceClass } from "../enums/source-class.enum.js";
import { SourceUseCase } from "../enums/source-use-case.enum.js";

export const SOURCE_DEFINITION_SCHEMA_ID =
  "https://market-design-engine.dev/schemas/sources/source-definition.schema.json";

export const sourceDefinitionSchema = {
  $id: SOURCE_DEFINITION_SCHEMA_ID,
  $schema: "https://json-schema.org/draft/2020-12/schema",
  type: "object",
  additionalProperties: false,
  required: [
    "id",
    "version",
    "displayName",
    "sourceClass",
    "baseIdentifier",
    "supportedUseCases",
    "capability",
    "authorityLevel",
    "reliabilityProfile",
    "freshnessProfile",
    "languageCoverage",
    "parseStrategy",
    "enablementStatus",
  ],
  properties: {
    id: {
      $ref: "https://market-design-engine.dev/schemas/common/primitives.schema.json#/$defs/sourceDefinitionId",
    },
    version: { type: "integer", minimum: 1 },
    displayName: { type: "string", minLength: 1 },
    sourceClass: { type: "string", enum: Object.values(SourceClass) },
    baseIdentifier: {
      type: "object",
      additionalProperties: false,
      required: ["kind", "value"],
      properties: {
        kind: { type: "string", enum: Object.values(IdentifierKind) },
        value: { type: "string", minLength: 1 },
      },
    },
    supportedUseCases: {
      type: "array",
      minItems: 1,
      uniqueItems: true,
      items: { type: "string", enum: Object.values(SourceUseCase) },
    },
    capability: {
      type: "object",
      additionalProperties: false,
      required: [
        "supportsDiscovery",
        "supportsValidation",
        "supportsResolution",
        "supportsAttentionScoring",
      ],
      properties: {
        supportsDiscovery: { type: "boolean" },
        supportsValidation: { type: "boolean" },
        supportsResolution: { type: "boolean" },
        supportsAttentionScoring: { type: "boolean" },
      },
    },
    authorityLevel: { type: "string", enum: Object.values(AuthorityLevel) },
    reliabilityProfile: {
      $ref: "https://market-design-engine.dev/schemas/sources/reliability-profile.schema.json",
    },
    freshnessProfile: {
      $ref: "https://market-design-engine.dev/schemas/sources/freshness-profile.schema.json",
    },
    languageCoverage: {
      type: "object",
      additionalProperties: false,
      required: ["mode", "languages"],
      properties: {
        mode: { type: "string", enum: Object.values(LanguageCoverageMode) },
        languages: {
          type: "array",
          items: {
            $ref: "https://market-design-engine.dev/schemas/common/primitives.schema.json#/$defs/languageCode",
          },
        },
      },
    },
    parseStrategy: { type: "string", enum: Object.values(ParseStrategy) },
    enablementStatus: { type: "string", enum: Object.values(EnablementStatus) },
  },
} as const;
