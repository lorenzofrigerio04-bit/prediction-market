import { describe, expect, it } from "vitest";
import { ajv } from "@/validators/ajv/ajv-instance.js";
import { AuthorityLevel, EnablementStatus, IdentifierKind, LanguageCoverageMode, ParseStrategy, ResolutionEligibility, SourceClass, SourceUseCase, createEntityVersion, createFreshnessProfile, createLanguageCoverage, createReliabilityProfile, createSourceBaseIdentifier, createSourceDefinition, createSourceDefinitionId, validateSourceDefinition, SOURCE_DEFINITION_SCHEMA_ID, } from "@/index.js";
import { ConflictRiskLevel } from "@/sources/enums/conflict-risk-level.enum.js";
import { RecencyPriority } from "@/sources/enums/recency-priority.enum.js";
const createValidDefinition = () => createSourceDefinition({
    id: createSourceDefinitionId("sdef_abcdefg"),
    version: createEntityVersion(),
    displayName: "Reuters",
    sourceClass: SourceClass.MEDIA,
    baseIdentifier: createSourceBaseIdentifier(IdentifierKind.DOMAIN, "reuters.com"),
    supportedUseCases: [SourceUseCase.DISCOVERY, SourceUseCase.VALIDATION],
    authorityLevel: AuthorityLevel.HIGH,
    reliabilityProfile: createReliabilityProfile({
        authorityScore: 0.95,
        historicalStabilityScore: 0.7,
        resolutionEligibility: ResolutionEligibility.INELIGIBLE,
        conflictRiskLevel: ConflictRiskLevel.MEDIUM,
    }),
    freshnessProfile: createFreshnessProfile({
        expectedUpdateFrequency: "hourly",
        freshnessTtl: 3600,
        recencyPriority: RecencyPriority.HIGH,
    }),
    languageCoverage: createLanguageCoverage({
        mode: LanguageCoverageMode.EXPLICIT_LIST,
        languages: ["en", "it"],
    }),
    parseStrategy: ParseStrategy.SEMI_STRUCTURED_FEED,
    enablementStatus: EnablementStatus.ENABLED,
});
describe("source definition", () => {
    it("valid SourceDefinition", () => {
        const definition = createValidDefinition();
        const report = validateSourceDefinition(definition);
        expect(report.isValid).toBe(true);
        expect(definition.capability.supportsDiscovery).toBe(true);
        expect(definition.capability.supportsResolution).toBe(false);
    });
    it("invalid SourceDefinition with missing use cases", () => {
        const payload = {
            ...createValidDefinition(),
            supportedUseCases: [],
            capability: {
                supportsDiscovery: false,
                supportsValidation: false,
                supportsResolution: false,
                supportsAttentionScoring: false,
            },
        };
        const report = validateSourceDefinition(payload);
        expect(report.isValid).toBe(false);
        expect(report.issues.map((issue) => issue.code)).toContain("MISSING_SUPPORTED_USE_CASES");
    });
    it("invalid SourceDefinition with invalid authority values", () => {
        const payload = {
            ...createValidDefinition(),
            authorityLevel: "SUPER_HIGH",
        };
        const report = validateSourceDefinition(payload);
        expect(report.isValid).toBe(false);
        expect(report.issues.map((issue) => issue.code)).toContain("INVALID_ENUM");
    });
    it("schema and validator reject empty use-case arrays", () => {
        const validator = ajv.getSchema(SOURCE_DEFINITION_SCHEMA_ID);
        const payload = {
            ...createValidDefinition(),
            supportedUseCases: [],
        };
        expect(validator(payload)).toBe(false);
    });
    it("rejects capability/use-case mismatch for discovery, validation and attention", () => {
        const payload = {
            ...createValidDefinition(),
            supportedUseCases: [SourceUseCase.DISCOVERY, SourceUseCase.VALIDATION, SourceUseCase.ATTENTION],
            capability: {
                supportsDiscovery: false,
                supportsValidation: false,
                supportsResolution: false,
                supportsAttentionScoring: false,
            },
        };
        const report = validateSourceDefinition(payload);
        expect(report.isValid).toBe(false);
        expect(report.issues.map((issue) => issue.path)).toContain("/capability/supportsDiscovery");
        expect(report.issues.map((issue) => issue.path)).toContain("/capability/supportsValidation");
        expect(report.issues.map((issue) => issue.path)).toContain("/capability/supportsAttentionScoring");
    });
});
//# sourceMappingURL=source-definition.spec.js.map