import { describe, expect, it } from "vitest";
import {
  discoveryDedupeEvaluator,
  createNormalizedDiscoveryItem,
  createNormalizedSourceReference,
  createDiscoverySourceId,
  createDiscoverySourceKey,
  createDiscoveryDedupeKey,
  DiscoveryDedupeOutcome,
  DiscoveryDedupeReason,
  DiscoveryDedupeEvidenceStrength,
  createDiscoverySignal,
  createDiscoverySignalId,
  createDiscoverySignalTimeWindow,
  createDiscoveryProvenanceMetadata,
  createDiscoverySignalEvidenceRef,
  DiscoverySignalKind,
  DiscoverySignalStatus,
  DiscoverySignalFreshnessClass,
  DiscoverySignalPriorityHint,
  DiscoveryEvidenceRole,
  DiscoverySourceTier,
  DiscoveryTrustTier,
  deriveDedupeKeysFromItem,
} from "../../src/discovery-news-engine/index.js";
import { createTimestamp } from "../../src/value-objects/timestamp.vo.js";

const sourceId = createDiscoverySourceId("dsrc_ded001");
const sourceKeyAnsa = createDiscoverySourceKey("ansa-rss");
const sourceKeyIngv = createDiscoverySourceKey("ingv");

function item(
  overrides: Partial<{
    headline: string;
    canonicalUrl: string;
    externalItemId: string;
    publishedAt: ReturnType<typeof createTimestamp>;
    sourceKey: ReturnType<typeof createDiscoverySourceKey>;
    locator: string;
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
    geoSignalNullable: null,
    geoPlaceTextNullable: null,
    topicSignalNullable: null,
    languageCode: "it",
    observedMetricsNullable: null,
  });
}

