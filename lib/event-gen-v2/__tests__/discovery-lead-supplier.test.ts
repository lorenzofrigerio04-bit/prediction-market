/**
 * Tests for discovery lead supplier: orchestration, report contract, failure handling,
 * source filtering, and compatibility with runDiscoveryBackedPipelineFromLeads.
 * Fixtures and mocks only; no live network calls.
 */

import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  runDiscoveryLeadSupplier,
  buildDiscoveryEventLeads,
  type DiscoveryLeadSupplierReport,
} from "../discovery-lead-supplier";
import { runDiscoveryBackedPipelineFromLeads } from "@/lib/mde-pipeline/run-discovery-backed-pipeline";
import * as foundation from "@market-design-engine/foundation-layer";

vi.mock("@market-design-engine/foundation-layer", async (importOriginal) => {
  const actual =
    await importOriginal<typeof import("@market-design-engine/foundation-layer")>();
  const mockRunConnector = vi.fn();
  const now = new Date().toISOString();
  const sourceId = actual.createDiscoverySourceId("dsrc_ansa_rss");
  const sourceKey = actual.createDiscoverySourceKey("ansa-rss");
  const sourceRef = actual.createNormalizedSourceReference({
    sourceId,
    locator: "https://example.com/1",
    labelNullable: null,
    sourceKeyNullable: sourceKey,
  });
  const item = actual.createNormalizedDiscoveryItem({
    headline: "Test headline",
    bodySnippetNullable: null,
    canonicalUrl: "https://example.com/1",
    externalItemId: "ext1",
    publishedAt: actual.createTimestamp(now),
    publishedAtPresent: true,
    sourceReference: sourceRef,
    geoSignalNullable: actual.DiscoveryGeoScope.IT,
    geoPlaceTextNullable: null,
    topicSignalNullable: actual.DiscoveryTopicScope.GENERAL,
    languageCode: "it",
    observedMetricsNullable: null,
  });
  const prov = actual.createDiscoveryProvenanceMetadata({
    fetchedAt: actual.createTimestamp(now),
    sourceDefinitionId: sourceId,
    runIdNullable: null,
    sourceKey,
    sourceRoleNullable: actual.DiscoverySourceUsageRole.AUTHORITATIVE,
    sourceTier: actual.DiscoverySourceTier.PRIMARY,
    trustTier: actual.DiscoveryTrustTier.VERIFIED,
    endpointReferenceNullable: null,
    adapterKeyNullable: null,
    fetchMetadataNullable: null,
  });
  const payload = actual.createNormalizedDiscoveryPayload({
    items: [item],
    provenanceMetadata: prov,
    sourceId,
  });
  const successResult = {
    outcome: "success" as const,
    normalizedPayload: payload,
    itemCount: 1,
  };
  (mockRunConnector as { _defaultResult?: typeof successResult })._defaultResult =
    successResult;
  mockRunConnector.mockResolvedValue(successResult);
  return {
    ...actual,
    runConnectorWithNormalize: mockRunConnector,
  };
});

function getMockRunConnector() {
  return foundation.runConnectorWithNormalize as ReturnType<typeof vi.fn> & {
    _defaultResult?: { outcome: "success"; normalizedPayload: unknown; itemCount: number };
  };
}

function getDefaultSuccessResult() {
  return getMockRunConnector()._defaultResult!;
}

