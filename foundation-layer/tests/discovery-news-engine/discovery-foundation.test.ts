import { describe, expect, it } from "vitest";
import {
  createDiscoverySourceId,
  createDiscoverySourceKey,
  createDiscoverySourceDefinition,
  validateDiscoverySourceDefinition,
  DiscoverySourceKind,
  DiscoverySourceTier,
  DiscoverySourceStatus,
  DiscoveryPollingHint,
  DiscoveryGeoScope,
  DiscoveryTopicScope,
  DiscoveryTrustTier,
  DiscoverySourceAuthMode,
} from "../../src/discovery-news-engine/index.js";
import { createDiscoverySourceEndpoint } from "../../src/discovery-news-engine/entities/discovery-source-endpoint.entity.js";
import { createTimestamp } from "../../src/value-objects/timestamp.vo.js";
import {
  createNormalizedSourceReference,
  createDiscoveryRunId,
  createDiscoverySignalId,
  createDiscoverySignalTimeWindow,
  createDiscoverySignalEvidenceRef,
  createDiscoveryProvenanceMetadata,
  createNormalizedDiscoveryItem,
  createNormalizedDiscoveryPayload,
  createDiscoverySignal,
  validateNormalizedDiscoveryPayload,
  validateDiscoverySignal,
  DiscoverySignalKind,
  DiscoverySignalStatus,
  DiscoverySignalFreshnessClass,
  DiscoverySignalPriorityHint,
  DiscoveryEvidenceRole,
} from "../../src/discovery-news-engine/index.js";
import {
  createDiscoveryErrorReport,
  createDiscoveryValidationFailure,
  validateDiscoveryErrorReport,
  DiscoveryErrorCode,
} from "../../src/discovery-news-engine/index.js";
import {
  createDiscoveryRunDefinition,
  createDiscoveryRunMetrics,
  createDiscoveryRunResult,
  createDiscoveryJobDefinition,
  createDiscoveryJobExecutionRequest,
  createDiscoveryJobExecutionResult,
  createDiscoveryJobId,
  validateDiscoveryRunDefinition,
  validateDiscoveryJobDefinition,
  DiscoveryRunTrigger,
  DiscoveryRunStatus,
} from "../../src/discovery-news-engine/index.js";
import { createDiscoveryScheduleHint } from "../../src/discovery-news-engine/value-objects/discovery-schedule-hint.vo.js";