describe("discoveryDedupeEvaluator", () => {
  describe("evaluateItem", () => {
    it("returns duplicate_within_run when same canonicalUrl in withinRunItems", () => {
      const a = item({ canonicalUrl: "https://ansa.it/1", externalItemId: "a1" });
      const b = item({ canonicalUrl: "https://ansa.it/1", externalItemId: "b1" });
      const decision = discoveryDedupeEvaluator.evaluateItem(b, {
        withinRunItems: [a],
      });
      expect(decision.outcome).toBe(DiscoveryDedupeOutcome.DUPLICATE_WITHIN_RUN);
      expect(decision.reason).toBe(DiscoveryDedupeReason.CANONICAL_MATCH);
      expect(decision.matchedKey).not.toBeNull();
      expect(decision.matchedCandidateIdNullable).toBe("a1");
      expect(decision.evidenceStrengthNullable).toBe(DiscoveryDedupeEvidenceStrength.STRONG);
      expect(decision.foundWithinRun).toBe(true);
    });

    it("returns duplicate by source item id when same sourceKey + externalItemId", () => {
      const a = item({
        sourceKey: sourceKeyAnsa,
        externalItemId: "guid-123",
        canonicalUrl: "https://ansa.it/a",
      });
      const b = item({
        sourceKey: sourceKeyAnsa,
        externalItemId: "guid-123",
        canonicalUrl: "https://ansa.it/b",
      });
      const decision = discoveryDedupeEvaluator.evaluateItem(b, {
        withinRunItems: [a],
      });
      expect(decision.outcome).toBe(DiscoveryDedupeOutcome.DUPLICATE_WITHIN_RUN);
      expect(decision.reason).toBe(DiscoveryDedupeReason.SOURCE_EXTERNAL_ID);
      expect(decision.matchedCandidateIdNullable).toBe("guid-123");
      expect(decision.foundWithinRun).toBe(true);
    });

    it("returns duplicate when same title and same 1h time window", () => {
      const t = createTimestamp("2026-03-10T10:30:00.000Z");
      const a = item({
        headline: "Same Title Here",
        publishedAt: t,
        externalItemId: "id-a",
        canonicalUrl: "https://example.com/a",
      });
      const b = item({
        headline: "same title here",
        publishedAt: createTimestamp("2026-03-10T10:45:00.000Z"),
        externalItemId: "id-b",
        canonicalUrl: "https://example.com/different",
      });
      const decision = discoveryDedupeEvaluator.evaluateItem(b, {
        withinRunItems: [a],
      });
      expect(decision.outcome).toBe(DiscoveryDedupeOutcome.DUPLICATE_WITHIN_RUN);
      expect(decision.reason).toBe(DiscoveryDedupeReason.TITLE_TIME_WINDOW);
      expect(decision.evidenceStrengthNullable).toBe(DiscoveryDedupeEvidenceStrength.WEAK);
    });

    it("returns unique when title same but time window differs materially", () => {
      const a = item({
        headline: "Earthquake in Italy",
        publishedAt: createTimestamp("2026-03-10T10:00:00.000Z"),
        externalItemId: "id-a",
        canonicalUrl: "https://example.com/a",
      });
      const b = item({
        headline: "Earthquake in Italy",
        publishedAt: createTimestamp("2026-03-11T14:00:00.000Z"),
        externalItemId: "id-b",
        canonicalUrl: "https://example.com/b",
      });
      const decision = discoveryDedupeEvaluator.evaluateItem(b, {
        withinRunItems: [a],
      });
      expect(decision.outcome).toBe(DiscoveryDedupeOutcome.UNIQUE);
    });

    it("returns duplicate for structured source when same synthetic locator", () => {
      const a = item({
        sourceKey: sourceKeyIngv,
        locator: "https://terremoti.ingv.it/event/123",
        canonicalUrl: "https://terremoti.ingv.it/event/123",
        externalItemId: "evt-123",
      });
      const b = item({
        sourceKey: sourceKeyIngv,
        locator: "https://terremoti.ingv.it/event/123",
        canonicalUrl: "https://other.example/event/123",
        externalItemId: "evt-456",
      });
      const decision = discoveryDedupeEvaluator.evaluateItem(b, {
        withinRunItems: [a],
      });
      expect(decision.outcome).toBe(DiscoveryDedupeOutcome.DUPLICATE_WITHIN_RUN);
      expect(decision.reason).toBe(DiscoveryDedupeReason.SYNTHETIC_LOCATOR);
      expect(decision.matchedCandidateIdNullable).toBe("evt-123");
    });

    it("returns insufficient_evidence when item has no derivable keys", () => {
      const minimal = createNormalizedDiscoveryItem({
        headline: "",
        bodySnippetNullable: null,
        canonicalUrl: "",
        externalItemId: "",
        publishedAt: createTimestamp("2026-03-10T10:00:00.000Z"),
        publishedAtPresent: true,
        sourceReference: createNormalizedSourceReference({
          sourceId,
          locator: "",
          labelNullable: null,
          sourceKeyNullable: null,
        }),
        geoSignalNullable: null,
        geoPlaceTextNullable: null,
        topicSignalNullable: null,
        languageCode: "it",
        observedMetricsNullable: null,
      });
      const decision = discoveryDedupeEvaluator.evaluateItem(minimal, {
        withinRunItems: [],
      });
      expect(decision.outcome).toBe(DiscoveryDedupeOutcome.INSUFFICIENT_EVIDENCE);
      expect(decision.matchedKey).toBeNull();
      expect(decision.matchedCandidateIdNullable).toBeNull();
    });

    it("returns unique when no match in withinRun or prior", () => {
      const other = item({
        canonicalUrl: "https://example.com/other",
        externalItemId: "other",
        headline: "Other headline",
      });
      const c = item({
        canonicalUrl: "https://example.com/unique",
        externalItemId: "u1",
        headline: "Unique headline",
      });
      const decision = discoveryDedupeEvaluator.evaluateItem(c, {
        withinRunItems: [other],
        priorItems: [],
      });
      expect(decision.outcome).toBe(DiscoveryDedupeOutcome.UNIQUE);
      expect(decision.foundWithinRun).toBe(false);
    });

    it("returns duplicate_of_existing when match in priorItems", () => {
      const prior = item({
        canonicalUrl: "https://prior.com/1",
        externalItemId: "prior-1",
      });
      const candidate = item({
        canonicalUrl: "https://prior.com/1",
        externalItemId: "cand-1",
      });
      const decision = discoveryDedupeEvaluator.evaluateItem(candidate, {
        withinRunItems: [],
        priorItems: [prior],
      });
      expect(decision.outcome).toBe(DiscoveryDedupeOutcome.DUPLICATE_OF_EXISTING);
      expect(decision.matchedCandidateIdNullable).toBe("prior-1");
      expect(decision.foundWithinRun).toBe(false);
    });

    it("explainability: decision includes reason, matchedKey, evidenceStrength, foundWithinRun", () => {
      const a = item({ externalItemId: "ref-id", canonicalUrl: "https://x.com/1" });
      const b = item({ externalItemId: "b", canonicalUrl: "https://x.com/1" });
      const d = discoveryDedupeEvaluator.evaluateItem(b, { withinRunItems: [a] });
      expect(d.reason).toBe(DiscoveryDedupeReason.CANONICAL_MATCH);
      expect(d.matchedKey).not.toBeNull();
      expect(String(d.matchedKey)).toContain("url:");
      expect(d.evidenceStrengthNullable).toBe(DiscoveryDedupeEvidenceStrength.STRONG);
      expect(d.foundWithinRun).toBe(true);
    });

    it("within-run incremental: 10 distinct items each with only prior items in withinRunItems all evaluate to UNIQUE", () => {
      const tenItems = Array.from({ length: 10 }, (_, i) =>
        item({
          canonicalUrl: `https://source.example/item-${i}`,
          externalItemId: `ext-${i}`,
          headline: `Headline ${i}`,
        })
      );
      for (let i = 0; i < tenItems.length; i++) {
        const item = tenItems[i];
        if (item == null) continue;
        const decision = discoveryDedupeEvaluator.evaluateItem(item, {
          withinRunItems: tenItems.slice(0, i),
        });
        expect(decision.outcome).toBe(DiscoveryDedupeOutcome.UNIQUE);
        expect(decision.outcome).not.toBe(DiscoveryDedupeOutcome.DUPLICATE_WITHIN_RUN);
      }
    });

    it("self-match impossible: candidate not in withinRunItems so never matches itself", () => {
      const candidate = item({
        canonicalUrl: "https://single.com/1",
        externalItemId: "only-me",
      });
      const decision = discoveryDedupeEvaluator.evaluateItem(candidate, {
        withinRunItems: [],
      });
      expect(decision.outcome).toBe(DiscoveryDedupeOutcome.UNIQUE);
      expect(decision.foundWithinRun).toBe(false);
    });

    it("identical item later returns duplicate_within_run with matchedCandidateId of first", () => {
      const first = item({
        canonicalUrl: "https://same.com/article",
        externalItemId: "first-id",
      });
      const duplicate = item({
        canonicalUrl: "https://same.com/article",
        externalItemId: "second-id",
      });
      const decision = discoveryDedupeEvaluator.evaluateItem(duplicate, {
        withinRunItems: [first],
      });
      expect(decision.outcome).toBe(DiscoveryDedupeOutcome.DUPLICATE_WITHIN_RUN);
      expect(decision.matchedCandidateIdNullable).toBe("first-id");
      expect(decision.foundWithinRun).toBe(true);
    });

  });

  describe("evaluateSignal", () => {
    it("returns duplicate_within_run when same normalizedItemId in withinRunSignals", () => {
      const itmA = item({ externalItemId: "item-1", canonicalUrl: "https://a.com/1" });
      const sigA = createDiscoverySignal({
        id: createDiscoverySignalId("dsig_signal001"),
        kind: DiscoverySignalKind.HEADLINE,
        payloadRef: { normalizedItemId: "item-1" },
        timeWindow: createDiscoverySignalTimeWindow({
          start: createTimestamp("2026-03-10T10:00:00.000Z"),
          end: createTimestamp("2026-03-10T11:00:00.000Z"),
        }),
        freshnessClass: DiscoverySignalFreshnessClass.RECENT,
        priorityHint: DiscoverySignalPriorityHint.NORMAL,
        status: DiscoverySignalStatus.PENDING,
        evidenceRefs: [
          createDiscoverySignalEvidenceRef({
            itemId: "item-1",
            role: DiscoveryEvidenceRole.PRIMARY,
          }),
        ],
        provenanceMetadata: createDiscoveryProvenanceMetadata({
          fetchedAt: createTimestamp("2026-03-10T10:00:00.000Z"),
          sourceDefinitionId: sourceId,
          runIdNullable: null,
          sourceKey: sourceKeyAnsa,
          sourceRoleNullable: null,
          sourceTier: DiscoverySourceTier.PRIMARY,
          trustTier: DiscoveryTrustTier.CURATED,
          endpointReferenceNullable: null,
          adapterKeyNullable: null,
          fetchMetadataNullable: null,
        }),
        createdAt: createTimestamp("2026-03-10T10:05:00.000Z"),
      });
      const sigB = createDiscoverySignal({
        id: createDiscoverySignalId("dsig_signal002"),
        kind: DiscoverySignalKind.HEADLINE,
        payloadRef: { normalizedItemId: "item-1" },
        timeWindow: createDiscoverySignalTimeWindow({
          start: createTimestamp("2026-03-10T10:00:00.000Z"),
          end: createTimestamp("2026-03-10T11:00:00.000Z"),
        }),
        freshnessClass: DiscoverySignalFreshnessClass.RECENT,
        priorityHint: DiscoverySignalPriorityHint.NORMAL,
        status: DiscoverySignalStatus.PENDING,
        evidenceRefs: [
          createDiscoverySignalEvidenceRef({
            itemId: "item-1",
            role: DiscoveryEvidenceRole.PRIMARY,
          }),
        ],
        provenanceMetadata: createDiscoveryProvenanceMetadata({
          fetchedAt: createTimestamp("2026-03-10T10:00:00.000Z"),
          sourceDefinitionId: sourceId,
          runIdNullable: null,
          sourceKey: sourceKeyAnsa,
          sourceRoleNullable: null,
          sourceTier: DiscoverySourceTier.PRIMARY,
          trustTier: DiscoveryTrustTier.CURATED,
          endpointReferenceNullable: null,
          adapterKeyNullable: null,
          fetchMetadataNullable: null,
        }),
        createdAt: createTimestamp("2026-03-10T10:06:00.000Z"),
      });
      const decision = discoveryDedupeEvaluator.evaluateSignal(sigB, {
        withinRunSignals: [sigA],
        getItemForNormalizedId: (id) => (id === "item-1" ? itmA : null),
      });
      expect(decision.outcome).toBe(DiscoveryDedupeOutcome.DUPLICATE_WITHIN_RUN);
      expect(decision.foundWithinRun).toBe(true);
    });
  });

  describe("evaluate (legacy)", () => {
    it("returns DUPLICATE when key matches within-run item", () => {
      const a = item({ canonicalUrl: "https://legacy.com/1", externalItemId: "la" });
      const b = item({ canonicalUrl: "https://legacy.com/1", externalItemId: "lb" });
      const keys = deriveDedupeKeysFromItem(a);
      const urlKey = keys.find((k) => k.kind === "canonical_url")!.key;
      const decision = discoveryDedupeEvaluator.evaluate(urlKey, b, {
        withinRunItems: [a],
      });
      expect(decision.decision).toBe("duplicate");
      expect(decision.reason).toBe(DiscoveryDedupeReason.CANONICAL_MATCH);
    });

    it("returns NEW when key does not match any in context", () => {
      const b = item({ canonicalUrl: "https://new.com/1", externalItemId: "nb" });
      const key = createDiscoveryDedupeKey("url:https://other.com/1");
      const decision = discoveryDedupeEvaluator.evaluate(key, b, {
        withinRunItems: [],
      });
      expect(decision.decision).toBe("new");
    });
  });
});