describe("runDiscoveryLeadSupplier", () => {
  beforeEach(() => {
    const mock = getMockRunConnector();
    mock.mockClear();
    mock.mockResolvedValue(getDefaultSuccessResult());
  });

  it("returns structured result with leads and report", async () => {
    const result = await runDiscoveryLeadSupplier({
      sourceKeys: ["ansa-rss"],
    });
    expect(result).toHaveProperty("leads");
    expect(result).toHaveProperty("report");
    expect(Array.isArray(result.leads)).toBe(true);
    expectReportShape(result.report);
  });

  it("report has sources attempted, succeeded, failed, and sourceFailures", async () => {
    const { report } = await runDiscoveryLeadSupplier({
      sourceKeys: ["ansa-rss"],
    });
    expect(report.sourcesAttempted).toBe(1);
    expect(report.sourcesSucceeded).toBeGreaterThanOrEqual(0);
    expect(report.sourcesFailed).toBeGreaterThanOrEqual(0);
    expect(Array.isArray(report.sourceFailures)).toBe(true);
  });

  it("partial source failure: one fails, report records failure and continues", async () => {
    const mock = getMockRunConnector();
    mock.mockResolvedValueOnce(getDefaultSuccessResult());
    mock.mockResolvedValueOnce({
      outcome: "fetch_failure",
      failure: { message: "network error", code: "FETCH_FAILED", detailsNullable: null },
    });

    const { report } = await runDiscoveryLeadSupplier({
      sourceKeys: ["ansa-rss", "agi-rss"],
    });
    expect(report.sourcesAttempted).toBe(2);
    expect(report.sourcesFailed).toBeGreaterThanOrEqual(1);
    expect(report.sourceFailures.length).toBeGreaterThanOrEqual(1);
    expect(report.sourceFailures[0]).toHaveProperty("sourceKey");
    expect(report.sourceFailures[0]).toHaveProperty("reason");
  });

  it("no enabled sources / filter yields zero attempted", async () => {
    const { leads, report } = await runDiscoveryLeadSupplier({
      sourceKeys: ["nonexistent-key-no-adapter"],
    });
    expect(report.sourcesAttempted).toBe(0);
    expect(leads.length).toBe(0);
  });

  it("supplier output is accepted by runDiscoveryBackedPipelineFromLeads", async () => {
    const { leads } = await runDiscoveryLeadSupplier({
      sourceKeys: ["ansa-rss"],
    });
    const params = {
      eventDeadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      marketCloseTime: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000 - 60 * 60 * 1000),
    };
    const { results } = runDiscoveryBackedPipelineFromLeads(leads, params);
    expect(Array.isArray(results)).toBe(true);
    expect(results.length).toBe(leads.length);
  });

  it("source filtering by sourceKeys: only requested source is attempted", async () => {
    const { report } = await runDiscoveryLeadSupplier({
      sourceKeys: ["ansa-rss"],
    });
    expect(report.sourcesAttempted).toBe(1);
  });

  it("when leads are returned, each has EventLead shape (id, readiness, evidenceSet)", async () => {
    const { leads } = await runDiscoveryLeadSupplier({
      sourceKeys: ["ansa-rss"],
    });
    for (const lead of leads) {
      expect(lead).toHaveProperty("id");
      expect(lead).toHaveProperty("readiness");
      expect(lead).toHaveProperty("evidenceSet");
      expect(lead.evidenceSet).toHaveProperty("memberItemIds");
      expect(lead.evidenceSet).toHaveProperty("clusterId");
    }
  });

  it("dedupe within-run: 10 distinct items from one source yield accepted=10, duplicateWithinRun=0", async () => {
    const now = new Date().toISOString();
    const sourceId = foundation.createDiscoverySourceId("dsrc_ansa_rss");
    const sourceKey = foundation.createDiscoverySourceKey("ansa-rss");
    const tenItems = Array.from({ length: 10 }, (_, i) =>
      foundation.createNormalizedDiscoveryItem({
        headline: `Headline ${i}`,
        bodySnippetNullable: null,
        canonicalUrl: `https://example.com/article-${i}`,
        externalItemId: `ext-${i}`,
        publishedAt: foundation.createTimestamp(now),
        publishedAtPresent: true,
        sourceReference: foundation.createNormalizedSourceReference({
          sourceId,
          locator: `https://example.com/${i}`,
          labelNullable: null,
          sourceKeyNullable: sourceKey,
        }),
        geoSignalNullable: foundation.DiscoveryGeoScope.IT,
        geoPlaceTextNullable: null,
        topicSignalNullable: foundation.DiscoveryTopicScope.GENERAL,
        languageCode: "it",
        observedMetricsNullable: null,
      })
    );
    const prov = foundation.createDiscoveryProvenanceMetadata({
      fetchedAt: foundation.createTimestamp(now),
      sourceDefinitionId: sourceId,
      runIdNullable: null,
      sourceKey,
      sourceRoleNullable: foundation.DiscoverySourceUsageRole.AUTHORITATIVE,
      sourceTier: foundation.DiscoverySourceTier.PRIMARY,
      trustTier: foundation.DiscoveryTrustTier.VERIFIED,
      endpointReferenceNullable: null,
      adapterKeyNullable: null,
      fetchMetadataNullable: null,
    });
    const payload = foundation.createNormalizedDiscoveryPayload({
      items: tenItems,
      provenanceMetadata: prov,
      sourceId,
    });
    getMockRunConnector().mockResolvedValueOnce({
      outcome: "success",
      normalizedPayload: payload,
      itemCount: tenItems.length,
    });
    const { report } = await runDiscoveryLeadSupplier({
      sourceKeys: ["ansa-rss"],
    });
    expect(report.dedupeStats.input).toBe(10);
    expect(report.dedupeStats.accepted).toBe(10);
    expect(report.dedupeStats.duplicateWithinRun).toBe(0);
    expect(report.dedupeStats.duplicateOfExisting).toBe(0);
  });

  it("dedupe within-run: two items with same canonicalUrl yield accepted=1, duplicateWithinRun=1", async () => {
    const now = new Date().toISOString();
    const sourceId = foundation.createDiscoverySourceId("dsrc_ansa_rss");
    const sourceKey = foundation.createDiscoverySourceKey("ansa-rss");
    const sameUrl = "https://example.com/same-article";
    const sourceRef = foundation.createNormalizedSourceReference({
      sourceId,
      locator: sameUrl,
      labelNullable: null,
      sourceKeyNullable: sourceKey,
    });
    const item1 = foundation.createNormalizedDiscoveryItem({
      headline: "First",
      bodySnippetNullable: null,
      canonicalUrl: sameUrl,
      externalItemId: "ext-1",
      publishedAt: foundation.createTimestamp(now),
      publishedAtPresent: true,
      sourceReference: sourceRef,
      geoSignalNullable: foundation.DiscoveryGeoScope.IT,
      geoPlaceTextNullable: null,
      topicSignalNullable: foundation.DiscoveryTopicScope.GENERAL,
      languageCode: "it",
      observedMetricsNullable: null,
    });
    const item2 = foundation.createNormalizedDiscoveryItem({
      headline: "Second",
      bodySnippetNullable: null,
      canonicalUrl: sameUrl,
      externalItemId: "ext-2",
      publishedAt: foundation.createTimestamp(now),
      publishedAtPresent: true,
      sourceReference: sourceRef,
      geoSignalNullable: foundation.DiscoveryGeoScope.IT,
      geoPlaceTextNullable: null,
      topicSignalNullable: foundation.DiscoveryTopicScope.GENERAL,
      languageCode: "it",
      observedMetricsNullable: null,
    });
    const prov = foundation.createDiscoveryProvenanceMetadata({
      fetchedAt: foundation.createTimestamp(now),
      sourceDefinitionId: sourceId,
      runIdNullable: null,
      sourceKey,
      sourceRoleNullable: foundation.DiscoverySourceUsageRole.AUTHORITATIVE,
      sourceTier: foundation.DiscoverySourceTier.PRIMARY,
      trustTier: foundation.DiscoveryTrustTier.VERIFIED,
      endpointReferenceNullable: null,
      adapterKeyNullable: null,
      fetchMetadataNullable: null,
    });
    const payload = foundation.createNormalizedDiscoveryPayload({
      items: [item1, item2],
      provenanceMetadata: prov,
      sourceId,
    });
    getMockRunConnector().mockResolvedValueOnce({
      outcome: "success",
      normalizedPayload: payload,
      itemCount: 2,
    });
    const { report } = await runDiscoveryLeadSupplier({
      sourceKeys: ["ansa-rss"],
    });
    expect(report.dedupeStats.input).toBe(2);
    expect(report.dedupeStats.accepted).toBe(1);
    expect(report.dedupeStats.duplicateWithinRun).toBe(1);
    expect(report.dedupeStats.duplicateOfExisting).toBe(0);
  });
});

