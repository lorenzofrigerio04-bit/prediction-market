import { describe, expect, it } from "vitest";
import {
  EvidenceSpanKind,
  IdentifierKind,
  LanguageCoverageMode,
  NormalizationStatus,
  ParseStrategy,
  ResolutionEligibility,
  SourceClass,
  SourceReferenceKind,
  SourceUseCase,
  createEntityVersion,
  createEvidenceSpan,
  createFreshnessProfile,
  createJurisdictionCandidate,
  createLanguageCoverage,
  createLanguageCode,
  createObservationConfidenceScore,
  createRawPayloadReference,
  createReliabilityProfile,
  createSourceBaseIdentifier,
  createSourceDefinition,
  createSourceDefinitionId,
  createSourceObservation,
  createSourceObservationId,
  createSourceReference,
  createTimestamp,
  createTraceabilityMetadata,
  validateSourceObservation,
} from "@/index.js";
import { AuthorityLevel } from "@/sources/enums/authority-level.enum.js";
import { ConflictRiskLevel } from "@/sources/enums/conflict-risk-level.enum.js";
import { EnablementStatus } from "@/sources/enums/enablement-status.enum.js";
import { RecencyPriority } from "@/sources/enums/recency-priority.enum.js";

const createValidObservation = () => {
  const sourceDefinitionId = createSourceDefinitionId("sdef_abcdefg");
  createSourceDefinition({
    id: sourceDefinitionId,
    version: createEntityVersion(),
    displayName: "Reuters",
    sourceClass: SourceClass.MEDIA,
    baseIdentifier: createSourceBaseIdentifier(IdentifierKind.DOMAIN, "reuters.com"),
    supportedUseCases: [SourceUseCase.DISCOVERY, SourceUseCase.VALIDATION],
    authorityLevel: AuthorityLevel.HIGH,
    reliabilityProfile: createReliabilityProfile({
      authorityScore: 0.8,
      historicalStabilityScore: 0.8,
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
      languages: ["en"],
    }),
    parseStrategy: ParseStrategy.SEMI_STRUCTURED_FEED,
    enablementStatus: EnablementStatus.ENABLED,
  });

  return createSourceObservation({
    id: createSourceObservationId("obs_abcdefg"),
    version: createEntityVersion(),
    sourceDefinitionId,
    observedAt: createTimestamp("2026-03-01T10:00:00.000Z"),
    ingestedAt: createTimestamp("2026-03-01T10:01:00.000Z"),
    sourceReference: createSourceReference({
      kind: SourceReferenceKind.URL,
      reference: "https://example.com/news/1",
      locator: null,
    }),
    rawPayloadReference: createRawPayloadReference({
      uri: "s3://raw-bucket/reuters/1.json",
      checksum: "sha256:abcd",
    }),
    normalizedHeadlineNullable: "Inflation falls in February",
    normalizedSummaryNullable: "CPI data updated.",
    extractedEntities: ["FED"],
    extractedDates: ["2026-03-01T00:00:00.000Z"],
    extractedNumbers: [2.4],
    extractedClaims: ["CPI decreased by 0.2 points"],
    language: createLanguageCode("en"),
    jurisdictionCandidates: [createJurisdictionCandidate("US", 0.95)],
    evidenceSpans: [
      createEvidenceSpan({
        spanId: "span-1",
        kind: EvidenceSpanKind.RAW_TEXT,
        locator: "/article/body/0",
        startOffset: 0,
        endOffset: 32,
        extractedText: "Inflation falls in February",
        mappedField: "normalizedHeadlineNullable",
      }),
    ],
    sourceConfidence: createObservationConfidenceScore(0.7),
    normalizationStatus: NormalizationStatus.NORMALIZED,
    traceabilityMetadata: createTraceabilityMetadata({
      normalizerVersion: "norm-v1",
      mappingStrategyIds: ["headline-copy-v1"],
      isTraceabilityComplete: true,
      provenanceChain: ["fetch:reuters", "normalize:headline-copy-v1"],
    }),
  });
};

describe("source observation", () => {
  it("valid SourceObservation", () => {
    const observation = createValidObservation();
    const report = validateSourceObservation(observation);
    expect(report.isValid).toBe(true);
  });

  it("invalid SourceObservation without traceability fields", () => {
    const payload = {
      ...createValidObservation(),
      traceabilityMetadata: {
        normalizerVersion: "norm-v1",
        mappingStrategyIds: [],
        isTraceabilityComplete: false,
        provenanceChain: [],
      },
      evidenceSpans: [],
    };
    const report = validateSourceObservation(payload as never);
    expect(report.isValid).toBe(false);
    expect(report.issues.map((issue) => issue.code)).toContain("MISSING_EVIDENCE_SPANS");
  });

  it("evidence span validity and confidence boundaries", () => {
    expect(() =>
      createEvidenceSpan({
        spanId: "span-2",
        kind: EvidenceSpanKind.RAW_TEXT,
        locator: "/article/body/1",
        startOffset: 20,
        endOffset: 10,
        extractedText: null,
        mappedField: null,
      }),
    ).toThrow();

    expect(() => createObservationConfidenceScore(-0.01)).toThrow();
    expect(() => createObservationConfidenceScore(1.01)).toThrow();
  });
});
