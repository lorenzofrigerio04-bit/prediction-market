import { describe, expect, it } from "vitest";
import {
  discoveryStoryClusterEvaluator,
  createNormalizedDiscoveryItem,
  createNormalizedSourceReference,
  createDiscoverySourceId,
  createDiscoverySourceKey,
  createDiscoveryStoryClusterId,
  createDiscoveryStoryCluster,
  buildDiscoveryStoryClusterSummary,
  DiscoveryStoryClusterStatus,
  DiscoveryStoryMembershipReason,
  DiscoveryDedupeEvidenceStrength,
  DiscoveryTopicScope,
  DiscoveryGeoScope,
} from "../../src/discovery-news-engine/index.js";
import { createTimestamp } from "../../src/value-objects/timestamp.vo.js";

const sourceId = createDiscoverySourceId("dsrc_ded001");
const sourceKeyAnsa = createDiscoverySourceKey("ansa-rss");
const sourceKeyIngv = createDiscoverySourceKey("ingv");
const sourceKeyGazzetta = createDiscoverySourceKey("gazzetta-ufficiale");

function item(
  overrides: Partial<{
    headline: string;
    canonicalUrl: string;
    externalItemId: string;
    publishedAt: ReturnType<typeof createTimestamp>;
    sourceKey: ReturnType<typeof createDiscoverySourceKey>;
    locator: string;
    topicSignalNullable: DiscoveryTopicScope | null;
    geoSignalNullable: DiscoveryGeoScope | null;
  }> = {},
) {
  return createNormalizedDiscoveryItem({
    headline: overrides.headline ?? "Test headline",
    bodySnippetNullable: null,
    canonicalUrl: overrides.canonicalUrl ?? "https://example.com/article/1",
    externalItemId: overrides.externalItemId ?? "ext-1",
    publishedAt: overrides.publishedAt ?? createTimestamp("2026-03-10T10:00:00.000Z"),
    publishedAtPresent: true,
    sourceReference: createNormalizedSourceReference({
      sourceId,
      locator: overrides.locator ?? overrides.canonicalUrl ?? "https://example.com/article/1",
      labelNullable: null,
      sourceKeyNullable: overrides.sourceKey ?? sourceKeyAnsa,
    }),
    geoSignalNullable: overrides.geoSignalNullable ?? null,
    geoPlaceTextNullable: null,
    topicSignalNullable: overrides.topicSignalNullable ?? null,
    languageCode: "it",
    observedMetricsNullable: null,
  });
}