describe("buildDiscoveryEventLeads", () => {
  beforeEach(() => {
    const mock = getMockRunConnector();
    mock.mockClear();
    mock.mockResolvedValue(getDefaultSuccessResult());
  });

  it("returns EventLead[] from runDiscoveryLeadSupplier", async () => {
    const leads = await buildDiscoveryEventLeads({ sourceKeys: ["ansa-rss"] });
    expect(Array.isArray(leads)).toBe(true);
  });
});

function expectReportShape(report: DiscoveryLeadSupplierReport) {
  expect(typeof report.sourcesAttempted).toBe("number");
  expect(typeof report.sourcesSucceeded).toBe("number");
  expect(typeof report.sourcesFailed).toBe("number");
  expect(typeof report.normalizedItemsCount).toBe("number");
  expect(typeof report.signalsCount).toBe("number");
  expect(report.dedupeStats).toBeDefined();
  expect(typeof report.dedupeStats.input).toBe("number");
  expect(typeof report.dedupeStats.accepted).toBe("number");
  expect(typeof report.clusterCount).toBe("number");
  expect(typeof report.trendSnapshotCount).toBe("number");
  expect(typeof report.rankedClusterCount).toBe("number");
  expect(typeof report.eventLeadCount).toBe("number");
  expect(typeof report.nonLeadOrSkippedCount).toBe("number");
  expect(Array.isArray(report.errorsSummary)).toBe(true);
}
