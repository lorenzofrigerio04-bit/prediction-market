/**
 * Ingestion bridge: RawArticle / ProcessedArticle / SourceArticle-like records
 * → SourceObservation (foundation-layer).
 * Enables the MDE pipeline to consume app ingestion output.
 */

import type { SourceObservation } from "@market-design-engine/foundation-layer";
import {
  createEntityVersion,
  createEvidenceSpan,
  createJurisdictionCandidate,
  createLanguageCode,
  createObservationConfidenceScore,
  createObservationNormalizationResult,
  createRawPayloadReference,
  createSourceObservation,
  createSourceObservationId,
  createSourceDefinitionId,
  createSourceReference,
  createTimestamp,
  createTraceabilityMetadata,
  EvidenceSpanKind,
  NormalizationStatus,
  SourceReferenceKind,
} from "@market-design-engine/foundation-layer";
import type { ProcessedArticle } from "@/lib/ingestion/types";

const BRIDGE_VERSION = "mde-ingestion-bridge-v1";
const MAPPING_STRATEGY = "article-to-observation";

/** Generate a stable observation id from article identity (safe for foundation pattern obs_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}) */
function stableObservationId(canonicalUrl: string, publishedAt?: Date | null): string {
  const seed = canonicalUrl + (publishedAt ? publishedAt.toISOString() : "");
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    const c = seed.charCodeAt(i);
    hash = (hash << 5) - hash + c;
    hash = hash & 0x7fffffff;
  }
  const hex = Math.abs(hash).toString(36).replace(/[^a-z0-9]/g, "a");
  const suffix = hex.slice(0, 12).padEnd(6, "0");
  return `obs_${suffix}`;
}

/** Map app source type to foundation SourceDefinitionId placeholder */
function sourceDefinitionIdForType(sourceType: string): ReturnType<typeof createSourceDefinitionId> {
  const safe = sourceType.replace(/[^a-zA-Z0-9]/g, "_").slice(0, 20);
  return createSourceDefinitionId(`ingest_${safe}`);
}

export interface ArticleToObservationInput {
  /** ProcessedArticle from ingestion pipeline */
  article: ProcessedArticle;
  /** Override observation id; otherwise derived from article */
  observationId?: string;
  /** Override source definition id; otherwise derived from sourceType */
  sourceDefinitionId?: ReturnType<typeof createSourceDefinitionId>;
  /** Language (BCP-47); default "en" */
  language?: string;
  /** Observed-at time; default article.publishedAt or now */
  observedAt?: Date;
  /** Ingested-at time; default now */
  ingestedAt?: Date;
}

/**
 * Convert a ProcessedArticle (or equivalent) into a foundation-layer SourceObservation.
 * Use this from a cron/script after ingestion to feed the MDE pipeline.
 */
export function articleToSourceObservation(input: ArticleToObservationInput): SourceObservation {
  const {
    article,
    observationId,
    sourceDefinitionId,
    language = "en",
    observedAt,
    ingestedAt,
  } = input;

  const observedAtDate = observedAt ?? article.publishedAt ?? new Date();
  const ingestedAtDate = ingestedAt ?? new Date();
  const id = observationId
    ? createSourceObservationId(observationId)
    : createSourceObservationId(stableObservationId(article.canonicalUrl, article.publishedAt));
  const sourceDefId = sourceDefinitionId ?? sourceDefinitionIdForType(article.sourceType);

  const headline = article.title?.trim() ?? "";
  const summary = (article.content ?? "").trim().slice(0, 2000) || null;

  return createSourceObservation({
    id,
    version: createEntityVersion(),
    sourceDefinitionId: sourceDefId,
    observedAt: createTimestamp(observedAtDate),
    ingestedAt: createTimestamp(ingestedAtDate),
    sourceReference: createSourceReference({
      kind: SourceReferenceKind.URL,
      reference: article.canonicalUrl,
      locator: null,
    }),
    rawPayloadReference: createRawPayloadReference({
      uri: `ingestion://article/${article.canonicalUrl}`,
      checksum: null,
    }),
    normalizedHeadlineNullable: headline || null,
    normalizedSummaryNullable: summary,
    extractedEntities: [],
    extractedDates: [],
    extractedNumbers: [],
    extractedClaims: [],
    language: createLanguageCode(language),
    jurisdictionCandidates: [createJurisdictionCandidate("XX", 0.5)],
    evidenceSpans: [
      createEvidenceSpan({
        spanId: `span-${id}-headline`,
        kind: EvidenceSpanKind.RAW_TEXT,
        locator: "/title",
        startOffset: 0,
        endOffset: headline.length,
        extractedText: headline,
        mappedField: "normalizedHeadlineNullable",
      }),
    ],
    sourceConfidence: createObservationConfidenceScore(0.6),
    normalizationStatus: NormalizationStatus.NORMALIZED,
    traceabilityMetadata: createTraceabilityMetadata({
      normalizerVersion: BRIDGE_VERSION,
      mappingStrategyIds: [MAPPING_STRATEGY],
      isTraceabilityComplete: true,
      provenanceChain: ["ingestion", "article-to-observation"],
    }),
  });
}

/**
 * Wrap a SourceObservation in ObservationNormalizationResult for compatibility
 * with SourceAdapter.normalize() consumers.
 */
export function toObservationNormalizationResult(observation: SourceObservation) {
  return createObservationNormalizationResult({
    observation,
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
}