describe("discoveryStoryClusterEvaluator", () => {
  describe("assignToClusters", () => {
    it("creates new cluster when no strong match exists", () => {
      const a = item({
        canonicalUrl: "https://example.com/a",
        externalItemId: "a1",
        headline: "Article A",
      });
      const b = item({
        canonicalUrl: "https://example.com/b",
        externalItemId: "b1",
        headline: "Article B",
      });
      const { clusters, decisions } = discoveryStoryClusterEvaluator.assignToClusters(
        { items: [a, b] },
        {},
      );
      expect(clusters.length).toBe(2);
      expect(decisions.length).toBe(2);
      expect(decisions[0]!.createdNewCluster).toBe(true);
      expect(decisions[0]!.reason).toBe(DiscoveryStoryMembershipReason.NEW_CLUSTER_NO_MATCH);
      expect(decisions[0]!.clusterId).toBe(clusters[0]!.clusterId);
      expect(decisions[1]!.createdNewCluster).toBe(true);
      expect(decisions[1]!.reason).toBe(DiscoveryStoryMembershipReason.NEW_CLUSTER_NO_MATCH);
      expect(clusters[0]!.memberItemIds).toEqual(["a1"]);
      expect(clusters[1]!.memberItemIds).toEqual(["b1"]);
    });

    it("joins cluster by canonical URL / locator continuity", () => {
      const a = item({
        canonicalUrl: "https://ansa.it/news/123",
        externalItemId: "ansa-1",
      });
      const b = item({
        canonicalUrl: "https://ansa.it/news/123",
        externalItemId: "ansa-2",
      });
      const { clusters, decisions } = discoveryStoryClusterEvaluator.assignToClusters(
        { items: [a, b] },
        {},
      );
      expect(clusters.length).toBe(1);
      expect(clusters[0]!.memberItemIds).toContain("ansa-1");
      expect(clusters[0]!.memberItemIds).toContain("ansa-2");
      expect(decisions[0]!.createdNewCluster).toBe(true);
      expect(decisions[1]!.joinedExisting).toBe(true);
      expect(decisions[1]!.reason).toBe(DiscoveryStoryMembershipReason.CANONICAL_URL_CONTINUITY);
      expect(decisions[1]!.matchedMemberIdNullable).toBe("ansa-1");
      expect(decisions[1]!.evidenceStrength).toBe(DiscoveryDedupeEvidenceStrength.STRONG);
    });

    it("joins cluster by structured-source continuity (same sourceKey + locator)", () => {
      const a = item({
        sourceKey: sourceKeyIngv,
        locator: "https://terremoti.ingv.it/event/456",
        canonicalUrl: "https://terremoti.ingv.it/event/456",
        externalItemId: "ingv-evt-1",
      });
      const b = item({
        sourceKey: sourceKeyIngv,
        locator: "https://terremoti.ingv.it/event/456",
        canonicalUrl: "https://other.example/event/456",
        externalItemId: "ingv-evt-2",
      });
      const { clusters, decisions } = discoveryStoryClusterEvaluator.assignToClusters(
        { items: [a, b] },
        {},
      );
      expect(clusters.length).toBe(1);
      expect(clusters[0]!.memberItemIds).toContain("ingv-evt-1");
      expect(clusters[0]!.memberItemIds).toContain("ingv-evt-2");
      expect(decisions[1]!.reason).toBe(DiscoveryStoryMembershipReason.STRUCTURED_SOURCE_LOCATOR);
      expect(decisions[1]!.evidenceStrength).toBe(DiscoveryDedupeEvidenceStrength.STRONG);
    });

    it("joins cluster by title + narrow temporal proximity (same day)", () => {
      const day = createTimestamp("2026-03-10T09:00:00.000Z");
      const sameDay = createTimestamp("2026-03-10T15:00:00.000Z");
      const a = item({
        headline: "Earthquake strikes central Italy",
        publishedAt: day,
        externalItemId: "id-a",
        canonicalUrl: "https://example.com/a",
      });
      const b = item({
        headline: "earthquake strikes central italy",
        publishedAt: sameDay,
        externalItemId: "id-b",
        canonicalUrl: "https://example.com/b",
      });
      const { clusters, decisions } = discoveryStoryClusterEvaluator.assignToClusters(
        { items: [a, b] },
        {},
      );
      expect(clusters.length).toBe(1);
      expect(decisions[1]!.reason).toBe(
        DiscoveryStoryMembershipReason.TITLE_AND_TEMPORAL_PROXIMITY,
      );
      expect(decisions[1]!.evidenceStrength).toBe(DiscoveryDedupeEvidenceStrength.MEDIUM);
    });

    it("does not join when title is similar but time is different day", () => {
      const a = item({
        headline: "Same headline here",
        publishedAt: createTimestamp("2026-03-10T10:00:00.000Z"),
        externalItemId: "id-a",
        canonicalUrl: "https://example.com/a",
      });
      const b = item({
        headline: "same headline here",
        publishedAt: createTimestamp("2026-03-11T10:00:00.000Z"),
        externalItemId: "id-b",
        canonicalUrl: "https://example.com/b",
      });
      const { clusters, decisions } = discoveryStoryClusterEvaluator.assignToClusters(
        { items: [a, b] },
        {},
      );
      expect(clusters.length).toBe(2);
      expect(decisions[1]!.createdNewCluster).toBe(true);
      expect(decisions[1]!.reason).toBe(DiscoveryStoryMembershipReason.NEW_CLUSTER_NO_MATCH);
    });

    it("conservative: only geo/topic match does not join (new cluster)", () => {
      const a = item({
        headline: "News A",
        canonicalUrl: "https://example.com/a",
        externalItemId: "a1",
        topicSignalNullable: DiscoveryTopicScope.EDITORIAL_NEWS,
        geoSignalNullable: DiscoveryGeoScope.IT,
      });
      const b = item({
        headline: "News B",
        canonicalUrl: "https://example.com/b",
        externalItemId: "b1",
        topicSignalNullable: DiscoveryTopicScope.EDITORIAL_NEWS,
        geoSignalNullable: DiscoveryGeoScope.IT,
      });
      const { clusters, decisions } = discoveryStoryClusterEvaluator.assignToClusters(
        { items: [a, b] },
        {},
      );
      expect(clusters.length).toBe(2);
      expect(decisions[1]!.createdNewCluster).toBe(true);
    });

    it("explainability: each decision has reason, matchedMemberIdNullable, evidenceStrength, createdNewCluster", () => {
      const a = item({ externalItemId: "ref", canonicalUrl: "https://x.com/1" });
      const b = item({ externalItemId: "b", canonicalUrl: "https://x.com/1" });
      const { decisions } = discoveryStoryClusterEvaluator.assignToClusters(
        { items: [a, b] },
        {},
      );
      expect(decisions[0]!.reason).toBeDefined();
      expect(decisions[0]!.evidenceStrength).toBeDefined();
      expect(decisions[0]!.createdNewCluster).toBe(true);
      expect(decisions[1]!.reason).toBe(DiscoveryStoryMembershipReason.CANONICAL_URL_CONTINUITY);
      expect(decisions[1]!.matchedMemberIdNullable).toBe("ref");
      expect(decisions[1]!.evidenceStrength).toBe(DiscoveryDedupeEvidenceStrength.STRONG);
      expect(decisions[1]!.createdNewCluster).toBe(false);
      expect(decisions[1]!.joinedExisting).toBe(true);
    });

    it("uses existing clusters when provided in context", () => {
      const existingCluster = createDiscoveryStoryCluster({
        clusterId: createDiscoveryStoryClusterId("dsc_test01"),
        memberItemIds: ["existing-1"],
        memberSignalIds: [],
        status: DiscoveryStoryClusterStatus.OPEN,
        createdAt: createTimestamp("2026-03-10T08:00:00.000Z"),
      });
      const existingItem = item({
        externalItemId: "existing-1",
        canonicalUrl: "https://existing.com/1",
      });
      const newItem = item({
        externalItemId: "new-1",
        canonicalUrl: "https://existing.com/1",
      });
      const { clusters, decisions } = discoveryStoryClusterEvaluator.assignToClusters(
        { items: [newItem] },
        {
          existingClusters: [existingCluster],
          getItemForNormalizedId: (id) => (id === "existing-1" ? existingItem : null),
        },
      );
      expect(clusters.length).toBe(1);
      expect(clusters[0]!.clusterId).toBe(existingCluster.clusterId);
      expect(clusters[0]!.memberItemIds).toContain("existing-1");
      expect(clusters[0]!.memberItemIds).toContain("new-1");
      expect(decisions[0]!.joinedExisting).toBe(true);
      expect(decisions[0]!.reason).toBe(DiscoveryStoryMembershipReason.CANONICAL_URL_CONTINUITY);
    });
  });
});

