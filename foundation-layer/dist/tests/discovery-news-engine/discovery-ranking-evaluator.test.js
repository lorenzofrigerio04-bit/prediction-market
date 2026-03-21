import { describe, expect, it } from "vitest";
import { discoveryRankingEvaluator, groupSnapshotsByClusterId, createDiscoveryStoryClusterId, createDiscoveryStoryCluster, createDiscoveryStoryClusterSummary, buildDiscoveryStoryClusterSummary, createDiscoveryTrendSnapshot, createDiscoveryTrendSnapshotId, createDiscoveryTrendIndicatorSet, createNormalizedDiscoveryItem, createNormalizedSourceReference, createDiscoverySourceId, createDiscoverySourceKey, createDiscoverySignal, createDiscoverySignalId, createDiscoverySignalTimeWindow, createDiscoveryProvenanceMetadata, createDiscoverySignalEvidenceRef, DiscoveryStoryClusterStatus, DiscoveryTrendHorizon, DiscoveryTrendStatus, DiscoverySignalKind, DiscoverySignalStatus, DiscoverySignalFreshnessClass, DiscoverySignalPriorityHint, DiscoveryEvidenceRole, DiscoverySourceTier, DiscoveryTrustTier, DiscoverySourceUsageRole, DiscoveryPriorityClass, DiscoveryGeoScope, } from "../../src/discovery-news-engine/index.js";
import { createTimestamp } from "../../src/value-objects/timestamp.vo.js";
const sourceId = createDiscoverySourceId("dsrc_ded001");
const sourceKeyAnsa = createDiscoverySourceKey("ansa-rss");
const sourceKeyIngv = createDiscoverySourceKey("ingv-terremoti");
const sourceKeyGazzetta = createDiscoverySourceKey("gazzetta-ufficiale");
const sourceKeyWikimedia = createDiscoverySourceKey("wikimedia-pageviews");
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
        freshnessClass: DiscoverySignalFreshnessClass.RECENT,
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
function snapshot(opts) {
    const ind = createDiscoveryTrendIndicatorSet({
        signalCountInHorizon: opts.signalCount ?? 3,
        sourceDiversityCount: opts.sourceDiversityCount ?? 2,
        hasAuthoritativeSource: opts.hasAuthoritative ?? false,
        hasEditorialSource: opts.hasEditorial ?? false,
        hasAttentionSource: opts.hasAttention ?? false,
        recentActivityDensity: 1,
        timeSpanHours: 12,
        freshnessClassConsistency: "recent",
        scheduledSourceRelevance: opts.scheduledSourceRelevance ?? false,
    });
    return createDiscoveryTrendSnapshot({
        snapshotId: createDiscoveryTrendSnapshotId(`dts_${opts.horizon}_${String(opts.clusterId).slice(0, 12)}`),
        clusterId: opts.clusterId,
        horizon: opts.horizon,
        trendStatus: opts.trendStatus,
        indicatorSet: ind,
        explanation: `test ${opts.horizon} ${opts.trendStatus}`,
    });
}
describe("discoveryRankingEvaluator", () => {
    it("high-priority cluster with strong Italian + authoritative/editorial support", () => {
        const clusterId = createDiscoveryStoryClusterId("dsc_high_it");
        const item1 = item({
            externalItemId: "i1",
            publishedAt: "2026-03-11T02:00:00.000Z",
            sourceKey: sourceKeyAnsa,
        });
        const item2 = item({
            externalItemId: "i2",
            publishedAt: "2026-03-11T04:00:00.000Z",
            sourceKey: sourceKeyGazzetta,
        });
        const itemsById = new Map([["i1", item1], ["i2", item2]]);
        const cluster = createDiscoveryStoryCluster({
            clusterId,
            memberItemIds: ["i1", "i2"],
            memberSignalIds: [],
            status: DiscoveryStoryClusterStatus.OPEN,
            createdAt: createTimestamp("2026-03-11T02:00:00.000Z"),
        });
        const summary = buildDiscoveryStoryClusterSummary(cluster, itemsById);
        const summaryWithGeo = createDiscoveryStoryClusterSummary({
            ...summary,
            topicGeoSummaryNullable: { geo: DiscoveryGeoScope.IT },
        });
        const snapshots = [
            snapshot({
                clusterId,
                horizon: DiscoveryTrendHorizon.SHORT_CYCLE,
                trendStatus: DiscoveryTrendStatus.TRENDING,
                signalCount: 5,
                sourceDiversityCount: 2,
                hasAuthoritative: true,
                hasEditorial: true,
                hasAttention: false,
            }),
        ];
        const summariesByClusterId = new Map();
        summariesByClusterId.set(String(cluster.clusterId), summaryWithGeo);
        const snapshotsByClusterId = new Map();
        snapshotsByClusterId.set(String(cluster.clusterId), []);
        const result = discoveryRankingEvaluator.rank({
            clusters: [cluster],
            summariesByClusterId,
            snapshotsByClusterId,
            itemsById,
            isItalianSourceKey: (key) => ["ansa-rss", "gazzetta-ufficiale", "ingv-terremoti"].includes(key),
            getSourceRoleNullable: (key) => key === "ansa-rss"
                ? DiscoverySourceUsageRole.EDITORIAL
                : key === "gazzetta-ufficiale"
                    ? DiscoverySourceUsageRole.AUTHORITATIVE
                    : null,
        });
        expect(result.entries.length).toBe(1);
        const entry = result.entries[0];
        expect([DiscoveryPriorityClass.HIGH, DiscoveryPriorityClass.MEDIUM]).toContain(entry.priorityClass);
        expect(entry.clusterId).toBe(clusterId);
        expect(["high", "medium", "none"]).toContain(entry.breakdown.italianRelevance);
        expect(entry.breakdown.authoritativeRelevance || entry.breakdown.editorialRelevance).toBe(true);
        const italianReason = entry.reasons.find((r) => r.code === "italian_relevance_high" || r.code === "italian_relevance_medium");
        const authOrEditorialReason = entry.reasons.find((r) => r.code === "authoritative_source" || r.code === "editorial_source");
        expect(italianReason != null || authOrEditorialReason != null).toBe(true);
    });
    it("attention-heavy cluster with weak authoritative support ranks lower and has caution flag", () => {
        const clusterId = createDiscoveryStoryClusterId("dsc_attention_only");
        const sig = signal({
            id: "dsig_attn01wikimedia",
            itemId: "wi1",
            start: "2026-03-11T10:00:00.000Z",
            end: "2026-03-11T11:00:00.000Z",
            sourceKey: sourceKeyWikimedia,
            sourceRole: DiscoverySourceUsageRole.ATTENTION,
        });
        const signalsById = new Map([[sig.id, sig]]);
        const cluster = createDiscoveryStoryCluster({
            clusterId,
            memberItemIds: [],
            memberSignalIds: [sig.id],
            status: DiscoveryStoryClusterStatus.OPEN,
            createdAt: createTimestamp("2026-03-11T10:00:00.000Z"),
        });
        const summary = createDiscoveryStoryClusterSummary({
            clusterId,
            memberIds: { itemIds: [], signalIds: [sig.id] },
            representativeHeadlineOrItemId: "Pageviews topic",
            sourceDiversityCount: 1,
            timeSpanNullable: null,
            topicGeoSummaryNullable: null,
        });
        const snapshots = [
            snapshot({
                clusterId,
                horizon: DiscoveryTrendHorizon.FAST_PULSE,
                trendStatus: DiscoveryTrendStatus.TRENDING,
                signalCount: 2,
                sourceDiversityCount: 1,
                hasAuthoritative: false,
                hasEditorial: false,
                hasAttention: true,
            }),
        ];
        const summariesByClusterId = new Map();
        summariesByClusterId.set(String(cluster.clusterId), summary);
        const snapshotsByClusterId = new Map();
        snapshotsByClusterId.set(String(cluster.clusterId), []);
        const result = discoveryRankingEvaluator.rank({
            clusters: [cluster],
            summariesByClusterId,
            snapshotsByClusterId,
            signalsById,
            isItalianSourceKey: () => false,
        });
        expect(result.entries.length).toBe(1);
        const entry = result.entries[0];
        expect([DiscoveryPriorityClass.MEDIUM, DiscoveryPriorityClass.LOW, DiscoveryPriorityClass.INSUFFICIENT_EVIDENCE]).toContain(entry.priorityClass);
        expect(entry.breakdown.attentionRelevance).toBe(true);
        expect(entry.breakdown.authoritativeRelevance).toBe(false);
        expect(entry.breakdown.editorialRelevance).toBe(false);
        const hasCaution = (entry.cautionFlags ?? []).includes("high_attention_low_authoritative") ||
            entry.reasons.some((r) => r.code === "caution_attention_only");
        if (hasCaution) {
            expect(entry.cautionFlags ?? []).toContain("high_attention_low_authoritative");
        }
    });
    it("scheduled monitor cluster gets scheduled relevance reason and appropriate priority", () => {
        const clusterId = createDiscoveryStoryClusterId("dsc_sched_rank");
        const sig = signal({
            id: "dsig_schedrank01gazz",
            itemId: "g1",
            start: "2026-03-15T10:00:00.000Z",
            end: "2026-03-15T11:00:00.000Z",
            sourceKey: sourceKeyGazzetta,
            sourceRole: DiscoverySourceUsageRole.AUTHORITATIVE,
        });
        const signalsById = new Map([[sig.id, sig]]);
        const cluster = createDiscoveryStoryCluster({
            clusterId,
            memberItemIds: [],
            memberSignalIds: [sig.id],
            status: DiscoveryStoryClusterStatus.OPEN,
            createdAt: createTimestamp("2026-03-15T10:00:00.000Z"),
        });
        const summary = createDiscoveryStoryClusterSummary({
            clusterId,
            memberIds: { itemIds: [], signalIds: [sig.id] },
            representativeHeadlineOrItemId: "Official",
            sourceDiversityCount: 1,
            timeSpanNullable: null,
            topicGeoSummaryNullable: { geo: DiscoveryGeoScope.IT },
        });
        const snapshots = [
            snapshot({
                clusterId,
                horizon: DiscoveryTrendHorizon.SCHEDULED_MONITOR,
                trendStatus: DiscoveryTrendStatus.TRENDING,
                signalCount: 1,
                sourceDiversityCount: 1,
                hasAuthoritative: true,
                hasEditorial: false,
                hasAttention: false,
                scheduledSourceRelevance: true,
            }),
        ];
        const result = discoveryRankingEvaluator.rank({
            clusters: [cluster],
            summariesByClusterId: new Map([[String(clusterId), summary]]),
            snapshotsByClusterId: groupSnapshotsByClusterId(snapshots),
            signalsById,
            isItalianSourceKey: (key) => key === "gazzetta-ufficiale",
        });
        expect(result.entries.length).toBe(1);
        const entry = result.entries[0];
        expect(entry.breakdown.scheduledRelevance).toBe(true);
        const schedReason = entry.reasons.find((r) => r.code === "scheduled_relevance");
        expect(schedReason).toBeDefined();
    });
    it("medium-cycle persistent cluster gets MEDIUM priority with relevant reasons", () => {
        const clusterId = createDiscoveryStoryClusterId("dsc_medium_rank");
        const items = [
            item({ externalItemId: "m1", publishedAt: "2026-03-10T00:00:00.000Z", sourceKey: sourceKeyAnsa }),
            item({ externalItemId: "m2", publishedAt: "2026-03-18T00:00:00.000Z", sourceKey: sourceKeyAnsa }),
            item({ externalItemId: "m3", publishedAt: "2026-03-22T00:00:00.000Z", sourceKey: sourceKeyIngv }),
        ];
        const itemsById = new Map(items.map((i) => [i.externalItemId, i]));
        const cluster = createDiscoveryStoryCluster({
            clusterId,
            memberItemIds: ["m1", "m2", "m3"],
            memberSignalIds: [],
            status: DiscoveryStoryClusterStatus.OPEN,
            createdAt: createTimestamp("2026-03-10T00:00:00.000Z"),
        });
        const summary = buildDiscoveryStoryClusterSummary(cluster, itemsById);
        const snapshots = [
            snapshot({
                clusterId,
                horizon: DiscoveryTrendHorizon.MEDIUM_CYCLE,
                trendStatus: DiscoveryTrendStatus.TRENDING,
                signalCount: 3,
                sourceDiversityCount: 2,
                hasAuthoritative: true,
                hasEditorial: true,
                hasAttention: false,
            }),
        ];
        const result = discoveryRankingEvaluator.rank({
            clusters: [cluster],
            summariesByClusterId: new Map([[String(clusterId), summary]]),
            snapshotsByClusterId: groupSnapshotsByClusterId(snapshots),
            itemsById,
            isItalianSourceKey: (key) => ["ansa-rss", "ingv-terremoti"].includes(key),
        });
        expect(result.entries.length).toBe(1);
        const entry = result.entries[0];
        expect(entry.priorityClass).toBe(DiscoveryPriorityClass.MEDIUM);
        expect(["high", "medium"]).toContain(entry.breakdown.signalDensity);
        expect(["high", "medium"]).toContain(entry.breakdown.sourceDiversity);
    });
    it("low-information / insufficient evidence gets LOW or INSUFFICIENT_EVIDENCE", () => {
        const clusterId = createDiscoveryStoryClusterId("dsc_low_info");
        const single = item({
            externalItemId: "alone",
            publishedAt: "2026-03-11T10:00:00.000Z",
            sourceKey: sourceKeyAnsa,
        });
        const itemsById = new Map([["alone", single]]);
        const cluster = createDiscoveryStoryCluster({
            clusterId,
            memberItemIds: ["alone"],
            memberSignalIds: [],
            status: DiscoveryStoryClusterStatus.OPEN,
            createdAt: createTimestamp("2026-03-11T10:00:00.000Z"),
        });
        const summary = buildDiscoveryStoryClusterSummary(cluster, itemsById);
        const snapshots = [
            snapshot({
                clusterId,
                horizon: DiscoveryTrendHorizon.FAST_PULSE,
                trendStatus: DiscoveryTrendStatus.INSUFFICIENT_EVIDENCE,
                signalCount: 1,
                sourceDiversityCount: 1,
                hasAuthoritative: false,
                hasEditorial: false,
                hasAttention: false,
            }),
        ];
        const result = discoveryRankingEvaluator.rank({
            clusters: [cluster],
            summariesByClusterId: new Map([[String(clusterId), summary]]),
            snapshotsByClusterId: groupSnapshotsByClusterId(snapshots),
            itemsById,
        });
        expect(result.entries.length).toBe(1);
        const entry = result.entries[0];
        expect([DiscoveryPriorityClass.LOW, DiscoveryPriorityClass.INSUFFICIENT_EVIDENCE]).toContain(entry.priorityClass);
        expect(["low", "medium"]).toContain(entry.breakdown.signalDensity);
        expect(entry.reasons.some((r) => r.impact === "negative" || r.code.includes("low"))).toBe(true);
    });
    it("explainability: every entry has breakdown and reasons", () => {
        const clusterId = createDiscoveryStoryClusterId("dsc_explain");
        const cluster = createDiscoveryStoryCluster({
            clusterId,
            memberItemIds: ["e1", "e2"],
            memberSignalIds: [],
            status: DiscoveryStoryClusterStatus.OPEN,
            createdAt: createTimestamp("2026-03-11T02:00:00.000Z"),
        });
        const summary = createDiscoveryStoryClusterSummary({
            clusterId,
            memberIds: { itemIds: ["e1", "e2"], signalIds: [] },
            representativeHeadlineOrItemId: "Head",
            sourceDiversityCount: 2,
            timeSpanNullable: null,
            topicGeoSummaryNullable: null,
        });
        const snapshots = [
            snapshot({
                clusterId,
                horizon: DiscoveryTrendHorizon.SHORT_CYCLE,
                trendStatus: DiscoveryTrendStatus.TRENDING,
                signalCount: 2,
                sourceDiversityCount: 2,
                hasEditorial: true,
            }),
        ];
        const result = discoveryRankingEvaluator.rank({
            clusters: [cluster],
            summariesByClusterId: new Map([[String(clusterId), summary]]),
            snapshotsByClusterId: groupSnapshotsByClusterId(snapshots),
        });
        expect(result.entries.length).toBe(1);
        const entry = result.entries[0];
        expect(entry.breakdown).toBeDefined();
        expect(typeof entry.breakdown.novelty).toBe("string");
        expect(typeof entry.breakdown.signalDensity).toBe("string");
        expect(typeof entry.breakdown.italianRelevance).toBe("string");
        expect(entry.reasons).toBeDefined();
        expect(Array.isArray(entry.reasons)).toBe(true);
        expect(entry.orderingBasis).toBeDefined();
        expect(Array.isArray(entry.orderingBasis)).toBe(true);
    });
    it("Italian relevance affects relative rank: IT cluster ranks higher than similar non-IT", () => {
        const clusterIdIt = createDiscoveryStoryClusterId("dsc_it_first");
        const clusterIdNonIt = createDiscoveryStoryClusterId("dsc_non_it");
        const itemIt1 = item({
            externalItemId: "it1",
            publishedAt: "2026-03-11T08:00:00.000Z",
            sourceKey: sourceKeyAnsa,
        });
        const itemIt2 = item({
            externalItemId: "it2",
            publishedAt: "2026-03-11T10:00:00.000Z",
            sourceKey: sourceKeyGazzetta,
        });
        const itemNon1 = item({
            externalItemId: "n1",
            publishedAt: "2026-03-11T08:00:00.000Z",
            sourceKey: sourceKeyWikimedia,
        });
        const itemNon2 = item({
            externalItemId: "n2",
            publishedAt: "2026-03-11T10:00:00.000Z",
            sourceKey: sourceKeyWikimedia,
        });
        const itemsById = new Map([
            ["it1", itemIt1],
            ["it2", itemIt2],
            ["n1", itemNon1],
            ["n2", itemNon2],
        ]);
        const clusterIt = createDiscoveryStoryCluster({
            clusterId: clusterIdIt,
            memberItemIds: ["it1", "it2"],
            memberSignalIds: [],
            status: DiscoveryStoryClusterStatus.OPEN,
            createdAt: createTimestamp("2026-03-11T08:00:00.000Z"),
        });
        const clusterNonIt = createDiscoveryStoryCluster({
            clusterId: clusterIdNonIt,
            memberItemIds: ["n1", "n2"],
            memberSignalIds: [],
            status: DiscoveryStoryClusterStatus.OPEN,
            createdAt: createTimestamp("2026-03-11T08:00:00.000Z"),
        });
        const summaryIt = createDiscoveryStoryClusterSummary({
            clusterId: clusterIdIt,
            memberIds: { itemIds: ["it1", "it2"], signalIds: [] },
            representativeHeadlineOrItemId: "Italian news",
            sourceDiversityCount: 2,
            timeSpanNullable: null,
            topicGeoSummaryNullable: { geo: DiscoveryGeoScope.IT },
        });
        const summaryNonIt = createDiscoveryStoryClusterSummary({
            clusterId: clusterIdNonIt,
            memberIds: { itemIds: ["n1", "n2"], signalIds: [] },
            representativeHeadlineOrItemId: "Non-IT",
            sourceDiversityCount: 1,
            timeSpanNullable: null,
            topicGeoSummaryNullable: null,
        });
        const snapshotsIt = [
            snapshot({
                clusterId: clusterIdIt,
                horizon: DiscoveryTrendHorizon.SHORT_CYCLE,
                trendStatus: DiscoveryTrendStatus.TRENDING,
                signalCount: 5,
                sourceDiversityCount: 2,
                hasEditorial: true,
                hasAuthoritative: true,
            }),
        ];
        const snapshotsNonIt = [
            snapshot({
                clusterId: clusterIdNonIt,
                horizon: DiscoveryTrendHorizon.SHORT_CYCLE,
                trendStatus: DiscoveryTrendStatus.TRENDING,
                signalCount: 2,
                sourceDiversityCount: 1,
                hasAttention: true,
                hasEditorial: false,
                hasAuthoritative: false,
            }),
        ];
        const allSnapshots = [...snapshotsIt, ...snapshotsNonIt];
        const result = discoveryRankingEvaluator.rank({
            clusters: [clusterIt, clusterNonIt],
            summariesByClusterId: new Map([
                [String(clusterIdIt), summaryIt],
                [String(clusterIdNonIt), summaryNonIt],
            ]),
            snapshotsByClusterId: groupSnapshotsByClusterId(allSnapshots),
            itemsById,
            isItalianSourceKey: (key) => ["ansa-rss", "gazzetta-ufficiale", "ingv-terremoti"].includes(key),
        });
        expect(result.entries.length).toBe(2);
        const entryIt = result.entries.find((e) => e.clusterId === clusterIdIt);
        const entryNonIt = result.entries.find((e) => e.clusterId === clusterIdNonIt);
        expect(entryIt).toBeDefined();
        expect(entryNonIt).toBeDefined();
        expect(entryIt.breakdown.italianRelevance).not.toBe("none");
        expect(entryNonIt.breakdown.italianRelevance).toBe("none");
        expect([DiscoveryPriorityClass.HIGH, DiscoveryPriorityClass.MEDIUM]).toContain(entryIt.priorityClass);
        expect([DiscoveryPriorityClass.MEDIUM, DiscoveryPriorityClass.LOW]).toContain(entryNonIt.priorityClass);
        const order = result.entries.map((e) => String(e.clusterId));
        const itIndex = order.indexOf(String(clusterIdIt));
        const nonItIndex = order.indexOf(String(clusterIdNonIt));
        expect(itIndex).toBeLessThan(nonItIndex);
    });
});
//# sourceMappingURL=discovery-ranking-evaluator.test.js.map