import { AuthorityLevel } from "../enums/authority-level.enum.js";
import { EnablementStatus } from "../enums/enablement-status.enum.js";
import { IdentifierKind } from "../enums/identifier-kind.enum.js";
import { LanguageCoverageMode } from "../enums/language-coverage-mode.enum.js";
import { ParseStrategy } from "../enums/parse-strategy.enum.js";
import { SourceClass } from "../enums/source-class.enum.js";
import { SourceUseCase } from "../enums/source-use-case.enum.js";
export declare const SOURCE_DEFINITION_SCHEMA_ID = "https://market-design-engine.dev/schemas/sources/source-definition.schema.json";
export declare const sourceDefinitionSchema: {
    readonly $id: "https://market-design-engine.dev/schemas/sources/source-definition.schema.json";
    readonly $schema: "https://json-schema.org/draft/2020-12/schema";
    readonly type: "object";
    readonly additionalProperties: false;
    readonly required: readonly ["id", "version", "displayName", "sourceClass", "baseIdentifier", "supportedUseCases", "capability", "authorityLevel", "reliabilityProfile", "freshnessProfile", "languageCoverage", "parseStrategy", "enablementStatus"];
    readonly properties: {
        readonly id: {
            readonly $ref: "https://market-design-engine.dev/schemas/common/primitives.schema.json#/$defs/sourceDefinitionId";
        };
        readonly version: {
            readonly type: "integer";
            readonly minimum: 1;
        };
        readonly displayName: {
            readonly type: "string";
            readonly minLength: 1;
        };
        readonly sourceClass: {
            readonly type: "string";
            readonly enum: SourceClass[];
        };
        readonly baseIdentifier: {
            readonly type: "object";
            readonly additionalProperties: false;
            readonly required: readonly ["kind", "value"];
            readonly properties: {
                readonly kind: {
                    readonly type: "string";
                    readonly enum: IdentifierKind[];
                };
                readonly value: {
                    readonly type: "string";
                    readonly minLength: 1;
                };
            };
        };
        readonly supportedUseCases: {
            readonly type: "array";
            readonly minItems: 1;
            readonly uniqueItems: true;
            readonly items: {
                readonly type: "string";
                readonly enum: SourceUseCase[];
            };
        };
        readonly capability: {
            readonly type: "object";
            readonly additionalProperties: false;
            readonly required: readonly ["supportsDiscovery", "supportsValidation", "supportsResolution", "supportsAttentionScoring"];
            readonly properties: {
                readonly supportsDiscovery: {
                    readonly type: "boolean";
                };
                readonly supportsValidation: {
                    readonly type: "boolean";
                };
                readonly supportsResolution: {
                    readonly type: "boolean";
                };
                readonly supportsAttentionScoring: {
                    readonly type: "boolean";
                };
            };
        };
        readonly authorityLevel: {
            readonly type: "string";
            readonly enum: AuthorityLevel[];
        };
        readonly reliabilityProfile: {
            readonly $ref: "https://market-design-engine.dev/schemas/sources/reliability-profile.schema.json";
        };
        readonly freshnessProfile: {
            readonly $ref: "https://market-design-engine.dev/schemas/sources/freshness-profile.schema.json";
        };
        readonly languageCoverage: {
            readonly type: "object";
            readonly additionalProperties: false;
            readonly required: readonly ["mode", "languages"];
            readonly properties: {
                readonly mode: {
                    readonly type: "string";
                    readonly enum: LanguageCoverageMode[];
                };
                readonly languages: {
                    readonly type: "array";
                    readonly items: {
                        readonly $ref: "https://market-design-engine.dev/schemas/common/primitives.schema.json#/$defs/languageCode";
                    };
                };
            };
        };
        readonly parseStrategy: {
            readonly type: "string";
            readonly enum: ParseStrategy[];
        };
        readonly enablementStatus: {
            readonly type: "string";
            readonly enum: EnablementStatus[];
        };
    };
};
//# sourceMappingURL=source-definition.schema.d.ts.map