describe("buildDiscoveryStoryClusterSummary", () => {
  it("computes member count, source diversity, time span, representative headline", () => {
    const a = item({
      headline: "First headline",
      externalItemId: "i1",
      canonicalUrl: "https://a.com/1",
      sourceKey: sourceKeyAnsa,
      publishedAt: createTimestamp("2026-03-10T08:00:00.000Z"),
    });
    const b = item({
      headline: "Second headline",
      externalItemId: "i2",
      canonicalUrl: "https://b.com/2",
      sourceKey: sourceKeyGazzetta,
      publishedAt: createTimestamp("2026-03-10T12:00:00.000Z"),
    });
    const { clusters } = discoveryStoryClusterEvaluator.assignToClusters(
      { items: [a, b] },
      {},
    );
    const firstCluster = clusters[0]!;
    const itemsById = new Map<string, ReturnType<typeof item>>([
      ["i1", a],
      ["i2", b],
    ]);
    const summary = buildDiscoveryStoryClusterSummary(firstCluster, itemsById);
    expect(summary.clusterId).toBe(firstCluster.clusterId);
    expect(summary.memberIds.itemIds).toEqual(firstCluster.memberItemIds);
    expect(summary.representativeHeadlineOrItemId).toBe("First headline");
    expect(summary.sourceDiversityCount).toBe(1);

    const twoItemCluster = createDiscoveryStoryCluster({
      clusterId: createDiscoveryStoryClusterId("dsc_summary01"),
      memberItemIds: ["i1", "i2"],
      memberSignalIds: [],
      status: DiscoveryStoryClusterStatus.OPEN,
      createdAt: createTimestamp("2026-03-10T08:00:00.000Z"),
    });
    const summary2 = buildDiscoveryStoryClusterSummary(twoItemCluster, itemsById);
    expect(summary2.sourceDiversityCount).toBe(2);
    expect(summary2.timeSpanNullable).not.toBeNull();
    expect(summary2.timeSpanNullable).not.toBeNull();
    expect(summary2.timeSpanNullable!.earliest).toBe("2026-03-10T08:00:00.000Z");
    expect(summary2.timeSpanNullable!.latest).toBe("2026-03-10T12:00:00.000Z");
  });
});
