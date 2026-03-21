import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import {
  feedConnector,
  feedNormalizationAdapter,
  runConnectorWithNormalize,
  normalizeFeedPayload,
  createDiscoveryFetchRequest,
  createDiscoverySourceDefinition,
  createDiscoverySourceId,
  createDiscoverySourceKey,
  createDiscoverySourceEndpoint,
  createDiscoveryFetchedPayload,
  createDiscoveryTransportMetadata,
  DiscoverySourceKind,
  DiscoveryContentType,
  DiscoverySourceStatus,
  DiscoveryPollingHint,
  DiscoveryGeoScope,
  DiscoveryTopicScope,
  DiscoveryTrustTier,
  DiscoverySourceAuthMode,
  DiscoverySourceTier,
} from "../../src/discovery-news-engine/index.js";
import { createTimestamp } from "../../src/value-objects/timestamp.vo.js";

const minimalRss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>Test Feed</title>
    <item>
      <title>First item</title>
      <link>https://example.com/1</link>
      <guid>guid-1</guid>
      <pubDate>Mon, 10 Mar 2026 12:00:00 GMT</pubDate>
    </item>
    <item>
      <title>Second item</title>
      <link>https://example.com/2</link>
      <pubDate>Mon, 10 Mar 2026 13:00:00 GMT</pubDate>
    </item>
  </channel>
</rss>`;

const emptyRss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel><title>Empty</title></channel>
</rss>`;

const malformedXml = "<not valid xml";

const rssSourceDefinition = createDiscoverySourceDefinition({
  id: createDiscoverySourceId("dsrc_feed001"),
  key: createDiscoverySourceKey("feed-test"),
  kind: DiscoverySourceKind.RSS,
  tier: DiscoverySourceTier.PRIMARY,
  status: DiscoverySourceStatus.ENABLED,
  pollingHint: DiscoveryPollingHint.INTERVAL,
  geoScope: DiscoveryGeoScope.IT,
  topicScope: DiscoveryTopicScope.GENERAL,
  trustTier: DiscoveryTrustTier.CURATED,
  endpoint: createDiscoverySourceEndpoint({
    url: "https://example.com/feed.rss",
    method: "GET",
    headersNullable: null,
  }),
  authMode: DiscoverySourceAuthMode.NONE,
  sourceDefinitionIdNullable: null,
});

