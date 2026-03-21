import { describe, expect, it } from "vitest";
import { discoveryTrendEvaluator, createDiscoveryStoryClusterId, createDiscoveryStoryCluster, createDiscoveryStoryClusterSummary, buildDiscoveryStoryClusterSummary, createNormalizedDiscoveryItem, createNormalizedSourceReference, createDiscoverySourceId, createDiscoverySourceKey, createDiscoverySignal, createDiscoverySignalId, createDiscoverySignalTimeWindow, createDiscoveryProvenanceMetadata, createDiscoverySignalEvidenceRef, DiscoveryStoryClusterStatus, DiscoveryTrendHorizon, DiscoveryTrendStatus, DiscoverySignalKind, DiscoverySignalStatus, DiscoverySignalFreshnessClass, DiscoverySignalPriorityHint, DiscoveryEvidenceRole, DiscoverySourceTier, DiscoveryTrustTier, DiscoverySourceUsageRole, } from "../../src/discovery-news-engine/index.js";
import { createTimestamp } from "../../src/value-objects/timestamp.vo.js";
const sourceId = createDiscoverySourceId("dsrc_ded001");
const sourceKeyAnsa = createDiscoverySourceKey("ansa-rss");
const sourceKeyIngv = createDiscoverySourceKey("ingv-terremoti");
const sourceKeyGazzetta = createDiscoverySourceKey("gazzetta-ufficiale");
function item(overrides = {}) {
    return createNormalizedDiscoveryItem({
        headline: "Test headline",
        bodySnippetNullable: null,
        canonicalUrl: overrides.canonicalUrl ?? "https://example.com/article/1",
        externalItemId: overrides.externalItemId ?? "ext-1",
        publishedAt: createTimestamp(overrides.publishedAt ?? "2026-03-10T10:00:00.000Z"),
        publishedAtPresent: true,
        sourceReference: createNormalizedSourceReference({
            sourceId,
            locator: overrides.canonicalUrl ?? "https://example.com/article/1",
            labelNullable: null,
            sourceKeyNullable: overrides.sourceKey ?? sourceKeyAnsa,
        }),
        geoSignalNullable: null,
        geoPlaceTextNullable: null,
        topicSignalNullable: null,
        languageCode: "it",
        observedMetricsNullable: null,
    });
}
function signal(opts) {
    return createDiscoverySignal({
        id: createDiscoverySignalId(opts.id),
        kind: DiscoverySignalKind.HEADLINE,
        payloadRef: { normalizedItemId: opts.itemId },
        timeWindow: createDiscoverySignalTimeWindow({
            start: createTimestamp(opts.start),
            end: createTimestamp(opts.end),
        }),
        freshnessClass: opts.freshnessClass ?? DiscoverySignalFreshnessClass.RECENT,
        priorityHint: DiscoverySignalPriorityHint.NORMAL,
        status: DiscoverySignalStatus.PENDING,
        evidenceRefs: [
            createDiscoverySignalEvidenceRef({ itemId: opts.itemId, role: DiscoveryEvidenceRole.PRIMARY }),
        ],
        provenanceMetadata: createDiscoveryProvenanceMetadata({
            fetchedAt: createTimestamp(opts.start),
            sourceDefinitionId: sourceId,
            runIdNullable: null,
            sourceKey: opts.sourceKey,
            sourceRoleNullable: opts.sourceRole,
            sourceTier: DiscoverySourceTier.PRIMARY,
            trustTier: DiscoveryTrustTier.CURATED,
            endpointReferenceNullable: null,
            adapterKeyNullable: null,
            fetchMetadataNullable: null,
        }),
        createdAt: createTimestamp(opts.start),
    });
}
describe("discoveryTrendEvaluator", () => {
    it("fast pulse: TRENDING when recent burst, narrow span, editorial/attention present", () => {
        const now = new Date("2026-03-11T12:00:00.000Z");
        const item1 = item({
            externalItemId: "i1",
            publishedAt: "2026-03-11T02:00:00.000Z",
            sourceKey: sourceKeyAnsa,
        });
        const item2 = item({
            externalItemId: "i2",
            publishedAt: "2026-03-11T04:00:00.000Z",
            sourceKey: sourceKeyAnsa,
        });
        const itemsById = new Map([["i1", item1], ["i2", item2]]);
        const cluster = createDiscoveryStoryCluster({
            clusterId: createDiscoveryStoryClusterId("dsc_fastpulse1"),
            memberItemIds: ["i1", "i2"],
            memberSignalIds: [],
            status: DiscoveryStoryClusterStatus.OPEN,
            createdAt: createTimestamp("2026-03-11T02:00:00.000Z"),
        });
        const summary = buildDiscoveryStoryClusterSummary(cluster, itemsById);
        const result = discoveryTrendEvaluator.evaluateCluster({
            cluster,
            summary,
            itemsById,
            signalsById: new Map(),
            now,
            horizonsNullable: [DiscoveryTrendHorizon.FAST_PULSE],
            getSourceRoleNullable: (key) => key === "ansa-rss" ? DiscoverySourceUsageRole.EDITORIAL : null,
        });
        const fastPulse = result.snapshots.find((s) => s.horizon === DiscoveryTrendHorizon.FAST_PULSE);
        expect(fastPulse).toBeDefined();
        expect(fastPulse.trendStatus).toBe(DiscoveryTrendStatus.TRENDING);
        expect(fastPulse.explanation).toContain("fast_pulse");
        expect(fastPulse.indicatorSet.signalCountInHorizon).toBe(2);
        expect(fastPulse.indicatorSet.hasEditorialSource).toBe(true);
    });
    it("short cycle: TRENDING when growth over window, source diversity, activity density", () => {
        const now = new Date("2026-03-15T12:00:00.000Z");
        const items = [
            item({ externalItemId: "a", publishedAt: "2026-03-12T08:00:00.000Z", sourceKey: sourceKeyAnsa }),
            item({ externalItemId: "b", publishedAt: "2026-03-13T10:00:00.000Z", sourceKey: sourceKeyAnsa }),
            item({ externalItemId: "c", publishedAt: "2026-03-14T14:00:00.000Z", sourceKey: sourceKeyIngv }),
            item({ externalItemId: "d", publishedAt: "2026-03-14T18:00:00.000Z", sourceKey: sourceKeyAnsa }),
        ];
        const itemsById = new Map(items.map((i) => [i.externalItemId, i]));
        const cluster = createDiscoveryStoryCluster({
            clusterId: createDiscoveryStoryClusterId("dsc_short1"),
            memberItemIds: ["a", "b", "c", "d"],
            memberSignalIds: [],
            status: DiscoveryStoryClusterStatus.OPEN,
            createdAt: createTimestamp("2026-03-12T08:00:00.000Z"),
        });
        const summary = buildDiscoveryStoryClusterSummary(cluster, itemsById);
        const result = discoveryTrendEvaluator.evaluateCluster({
            cluster,
            summary,
            itemsById,
            signalsById: new Map(),
            now,
            horizonsNullable: [DiscoveryTrendHorizon.SHORT_CYCLE],
            getSourceRoleNullable: () => DiscoverySourceUsageRole.EDITORIAL,
        });
        const shortCycle = result.snapshots.find((s) => s.horizon === DiscoveryTrendHorizon.SHORT_CYCLE);
        expect(shortCycle).toBeDefined();
        expect(shortCycle.trendStatus).toBe(DiscoveryTrendStatus.TRENDING);
        expect(shortCycle.explanation).toContain("short_cycle");
        expect(shortCycle.indicatorSet.sourceDiversityCount).toBeGreaterThanOrEqual(1);
    });
    it("medium cycle: TRENDING when persistence over wider interval, min signals and span", () => {
        const now = new Date("2026-03-25T12:00:00.000Z");
        const items = [
            item({ externalItemId: "m1", publishedAt: "2026-03-10T00:00:00.000Z", sourceKey: sourceKeyAnsa }),
            item({ externalItemId: "m2", publishedAt: "2026-03-18T00:00:00.000Z", sourceKey: sourceKeyAnsa }),
            item({ externalItemId: "m3", publishedAt: "2026-03-22T00:00:00.000Z", sourceKey: sourceKeyAnsa }),
        ];
        const itemsById = new Map(items.map((i) => [i.externalItemId, i]));
        const cluster = createDiscoveryStoryCluster({
            clusterId: createDiscoveryStoryClusterId("dsc_medium1"),
            memberItemIds: ["m1", "m2", "m3"],
            memberSignalIds: [],
            status: DiscoveryStoryClusterStatus.OPEN,
            createdAt: createTimestamp("2026-03-10T00:00:00.000Z"),
        });
        const summary = buildDiscoveryStoryClusterSummary(cluster, itemsById);
        const result = discoveryTrendEvaluator.evaluateCluster({
            cluster,
            summary,
            itemsById,
            signalsById: new Map(),
            now,
            horizonsNullable: [DiscoveryTrendHorizon.MEDIUM_CYCLE],
        });
        const mediumCycle = result.snapshots.find((s) => s.horizon === DiscoveryTrendHorizon.MEDIUM_CYCLE);
        expect(mediumCycle).toBeDefined();
        expect(mediumCycle.trendStatus).toBe(DiscoveryTrendStatus.TRENDING);
        expect(mediumCycle.explanation).toContain("medium_cycle");
        expect(mediumCycle.indicatorSet.timeSpanHours).toBeGreaterThanOrEqual(24 * 2);
    });
    it("medium cycle: NOT_TRENDING or INSUFFICIENT when time span too narrow", () => {
        const now = new Date("2026-03-25T12:00:00.000Z");
        const item1 = item({
            externalItemId: "n1",
            publishedAt: "2026-03-24T10:00:00.000Z",
            sourceKey: sourceKeyAnsa,
        });
        const item2 = item({
            externalItemId: "n2",
            publishedAt: "2026-03-24T14:00:00.000Z",
            sourceKey: sourceKeyAnsa,
        });
        const itemsById = new Map([["n1", item1], ["n2", item2]]);
        const cluster = createDiscoveryStoryCluster({
            clusterId: createDiscoveryStoryClusterId("dsc_medium2"),
            memberItemIds: ["n1", "n2"],
            memberSignalIds: [],
            status: DiscoveryStoryClusterStatus.OPEN,
            createdAt: createTimestamp("2026-03-24T10:00:00.000Z"),
        });
        const summary = buildDiscoveryStoryClusterSummary(cluster, itemsById);
        const result = discoveryTrendEvaluator.evaluateCluster({
            cluster,
            summary,
            itemsById,
            signalsById: new Map(),
            now,
            horizonsNullable: [DiscoveryTrendHorizon.MEDIUM_CYCLE],
        });
        const mediumCycle = result.snapshots.find((s) => s.horizon === DiscoveryTrendHorizon.MEDIUM_CYCLE);
        expect(mediumCycle).toBeDefined();
        expect([DiscoveryTrendStatus.NOT_TRENDING, DiscoveryTrendStatus.INSUFFICIENT_EVIDENCE]).toContain(mediumCycle.trendStatus);
        expect(mediumCycle.explanation).toBeDefined();
        expect(mediumCycle.explanation.length).toBeGreaterThan(0);
    });
    it("scheduled monitor: TRENDING when authoritative source present and min signals", () => {
        const now = new Date("2026-03-15T12:00:00.000Z");
        const sig = signal({
            id: "dsig_sched1",
            itemId: "item1",
            start: "2026-03-15T10:00:00.000Z",
            end: "2026-03-15T11:00:00.000Z",
            sourceKey: sourceKeyGazzetta,
            sourceRole: DiscoverySourceUsageRole.AUTHORITATIVE,
        });
        const signalsById = new Map([[sig.id, sig]]);
        const cluster = createDiscoveryStoryCluster({
            clusterId: createDiscoveryStoryClusterId("dsc_sched1"),
            memberItemIds: [],
            memberSignalIds: [sig.id],
            status: DiscoveryStoryClusterStatus.OPEN,
            createdAt: createTimestamp("2026-03-15T10:00:00.000Z"),
        });
        const summary = createDiscoveryStoryClusterSummary({
            clusterId: cluster.clusterId,
            memberIds: { itemIds: [], signalIds: [sig.id] },
            representativeHeadlineOrItemId: "Official update",
            sourceDiversityCount: 1,
            timeSpanNullable: {
                earliest: createTimestamp("2026-03-15T10:00:00.000Z"),
                latest: createTimestamp("2026-03-15T10:00:00.000Z"),
            },
            topicGeoSummaryNullable: null,
        });
        const result = discoveryTrendEvaluator.evaluateCluster({
            cluster,
            summary,
            itemsById: new Map(),
            signalsById,
            now,
            horizonsNullable: [DiscoveryTrendHorizon.SCHEDULED_MONITOR],
        });
        const sched = result.snapshots.find((s) => s.horizon === DiscoveryTrendHorizon.SCHEDULED_MONITOR);
        expect(sched).toBeDefined();
        expect(sched.trendStatus).toBe(DiscoveryTrendStatus.TRENDING);
        expect(sched.explanation).toContain("scheduled_monitor");
        expect(sched.indicatorSet.hasAuthoritativeSource).toBe(true);
    });
    it("scheduled monitor: NOT_TRENDING when no authoritative source", () => {
        const now = new Date("2026-03-15T12:00:00.000Z");
        const sig = signal({
            id: "dsig_sched2",
            itemId: "item2",
            start: "2026-03-15T10:00:00.000Z",
            end: "2026-03-15T11:00:00.000Z",
            sourceKey: sourceKeyAnsa,
            sourceRole: DiscoverySourceUsageRole.EDITORIAL,
        });
        const signalsById = new Map([[sig.id, sig]]);
        const cluster = createDiscoveryStoryCluster({
            clusterId: createDiscoveryStoryClusterId("dsc_sched2"),
            memberItemIds: [],
            memberSignalIds: [sig.id],
            status: DiscoveryStoryClusterStatus.OPEN,
            createdAt: createTimestamp("2026-03-15T10:00:00.000Z"),
        });
        const summary = createDiscoveryStoryClusterSummary({
            clusterId: cluster.clusterId,
            memberIds: { itemIds: [], signalIds: [sig.id] },
            representativeHeadlineOrItemId: "Editorial",
            sourceDiversityCount: 1,
            timeSpanNullable: null,
            topicGeoSummaryNullable: null,
        });
        const result = discoveryTrendEvaluator.evaluateCluster({
            cluster,
            summary,
            itemsById: new Map(),
            signalsById,
            now,
            horizonsNullable: [DiscoveryTrendHorizon.SCHEDULED_MONITOR],
        });
        const sched = result.snapshots.find((s) => s.horizon === DiscoveryTrendHorizon.SCHEDULED_MONITOR);
        expect(sched).toBeDefined();
        expect(sched.trendStatus).toBe(DiscoveryTrendStatus.NOT_TRENDING);
        expect(sched.explanation).toContain("no authoritative");
    });
    it("non-trending: INSUFFICIENT_EVIDENCE when too few signals", () => {
        const now = new Date("2026-03-11T12:00:00.000Z");
        const single = item({
            externalItemId: "alone",
            publishedAt: "2026-03-11T10:00:00.000Z",
            sourceKey: sourceKeyAnsa,
        });
        const itemsById = new Map([["alone", single]]);
        const cluster = createDiscoveryStoryCluster({
            clusterId: createDiscoveryStoryClusterId("dsc_single"),
            memberItemIds: ["alone"],
            memberSignalIds: [],
            status: DiscoveryStoryClusterStatus.OPEN,
            createdAt: createTimestamp("2026-03-11T10:00:00.000Z"),
        });
        const summary = buildDiscoveryStoryClusterSummary(cluster, itemsById);
        const result = discoveryTrendEvaluator.evaluateCluster({
            cluster,
            summary,
            itemsById,
            signalsById: new Map(),
            now,
            horizonsNullable: [DiscoveryTrendHorizon.FAST_PULSE, DiscoveryTrendHorizon.SHORT_CYCLE],
            getSourceRoleNullable: () => DiscoverySourceUsageRole.EDITORIAL,
        });
        const fastPulse = result.snapshots.find((s) => s.horizon === DiscoveryTrendHorizon.FAST_PULSE);
        expect(fastPulse).toBeDefined();
        expect(fastPulse.trendStatus).toBe(DiscoveryTrendStatus.INSUFFICIENT_EVIDENCE);
        expect(fastPulse.explanation).toContain("insufficient");
    });
    it("explainability: every snapshot has explanation and indicatorSet", () => {
        const now = new Date("2026-03-11T12:00:00.000Z");
        const item1 = item({
            externalItemId: "e1",
            publishedAt: "2026-03-11T02:00:00.000Z",
            sourceKey: sourceKeyAnsa,
        });
        const item2 = item({
            externalItemId: "e2",
            publishedAt: "2026-03-11T04:00:00.000Z",
            sourceKey: sourceKeyAnsa,
        });
        const itemsById = new Map([["e1", item1], ["e2", item2]]);
        const cluster = createDiscoveryStoryCluster({
            clusterId: createDiscoveryStoryClusterId("dsc_explain"),
            memberItemIds: ["e1", "e2"],
            memberSignalIds: [],
            status: DiscoveryStoryClusterStatus.OPEN,
            createdAt: createTimestamp("2026-03-11T02:00:00.000Z"),
        });
        const summary = buildDiscoveryStoryClusterSummary(cluster, itemsById);
        const result = discoveryTrendEvaluator.evaluateCluster({
            cluster,
            summary,
            itemsById,
            signalsById: new Map(),
            now,
            getSourceRoleNullable: () => DiscoverySourceUsageRole.EDITORIAL,
        });
        expect(result.snapshots.length).toBeGreaterThan(0);
        for (const snap of result.snapshots) {
            expect(snap.explanation).toBeDefined();
            expect(typeof snap.explanation).toBe("string");
            expect(snap.explanation.length).toBeGreaterThan(0);
            expect(snap.indicatorSet).toBeDefined();
            expect(typeof snap.indicatorSet.signalCountInHorizon).toBe("number");
            expect(typeof snap.indicatorSet.sourceDiversityCount).toBe("number");
            expect(["fast_pulse", "short_cycle", "medium_cycle", "scheduled_monitor"].some((r) => snap.explanation.toLowerCase().includes(r))).toBe(true);
        }
    });
    it("evaluates all four horizons when horizonsNullable not set", () => {
        const now = new Date("2026-03-15T12:00:00.000Z");
        const items = [
            item({ externalItemId: "h1", publishedAt: "2026-03-14T08:00:00.000Z", sourceKey: sourceKeyAnsa }),
            item({ externalItemId: "h2", publishedAt: "2026-03-14T12:00:00.000Z", sourceKey: sourceKeyAnsa }),
        ];
        const itemsById = new Map(items.map((i) => [i.externalItemId, i]));
        const cluster = createDiscoveryStoryCluster({
            clusterId: createDiscoveryStoryClusterId("dsc_allhor01"),
            memberItemIds: ["h1", "h2"],
            memberSignalIds: [],
            status: DiscoveryStoryClusterStatus.OPEN,
            createdAt: createTimestamp("2026-03-14T08:00:00.000Z"),
        });
        const summary = buildDiscoveryStoryClusterSummary(cluster, itemsById);
        const result = discoveryTrendEvaluator.evaluateCluster({
            cluster,
            summary,
            itemsById,
            signalsById: new Map(),
            now,
        });
        expect(result.snapshots.length).toBe(4);
        const horizons = result.snapshots.map((s) => s.horizon);
        expect(horizons).toContain(DiscoveryTrendHorizon.FAST_PULSE);
        expect(horizons).toContain(DiscoveryTrendHorizon.SHORT_CYCLE);
        expect(horizons).toContain(DiscoveryTrendHorizon.MEDIUM_CYCLE);
        expect(horizons).toContain(DiscoveryTrendHorizon.SCHEDULED_MONITOR);
    });
});
//# sourceMappingURL=discovery-trend-evaluator.test.js.map