describe("Discovery News Engine Foundation", () => {
  describe("valid source definition", () => {
    it("builds and validates DiscoverySourceDefinition with all required fields", () => {
      const def = createDiscoverySourceDefinition({
        id: createDiscoverySourceId("dsrc_newsapi001"),
        key: createDiscoverySourceKey("newsapi-it"),
        kind: DiscoverySourceKind.API,
        tier: DiscoverySourceTier.PRIMARY,
        status: DiscoverySourceStatus.ENABLED,
        pollingHint: DiscoveryPollingHint.INTERVAL,
        geoScope: DiscoveryGeoScope.IT,
        topicScope: DiscoveryTopicScope.GENERAL,
        trustTier: DiscoveryTrustTier.CURATED,
        endpoint: createDiscoverySourceEndpoint({
          url: "https://news.example.com/feed",
          method: "GET",
          headersNullable: null,
        }),
        authMode: DiscoverySourceAuthMode.NONE,
        sourceDefinitionIdNullable: null,
        roleNullable: null,
      });
      const report = validateDiscoverySourceDefinition(def);
      expect(report.isValid).toBe(true);
      expect(report.issues).toHaveLength(0);
    });
  });

  describe("invalid source definition", () => {
    it("returns validation issues for missing endpoint url", () => {
      const def = createDiscoverySourceDefinition({
        id: createDiscoverySourceId("dsrc_bad001"),
        key: createDiscoverySourceKey("bad-source"),
        kind: DiscoverySourceKind.RSS,
        tier: DiscoverySourceTier.SECONDARY,
        status: DiscoverySourceStatus.ENABLED,
        pollingHint: DiscoveryPollingHint.ON_DEMAND,
        geoScope: DiscoveryGeoScope.EU,
        topicScope: DiscoveryTopicScope.POLITICS,
        trustTier: DiscoveryTrustTier.UNVERIFIED,
        endpoint: createDiscoverySourceEndpoint({
          url: "https://valid.example.com/feed",
          method: "GET",
          headersNullable: null,
        }),
        authMode: DiscoverySourceAuthMode.NONE,
        sourceDefinitionIdNullable: null,
        roleNullable: null,
      });
      const defWithEmptyUrl = {
        ...def,
        endpoint: { url: "   ", method: "GET", headersNullable: null },
      };
      const report = validateDiscoverySourceDefinition(
        defWithEmptyUrl as typeof def,
      );
      expect(report.isValid).toBe(false);
      expect(report.issues.length).toBeGreaterThan(0);
      expect(report.issues.some((i) => i.path.includes("url"))).toBe(true);
    });

    it("rejects invalid enum values via schema", () => {
      const validDef = createDiscoverySourceDefinition({
        id: createDiscoverySourceId("dsrc_x00001"),
        key: createDiscoverySourceKey("x-key"),
        kind: DiscoverySourceKind.API,
        tier: DiscoverySourceTier.PRIMARY,
        status: DiscoverySourceStatus.ENABLED,
        pollingHint: DiscoveryPollingHint.INTERVAL,
        geoScope: DiscoveryGeoScope.IT,
        topicScope: DiscoveryTopicScope.GENERAL,
        trustTier: DiscoveryTrustTier.VERIFIED,
        endpoint: createDiscoverySourceEndpoint({
          url: "https://x.example.com",
          method: "GET",
          headersNullable: null,
        }),
        authMode: DiscoverySourceAuthMode.NONE,
        sourceDefinitionIdNullable: null,
        roleNullable: null,
      });
      const defWithInvalidKind = { ...validDef, kind: "invalid_kind" };
      const report = validateDiscoverySourceDefinition(
        defWithInvalidKind as typeof validDef,
      );
      expect(report.isValid).toBe(false);
    });
  });

  describe("valid normalized payload", () => {
    it("builds and validates NormalizedDiscoveryPayload with valid items", () => {
      const sourceId = createDiscoverySourceId("dsrc_feed001");
      const sourceKey = createDiscoverySourceKey("feed001");
      const runId = createDiscoveryRunId("drun_run001");
      const item = createNormalizedDiscoveryItem({
        headline: "Test headline",
        bodySnippetNullable: "Snippet",
        canonicalUrl: "https://example.com/article/1",
        externalItemId: "ext-1",
        publishedAt: createTimestamp("2026-03-10T12:00:00.000Z"),
        publishedAtPresent: true,
        sourceReference: createNormalizedSourceReference({
          sourceId,
          locator: "https://example.com/article/1",
          labelNullable: "Example",
          sourceKeyNullable: sourceKey,
        }),
        geoSignalNullable: DiscoveryGeoScope.IT,
        geoPlaceTextNullable: null,
        topicSignalNullable: DiscoveryTopicScope.GENERAL,
        languageCode: "it",
        observedMetricsNullable: null,
      });
      const payload = createNormalizedDiscoveryPayload({
        items: [item],
        provenanceMetadata: createDiscoveryProvenanceMetadata({
          fetchedAt: createTimestamp("2026-03-10T12:05:00.000Z"),
          sourceDefinitionId: sourceId,
          runIdNullable: runId,
          sourceKey,
          sourceRoleNullable: null,
          sourceTier: DiscoverySourceTier.PRIMARY,
          trustTier: DiscoveryTrustTier.CURATED,
          endpointReferenceNullable: null,
          adapterKeyNullable: null,
          fetchMetadataNullable: null,
        }),
        sourceId,
      });
      const report = validateNormalizedDiscoveryPayload(payload);
      expect(report.isValid).toBe(true);
      expect(report.issues).toHaveLength(0);
    });
  });

  describe("invalid normalized payload", () => {
    it("rejects empty items via invariant", () => {
      const sourceId = createDiscoverySourceId("dsrc_feed002");
      const sourceKey = createDiscoverySourceKey("feed002");
      expect(() =>
        createNormalizedDiscoveryPayload({
          items: [],
          provenanceMetadata: createDiscoveryProvenanceMetadata({
            fetchedAt: createTimestamp("2026-03-10T12:00:00.000Z"),
            sourceDefinitionId: sourceId,
            runIdNullable: null,
            sourceKey,
            sourceRoleNullable: null,
            sourceTier: DiscoverySourceTier.PRIMARY,
            trustTier: DiscoveryTrustTier.CURATED,
            endpointReferenceNullable: null,
            adapterKeyNullable: null,
            fetchMetadataNullable: null,
          }),
          sourceId,
        }),
      ).toThrow();
    });

    it("returns validation issues for invalid payload shape", () => {
      const sourceId = createDiscoverySourceId("dsrc_feed003");
      const sourceKey = createDiscoverySourceKey("feed003");
      const payload = createNormalizedDiscoveryPayload({
        items: [
          createNormalizedDiscoveryItem({
            headline: "Valid",
            bodySnippetNullable: null,
            canonicalUrl: "https://a.example/1",
            externalItemId: "e1",
            publishedAt: createTimestamp("2026-03-10T12:00:00.000Z"),
            publishedAtPresent: false,
            sourceReference: createNormalizedSourceReference({
              sourceId,
              locator: "loc",
              labelNullable: null,
              sourceKeyNullable: sourceKey,
            }),
            geoSignalNullable: null,
            geoPlaceTextNullable: null,
            topicSignalNullable: null,
            languageCode: "it",
            observedMetricsNullable: null,
          }),
        ],
        provenanceMetadata: createDiscoveryProvenanceMetadata({
          fetchedAt: createTimestamp("2026-03-10T12:00:00.000Z"),
          sourceDefinitionId: sourceId,
          runIdNullable: null,
          sourceKey,
          sourceRoleNullable: null,
          sourceTier: DiscoverySourceTier.PRIMARY,
          trustTier: DiscoveryTrustTier.CURATED,
          endpointReferenceNullable: null,
          adapterKeyNullable: null,
          fetchMetadataNullable: null,
        }),
        sourceId,
      });
      const invalidPayload = { ...payload, sourceId: "not-a-valid-id" };
      const report = validateNormalizedDiscoveryPayload(
        invalidPayload as typeof payload,
      );
      expect(report.isValid).toBe(false);
    });
  });

  describe("valid discovery signal build input/output shape", () => {
    it("builds DiscoverySignal with expected shape from normalized item", () => {
      const sourceId = createDiscoverySourceId("dsrc_sig001");
      const sourceKey = createDiscoverySourceKey("sig001");
      const item = createNormalizedDiscoveryItem({
        headline: "Signal headline",
        bodySnippetNullable: null,
        canonicalUrl: "https://example.com/sig/1",
        externalItemId: "item-sig-1",
        publishedAt: createTimestamp("2026-03-10T10:00:00.000Z"),
        publishedAtPresent: true,
        sourceReference: createNormalizedSourceReference({
          sourceId,
          locator: "loc",
          labelNullable: null,
          sourceKeyNullable: sourceKey,
        }),
        geoSignalNullable: null,
        geoPlaceTextNullable: null,
        topicSignalNullable: null,
        languageCode: "it",
        observedMetricsNullable: null,
      });
      const signal = createDiscoverySignal({
        id: createDiscoverySignalId("dsig_signal001"),
        kind: DiscoverySignalKind.HEADLINE,
        payloadRef: { normalizedItemId: item.externalItemId },
        timeWindow: createDiscoverySignalTimeWindow({
          start: createTimestamp("2026-03-10T09:00:00.000Z"),
          end: createTimestamp("2026-03-10T23:59:59.000Z"),
        }),
        freshnessClass: DiscoverySignalFreshnessClass.RECENT,
        priorityHint: DiscoverySignalPriorityHint.NORMAL,
        status: DiscoverySignalStatus.PENDING,
        evidenceRefs: [
          createDiscoverySignalEvidenceRef({
            itemId: item.externalItemId,
            role: DiscoveryEvidenceRole.PRIMARY,
          }),
        ],
        provenanceMetadata: createDiscoveryProvenanceMetadata({
          fetchedAt: createTimestamp("2026-03-10T10:05:00.000Z"),
          sourceDefinitionId: sourceId,
          runIdNullable: null,
          sourceKey,
          sourceRoleNullable: null,
          sourceTier: DiscoverySourceTier.PRIMARY,
          trustTier: DiscoveryTrustTier.CURATED,
          endpointReferenceNullable: null,
          adapterKeyNullable: null,
          fetchMetadataNullable: null,
        }),
        createdAt: createTimestamp("2026-03-10T10:06:00.000Z"),
      });
      expect(signal.id).toBe("dsig_signal001");
      expect(signal.kind).toBe(DiscoverySignalKind.HEADLINE);
      expect(signal.payloadRef.normalizedItemId).toBe("item-sig-1");
      expect(signal.status).toBe(DiscoverySignalStatus.PENDING);
      expect(signal.evidenceRefs).toHaveLength(1);
      const report = validateDiscoverySignal(signal);
      expect(report.isValid).toBe(true);
    });
  });

  describe("explicit error/report model behavior", () => {
    it("builds DiscoveryValidationFailure and DiscoveryErrorReport with deterministic codes", () => {
      const runId = createDiscoveryRunId("drun_err001");
      const failure = createDiscoveryValidationFailure({
        code: "VALIDATION_FAILED",
        path: "/items/0/headline",
        message: "Headline must be non-empty",
        contextNullable: { value: "" },
      });
      const report = createDiscoveryErrorReport({
        runId,
        code: DiscoveryErrorCode.VALIDATION_FAILED,
        message: "Normalization produced invalid payload",
        failures: [failure],
        timestamp: createTimestamp("2026-03-10T12:00:00.000Z"),
      });
      expect(report.code).toBe(DiscoveryErrorCode.VALIDATION_FAILED);
      expect(report.failures).toHaveLength(1);
      expect(report.failures[0]!.code).toBe("VALIDATION_FAILED");
      const validationReport = validateDiscoveryErrorReport(report);
      expect(validationReport.isValid).toBe(true);
    });
  });

  describe("run definition / execution contract", () => {
    it("creates DiscoveryRunDefinition and DiscoveryJobExecutionRequest/Result with correct shape", () => {
      const runId = createDiscoveryRunId("drun_exec001");
      const sourceId = createDiscoverySourceId("dsrc_exec001");
      const runDef = createDiscoveryRunDefinition({
        runId,
        sourceIds: [sourceId],
        trigger: DiscoveryRunTrigger.MANUAL,
        scheduleHintNullable: createDiscoveryScheduleHint({
          cronExpressionNullable: null,
          intervalSecondsNullable: 300,
        }),
        executionWindowNullable: null,
      });
      const runValidation = validateDiscoveryRunDefinition(runDef);
      expect(runValidation.isValid).toBe(true);

      const jobId = createDiscoveryJobId("djob_exec001");
      const jobDef = createDiscoveryJobDefinition({
        jobId,
        runDefinition: runDef,
        scheduleHint: createDiscoveryScheduleHint({
          cronExpressionNullable: null,
          intervalSecondsNullable: 300,
        }),
        maxDurationSecondsNullable: 60,
      });
      const jobValidation = validateDiscoveryJobDefinition(jobDef);
      expect(jobValidation.isValid).toBe(true);

      const requestedAt = createTimestamp("2026-03-10T12:00:00.000Z");
      const execRequest = createDiscoveryJobExecutionRequest({
        jobDefinition: jobDef,
        requestedAt,
      });
      expect(execRequest.jobDefinition.runDefinition.runId).toBe(runId);

      const runResult = createDiscoveryRunResult({
        runId,
        status: DiscoveryRunStatus.COMPLETED,
        startedAt: requestedAt,
        finishedAtNullable: createTimestamp("2026-03-10T12:01:00.000Z"),
        metrics: createDiscoveryRunMetrics({
          itemsFetched: 10,
          itemsNormalized: 10,
          signalsEmitted: 8,
          duplicatesSkipped: 2,
          errorsCount: 0,
        }),
        errorReportNullable: null,
      });
      const executedAt = createTimestamp("2026-03-10T12:01:00.000Z");
      const execResult = createDiscoveryJobExecutionResult({
        jobId,
        runResult,
        executedAt,
        status: DiscoveryRunStatus.COMPLETED,
      });
      expect(execResult.jobId).toBe(jobId);
      expect(execResult.status).toBe(DiscoveryRunStatus.COMPLETED);
      expect(execResult.runResult.metrics.itemsFetched).toBe(10);
    });
  });
});