describe("feedConnector", () => {
  beforeEach(() => {
    vi.stubGlobal(
      "fetch",
      vi.fn((url: string) => {
        if (url.includes("feed.rss")) {
          return Promise.resolve({
            ok: true,
            status: 200,
            headers: new Headers({ "content-type": "application/rss+xml" }),
            text: () => Promise.resolve(minimalRss),
            json: () => Promise.reject(new Error("not json")),
          } as Response);
        }
        if (url.includes("empty")) {
          return Promise.resolve({
            ok: true,
            status: 200,
            headers: new Headers({ "content-type": "application/xml" }),
            text: () => Promise.resolve(emptyRss),
            json: () => Promise.reject(new Error("not json")),
          } as Response);
        }
        if (url.includes("malformed")) {
          return Promise.resolve({
            ok: true,
            status: 200,
            headers: new Headers({ "content-type": "application/xml" }),
            text: () => Promise.resolve(malformedXml),
            json: () => Promise.reject(new Error("not json")),
          } as Response);
        }
        return Promise.reject(new Error("unknown url"));
      }),
    );
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("canHandle returns true for RSS and FEED kind", () => {
    expect(feedConnector.canHandle(rssSourceDefinition)).toBe(true);
    const feedDef = createDiscoverySourceDefinition({
      ...rssSourceDefinition,
      kind: DiscoverySourceKind.FEED,
      key: createDiscoverySourceKey("feed-alt"),
    });
    expect(feedConnector.canHandle(feedDef)).toBe(true);
  });

  it("fetch returns payload with parsed items for valid RSS", async () => {
    const request = createDiscoveryFetchRequest({
      sourceDefinition: rssSourceDefinition,
      requestedAt: createTimestamp(new Date().toISOString()),
      cursorNullable: null,
    });
    const response = await feedConnector.fetch(request);
    expect(response.ok).toBe(true);
    if (response.ok) {
      expect(response.payload.raw).toHaveProperty("items");
      const items = (response.payload.raw as { items: unknown[] }).items;
      expect(items.length).toBeGreaterThanOrEqual(1);
      expect(items[0]).toHaveProperty("title", "First item");
      expect(items[0]).toHaveProperty("link", "https://example.com/1");
    }
  });

  it("runConnectorWithNormalize returns success with normalized items for valid RSS", async () => {
    const request = createDiscoveryFetchRequest({
      sourceDefinition: rssSourceDefinition,
      requestedAt: createTimestamp(new Date().toISOString()),
      cursorNullable: null,
    });
    const result = await runConnectorWithNormalize(
      request,
      feedConnector,
      feedNormalizationAdapter,
    );
    expect(result.outcome).toBe("success");
    if (result.outcome === "success") {
      expect(result.itemCount).toBeGreaterThanOrEqual(1);
      expect(result.normalizedPayload.items[0]!.headline).toBe("First item");
      expect(result.normalizedPayload.items[0]!.canonicalUrl).toBe("https://example.com/1");
    }
  });

  it("fetch returns parse failure for malformed XML", async () => {
    const malformedDef = createDiscoverySourceDefinition({
      ...rssSourceDefinition,
      endpoint: createDiscoverySourceEndpoint({
        url: "https://example.com/malformed.rss",
        method: "GET",
        headersNullable: null,
      }),
    });
    const request = createDiscoveryFetchRequest({
      sourceDefinition: malformedDef,
      requestedAt: createTimestamp(new Date().toISOString()),
      cursorNullable: null,
    });
    const response = await feedConnector.fetch(request);
    expect(response.ok).toBe(false);
    if (!response.ok) {
      expect(response.failure.code).toBe("PARSE_FAILURE");
    }
  });

  it("runConnectorWithNormalize returns unsupported_shape for empty feed (no items)", async () => {
    const emptyDef = createDiscoverySourceDefinition({
      ...rssSourceDefinition,
      endpoint: createDiscoverySourceEndpoint({
        url: "https://example.com/empty.rss",
        method: "GET",
        headersNullable: null,
      }),
    });
    const request = createDiscoveryFetchRequest({
      sourceDefinition: emptyDef,
      requestedAt: createTimestamp(new Date().toISOString()),
      cursorNullable: null,
    });
    const result = await runConnectorWithNormalize(
      request,
      feedConnector,
      feedNormalizationAdapter,
    );
    expect(result.outcome === "unsupported_shape" || result.outcome === "parse_failure").toBe(true);
  });
});

describe("feed normalizer", () => {
  it("normalizeFeedPayload produces NormalizedDiscoveryPayload from raw feed shape", () => {
    const fetchedAt = "2026-03-10T12:00:00.000Z";
    const payload = createDiscoveryFetchedPayload({
      raw: {
        items: [
          { link: "https://a.com/1", title: "A1", pubDate: "2026-03-10T12:00:00.000Z" },
          { link: "https://a.com/2", title: "A2" },
        ],
        feedTitle: "Feed A",
      },
      transportMetadata: createDiscoveryTransportMetadata({
        contentType: DiscoveryContentType.RSS,
        fetchedAt: createTimestamp(fetchedAt),
        statusCodeNullable: 200,
        etagNullable: null,
      }),
    });
    const normalized = normalizeFeedPayload(payload, {
      sourceDefinition: rssSourceDefinition,
      runIdNullable: null,
    });
    expect(normalized.items).toHaveLength(2);
    expect(normalized.items[0]!.headline).toBe("A1");
    expect(normalized.items[0]!.canonicalUrl).toBe("https://a.com/1");
    expect(normalized.items[1]!.headline).toBe("A2");
  });

  it("normalizeFeedPayload throws when raw has no valid items (missing link/title)", () => {
    const payload = createDiscoveryFetchedPayload({
      raw: { items: [{ title: "No link" }], feedTitle: "X" },
      transportMetadata: createDiscoveryTransportMetadata({
        contentType: DiscoveryContentType.RSS,
        fetchedAt: createTimestamp("2026-03-10T12:00:00.000Z"),
        statusCodeNullable: 200,
        etagNullable: null,
      }),
    });
    expect(() =>
      normalizeFeedPayload(payload, {
        sourceDefinition: rssSourceDefinition,
        runIdNullable: null,
      }),
    ).toThrow(/No items to normalize|items must contain/);
  });
});
