import { describe, expect, it } from "vitest";
import { AuthorityLevel, EnablementStatus, IdentifierKind, LanguageCoverageMode, NormalizationStatus, ParseStrategy, ResolutionEligibility, SourceClass, SourceReferenceKind, SourceUseCase, ValidatorSeverity, createEntityVersion, createEvidenceSpan, createFreshnessProfile, createJurisdictionCandidate, createLanguageCode, createLanguageCoverage, createObservationConfidenceScore, createObservationNormalizationResult, createRawPayloadReference, createReliabilityProfile, createSourceBaseIdentifier, createSourceDefinition, createSourceDefinitionId, createSourceObservation, createSourceObservationId, createSourceReference, createTimestamp, createTraceabilityMetadata, validateObservationNormalizationResult, } from "@/index.js";
import { ConflictRiskLevel } from "@/sources/enums/conflict-risk-level.enum.js";
import { RecencyPriority } from "@/sources/enums/recency-priority.enum.js";
import { EvidenceSpanKind } from "@/observations/enums/evidence-span-kind.enum.js";
const createSourceDefinitionForAdapter = (parseStrategy) => createSourceDefinition({
    id: createSourceDefinitionId("sdef_adapter1"),
    version: createEntityVersion(),
    displayName: "Adapter Source",
    sourceClass: SourceClass.MEDIA,
    baseIdentifier: createSourceBaseIdentifier(IdentifierKind.DOMAIN, "adapter.example"),
    supportedUseCases: [SourceUseCase.DISCOVERY, SourceUseCase.VALIDATION],
    authorityLevel: AuthorityLevel.MEDIUM,
    reliabilityProfile: createReliabilityProfile({
        authorityScore: 0.7,
        historicalStabilityScore: 0.8,
        resolutionEligibility: ResolutionEligibility.INELIGIBLE,
        conflictRiskLevel: ConflictRiskLevel.LOW,
    }),
    freshnessProfile: createFreshnessProfile({
        expectedUpdateFrequency: "daily",
        freshnessTtl: 86400,
        recencyPriority: RecencyPriority.MEDIUM,
    }),
    languageCoverage: createLanguageCoverage({
        mode: LanguageCoverageMode.EXPLICIT_LIST,
        languages: ["en"],
    }),
    parseStrategy,
    enablementStatus: EnablementStatus.ENABLED,
});
const buildObservationFromPayload = (sourceDefinitionId, payload) => createSourceObservation({
    id: createSourceObservationId("obs_adapter1"),
    version: createEntityVersion(),
    sourceDefinitionId,
    observedAt: createTimestamp(payload.observedAt),
    ingestedAt: createTimestamp(payload.observedAt),
    sourceReference: createSourceReference({
        kind: SourceReferenceKind.URL,
        reference: payload.reference,
        locator: null,
    }),
    rawPayloadReference: createRawPayloadReference({
        uri: "memory://payload/adapter-1",
        checksum: null,
    }),
    normalizedHeadlineNullable: payload.headline,
    normalizedSummaryNullable: payload.body,
    extractedEntities: [],
    extractedDates: [],
    extractedNumbers: [],
    extractedClaims: [],
    language: createLanguageCode("en"),
    jurisdictionCandidates: [createJurisdictionCandidate("US", 0.8)],
    evidenceSpans: [
        createEvidenceSpan({
            spanId: "span-adapter-1",
            kind: EvidenceSpanKind.RAW_TEXT,
            locator: "/body",
            startOffset: 0,
            endOffset: 12,
            extractedText: payload.headline,
            mappedField: "normalizedHeadlineNullable",
        }),
    ],
    sourceConfidence: createObservationConfidenceScore(0.5),
    normalizationStatus: NormalizationStatus.NORMALIZED,
    traceabilityMetadata: createTraceabilityMetadata({
        normalizerVersion: "adapter-norm-v1",
        mappingStrategyIds: ["copy-headline"],
        isTraceabilityComplete: true,
        provenanceChain: ["adapter:fake"],
    }),
});
const fakeAdapter = {
    canHandle(sourceDefinition) {
        return sourceDefinition.parseStrategy === ParseStrategy.SEMI_STRUCTURED_FEED;
    },
    async fetchRaw(_request) {
        return {
            payload: {
                headline: "Headline",
                body: "Body",
                observedAt: "2026-03-01T00:00:00.000Z",
                reference: "https://example.com/a",
            },
            fetchedAt: createTimestamp("2026-03-01T00:01:00.000Z"),
            nextCursorNullable: null,
        };
    },
    validatePayload(payload) {
        if (payload.headline.trim().length === 0) {
            return {
                isValid: false,
                issues: [
                    {
                        code: "INVALID_HEADLINE",
                        path: "/headline",
                        message: "headline must be non-empty",
                        severity: ValidatorSeverity.ERROR,
                    },
                ],
            };
        }
        return { isValid: true, issues: [] };
    },
    normalize(payload, sourceDefinition) {
        return createObservationNormalizationResult({
            observation: buildObservationFromPayload(sourceDefinition.id, payload),
            validationIssues: [],
            normalizationIssues: [],
            deterministicWarnings: [],
            traceabilityCompleteness: {
                hasSourceReference: true,
                hasRawPayloadReference: true,
                hasEvidenceSpans: true,
                hasTraceabilityMetadata: true,
                isComplete: true,
            },
        });
    },
};
describe("source adapter contract", () => {
    it("canHandle behavior on SourceAdapter", () => {
        expect(fakeAdapter.canHandle(createSourceDefinitionForAdapter(ParseStrategy.SEMI_STRUCTURED_FEED))).toBe(true);
        expect(fakeAdapter.canHandle(createSourceDefinitionForAdapter(ParseStrategy.STRUCTURED_API))).toBe(false);
    });
    it("SourceAdapter contract behavior", async () => {
        const sourceDefinition = createSourceDefinitionForAdapter(ParseStrategy.SEMI_STRUCTURED_FEED);
        const fetchResult = await fakeAdapter.fetchRaw({
            sourceDefinition,
            requestedAt: createTimestamp("2026-03-01T00:00:00.000Z"),
            cursorNullable: null,
        });
        const validation = fakeAdapter.validatePayload(fetchResult.payload);
        expect(validation.isValid).toBe(true);
        const normalization = fakeAdapter.normalize(fetchResult.payload, sourceDefinition, {
            requestedAt: createTimestamp("2026-03-01T00:00:00.000Z"),
            normalizerVersion: "adapter-norm-v1",
            sourceRunId: null,
        });
        expect(normalization.traceabilityCompleteness.isComplete).toBe(true);
    });
    it("normalization result validation", () => {
        const sourceDefinition = createSourceDefinitionForAdapter(ParseStrategy.SEMI_STRUCTURED_FEED);
        const result = createObservationNormalizationResult({
            observation: buildObservationFromPayload(sourceDefinition.id, {
                headline: "Headline",
                body: "Body",
                observedAt: "2026-03-01T00:00:00.000Z",
                reference: "https://example.com/a",
            }),
            validationIssues: [],
            normalizationIssues: [],
            deterministicWarnings: [],
            traceabilityCompleteness: {
                hasSourceReference: true,
                hasRawPayloadReference: true,
                hasEvidenceSpans: true,
                hasTraceabilityMetadata: true,
                isComplete: true,
            },
        });
        expect(validateObservationNormalizationResult(result).isValid).toBe(true);
        const invalidResult = {
            ...result,
            traceabilityCompleteness: {
                hasSourceReference: true,
                hasRawPayloadReference: true,
                hasEvidenceSpans: false,
                hasTraceabilityMetadata: true,
                isComplete: true,
            },
        };
        const report = validateObservationNormalizationResult(invalidResult);
        expect(report.isValid).toBe(false);
        expect(report.issues.map((issue) => issue.code)).toContain("TRACEABILITY_COMPLETENESS_MISMATCH");
    });
});
//# sourceMappingURL=source-adapter.spec.js.map