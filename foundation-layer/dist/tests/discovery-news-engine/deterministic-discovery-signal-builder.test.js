import { describe, expect, it } from "vitest";
import { deterministicDiscoverySignalBuilder, createNormalizedDiscoveryItem, createNormalizedDiscoveryPayload, createNormalizedSourceReference, createDiscoveryProvenanceMetadata, createDiscoverySourceId, createDiscoverySourceKey, validateDiscoverySignal, DiscoverySignalKind, DiscoverySourceTier, DiscoveryTrustTier, } from "../../src/discovery-news-engine/index.js";
import { createTimestamp } from "../../src/value-objects/timestamp.vo.js";
describe("deterministicDiscoverySignalBuilder", () => {
    const sourceId = createDiscoverySourceId("dsrc_sig001");
    const sourceKey = createDiscoverySourceKey("test-sig-source");
    const item = createNormalizedDiscoveryItem({
        headline: "Signal headline",
        bodySnippetNullable: null,
        canonicalUrl: "https://example.com/sig/1",
        externalItemId: "item-sig-1",
        publishedAt: createTimestamp("2026-03-10T10:00:00.000Z"),
        publishedAtPresent: true,
        sourceReference: createNormalizedSourceReference({
            sourceId,
            locator: "https://example.com/sig/1",
            labelNullable: null,
            sourceKeyNullable: sourceKey,
        }),
        geoSignalNullable: null,
        geoPlaceTextNullable: null,
        topicSignalNullable: null,
        languageCode: "it",
        observedMetricsNullable: null,
    });
    it("builds one DiscoverySignal from single NormalizedDiscoveryItem", () => {
        const signal = deterministicDiscoverySignalBuilder.build(item);
        expect(signal).not.toBeInstanceOf(Array);
        const s = signal;
        expect(s.kind).toBe(DiscoverySignalKind.HEADLINE);
        expect(s.payloadRef.normalizedItemId).toBe("item-sig-1");
        expect(s.evidenceRefs).toHaveLength(1);
        expect(s.evidenceRefs[0].itemId).toBe("item-sig-1");
        expect(s.provenanceMetadata.sourceDefinitionId).toBe(sourceId);
        const report = validateDiscoverySignal(s);
        expect(report.isValid).toBe(true);
    });
    it("builds multiple DiscoverySignals from NormalizedDiscoveryPayload", () => {
        const item2 = createNormalizedDiscoveryItem({
            headline: "Second",
            bodySnippetNullable: null,
            canonicalUrl: "https://example.com/2",
            externalItemId: "item-sig-2",
            publishedAt: createTimestamp("2026-03-10T10:00:00.000Z"),
            publishedAtPresent: true,
            sourceReference: createNormalizedSourceReference({
                sourceId,
                locator: "https://example.com/2",
                labelNullable: null,
                sourceKeyNullable: sourceKey,
            }),
            geoSignalNullable: null,
            geoPlaceTextNullable: null,
            topicSignalNullable: null,
            languageCode: "it",
            observedMetricsNullable: null,
        });
        const payload = createNormalizedDiscoveryPayload({
            items: [item, item2],
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
            sourceId,
        });
        const signals = deterministicDiscoverySignalBuilder.build(payload);
        expect(Array.isArray(signals)).toBe(true);
        expect(signals.length).toBe(2);
        const report0 = validateDiscoverySignal(signals[0]);
        const report1 = validateDiscoverySignal(signals[1]);
        expect(report0.isValid).toBe(true);
        expect(report1.isValid).toBe(true);
    });
    it("uses options kindNullable when provided", () => {
        const signal = deterministicDiscoverySignalBuilder.build(item, {
            kindNullable: DiscoverySignalKind.ALERT,
        });
        expect(signal.kind).toBe(DiscoverySignalKind.ALERT);
    });
});
//# sourceMappingURL=deterministic-discovery-signal-builder.test.js.map