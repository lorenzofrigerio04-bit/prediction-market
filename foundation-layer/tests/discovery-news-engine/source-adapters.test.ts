import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import {
  discoverySourceRegistry,
  catalogEntryToSourceDefinition,
  createDiscoveryFetchRequest,
  runConnectorWithNormalize,
  getAdapterByKey,
  getSupportedSourceKeys,
  getAdaptersByKind,
  ansaRssSourceAdapter,
  istatNormalizationAdapter,
  ingvNormalizationAdapter,
  wikimediaPageviewsNormalizationAdapter,
  youtubeDataItNormalizationAdapter,
  googleTrendsItNormalizationAdapter,
  createDiscoveryFetchedPayload,
  createDiscoveryTransportMetadata,
  createDiscoverySourceDefinition,
  createDiscoverySourceId,
  createDiscoverySourceKey,
  createDiscoverySourceEndpoint,
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
      <title>ANSA headline</title>
      <link>https://www.ansa.it/item/1</link>
      <guid>ansa-guid-1</guid>
      <pubDate>Mon, 10 Mar 2026 12:00:00 GMT</pubDate>
    </item>
  </channel>
</rss>`;

const emptyRss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel><title>Empty</title></channel>
</rss>`;

const malformedXml = "<not valid xml";

describe("Source adapters – resolution", () => {
  it("getAdapterByKey returns adapter for known keys", () => {
    expect(getAdapterByKey("ansa-rss")).toBe(ansaRssSourceAdapter);
    expect(getAdapterByKey(ansaRssSourceAdapter.sourceKey)).toBe(ansaRssSourceAdapter);
    expect(getAdapterByKey("agi-rss")).toBeDefined();
    expect(getAdapterByKey("protezione-civile-rss")).toBeDefined();
    expect(getAdapterByKey("gazzetta-ufficiale")).toBeDefined();
    expect(getAdapterByKey("istat-sdmx")).toBeDefined();
    expect(getAdapterByKey("ingv-terremoti")).toBeDefined();
    expect(getAdapterByKey("wikimedia-pageviews")).toBeDefined();
    expect(getAdapterByKey("youtube-data-it")).toBeDefined();
    expect(getAdapterByKey("google-trends-it")).toBeDefined();
  });

  it("getAdapterByKey returns undefined for unknown key", () => {
    expect(getAdapterByKey("unknown-source")).toBeUndefined();
    expect(getAdapterByKey("")).toBeUndefined();
  });

  it("getSupportedSourceKeys includes all nine target adapter keys", () => {
    const keys = getSupportedSourceKeys();
    expect(keys).toContain("ansa-rss");
    expect(keys).toContain("agi-rss");
    expect(keys).toContain("protezione-civile-rss");
    expect(keys).toContain("gazzetta-ufficiale");
    expect(keys).toContain("istat-sdmx");
    expect(keys).toContain("ingv-terremoti");
    expect(keys).toContain("wikimedia-pageviews");
    expect(keys).toContain("youtube-data-it");
    expect(keys).toContain("google-trends-it");
    expect(keys.length).toBe(9);
  });

  it("getAdaptersByKind(RSS) returns only RSS adapters", () => {
    const rss = getAdaptersByKind(DiscoverySourceKind.RSS);
    expect(rss.length).toBe(4);
    const keys = rss.map((a) => String(a.sourceKey));
    expect(keys).toContain("ansa-rss");
    expect(keys).toContain("agi-rss");
    expect(keys).toContain("protezione-civile-rss");
    expect(keys).toContain("gazzetta-ufficiale");
  });

  it("getAdaptersByKind(API) returns ISTAT, INGV, and attention adapters", () => {
    const api = getAdaptersByKind(DiscoverySourceKind.API);
    expect(api.length).toBe(5);
    const keys = api.map((a) => String(a.sourceKey));
    expect(keys).toContain("istat-sdmx");
    expect(keys).toContain("ingv-terremoti");
    expect(keys).toContain("wikimedia-pageviews");
    expect(keys).toContain("youtube-data-it");
    expect(keys).toContain("google-trends-it");
  });
});

describe("ANSA RSS adapter", () => {
  beforeEach(() => {
    vi.stubGlobal(
      "fetch",
      vi.fn(() =>
        Promise.resolve({
          ok: true,
          status: 200,
          headers: new Headers({ "content-type": "application/rss+xml" }),
          text: () => Promise.resolve(minimalRss),
          json: () => Promise.reject(new Error("not json")),
        } as Response),
      ),
    );
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("happy path: run with catalog entry ansa-rss returns normalized payload", async () => {
    const entry = discoverySourceRegistry.getByKey("ansa-rss");
    expect(entry).toBeDefined();
    const def = catalogEntryToSourceDefinition(entry!);
    const request = createDiscoveryFetchRequest({
      sourceDefinition: def,
      requestedAt: createTimestamp(new Date().toISOString()),
      cursorNullable: null,
    });
    const adapter = getAdapterByKey("ansa-rss")!;
    const result = await runConnectorWithNormalize(request, adapter.connector, adapter.normalizer);
    expect(result.outcome).toBe("success");
    if (result.outcome === "success") {
      expect(result.itemCount).toBeGreaterThanOrEqual(1);
      expect(result.normalizedPayload.items[0]!.headline).toBe("ANSA headline");
      expect(result.normalizedPayload.items[0]!.canonicalUrl).toBe("https://www.ansa.it/item/1");
      expect(result.normalizedPayload.sourceId).toBe(def.id);
    }
  });
});

describe("AGI RSS adapter", () => {
  beforeEach(() => {
    vi.stubGlobal(
      "fetch",
      vi.fn(() =>
        Promise.resolve({
          ok: true,
          status: 200,
          headers: new Headers({ "content-type": "application/rss+xml" }),
          text: () => Promise.resolve(minimalRss.replace("ANSA headline", "AGI headline").replace("ansa.it", "agi.it")),
          json: () => Promise.reject(new Error("not json")),
        } as Response),
      ),
    );
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("happy path: run with catalog entry agi-rss returns normalized payload", async () => {
    const entry = discoverySourceRegistry.getByKey("agi-rss");
    expect(entry).toBeDefined();
    const def = catalogEntryToSourceDefinition(entry!);
    const request = createDiscoveryFetchRequest({
      sourceDefinition: def,
      requestedAt: createTimestamp(new Date().toISOString()),
      cursorNullable: null,
    });
    const adapter = getAdapterByKey("agi-rss")!;
    const result = await runConnectorWithNormalize(request, adapter.connector, adapter.normalizer);
    expect(result.outcome).toBe("success");
    if (result.outcome === "success") {
      expect(result.itemCount).toBeGreaterThanOrEqual(1);
      expect(result.normalizedPayload.items[0]!.headline).toBe("AGI headline");
    }
  });
});

describe("Protezione Civile RSS adapter", () => {
  const protezioneRss = minimalRss.replace("ANSA headline", "Protezione Civile alert").replace("ansa.it", "protezionecivile.gov.it");
  beforeEach(() => {
    vi.stubGlobal(
      "fetch",
      vi.fn(() =>
        Promise.resolve({
          ok: true,
          status: 200,
          headers: new Headers({ "content-type": "application/rss+xml" }),
          text: () => Promise.resolve(protezioneRss),
          json: () => Promise.reject(new Error("not json")),
        } as Response),
      ),
    );
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("happy path: run with catalog entry protezione-civile-rss returns normalized payload", async () => {
    const entry = discoverySourceRegistry.getByKey("protezione-civile-rss");
    expect(entry).toBeDefined();
    const def = catalogEntryToSourceDefinition(entry!);
    const request = createDiscoveryFetchRequest({
      sourceDefinition: def,
      requestedAt: createTimestamp(new Date().toISOString()),
      cursorNullable: null,
    });
    const adapter = getAdapterByKey("protezione-civile-rss")!;
    const result = await runConnectorWithNormalize(request, adapter.connector, adapter.normalizer);
    expect(result.outcome).toBe("success");
    if (result.outcome === "success") {
      expect(result.itemCount).toBeGreaterThanOrEqual(1);
      expect(result.normalizedPayload.items[0]!.headline).toContain("Protezione Civile");
    }
  });
});

describe("Gazzetta Ufficiale adapter", () => {
  const gazzettaRss = minimalRss.replace("ANSA headline", "Gazzetta normativa").replace("ansa.it", "gazzettaufficiale.it");
  beforeEach(() => {
    vi.stubGlobal(
      "fetch",
      vi.fn(() =>
        Promise.resolve({
          ok: true,
          status: 200,
          headers: new Headers({ "content-type": "application/rss+xml" }),
          text: () => Promise.resolve(gazzettaRss),
          json: () => Promise.reject(new Error("not json")),
        } as Response),
      ),
    );
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("minimal behavior: run with catalog entry gazzetta-ufficiale returns normalized payload", async () => {
    const entry = discoverySourceRegistry.getByKey("gazzetta-ufficiale");
    expect(entry).toBeDefined();
    const def = catalogEntryToSourceDefinition(entry!);
    const request = createDiscoveryFetchRequest({
      sourceDefinition: def,
      requestedAt: createTimestamp(new Date().toISOString()),
      cursorNullable: null,
    });
    const adapter = getAdapterByKey("gazzetta-ufficiale")!;
    const result = await runConnectorWithNormalize(request, adapter.connector, adapter.normalizer);
    expect(result.outcome).toBe("success");
    if (result.outcome === "success") {
      expect(result.itemCount).toBeGreaterThanOrEqual(1);
      expect(String(result.normalizedPayload.sourceId)).toBe(String(def.id));
    }
  });
});

describe("ISTAT adapter – normalization behavior", () => {
  const istatDef = createDiscoverySourceDefinition({
    id: createDiscoverySourceId("dsrc_istat_sdmx"),
    key: createDiscoverySourceKey("istat-sdmx"),
    kind: DiscoverySourceKind.API,
    tier: DiscoverySourceTier.PRIMARY,
    status: DiscoverySourceStatus.ENABLED,
    pollingHint: DiscoveryPollingHint.INTERVAL,
    geoScope: DiscoveryGeoScope.IT,
    topicScope: DiscoveryTopicScope.FINANCE,
    trustTier: DiscoveryTrustTier.VERIFIED,
    endpoint: createDiscoverySourceEndpoint({ url: "https://api.istat.it", method: "GET", headersNullable: null }),
    authMode: DiscoverySourceAuthMode.NONE,
    sourceDefinitionIdNullable: null,
  });

  it("normalizes structured ISTAT-like JSON to NormalizedDiscoveryPayload", () => {
    const payload = createDiscoveryFetchedPayload({
      raw: {
        dataset: [
          { id: "DS1", title: "PIL Italia", link: "https://www.istat.it/dataset/pil", lastUpdate: "2026-03-01T00:00:00.000Z" },
          { id: "DS2", label: "Occupazione", url: "https://www.istat.it/dataset/occ", date: "2026-02-15T00:00:00.000Z" },
        ],
      },
      transportMetadata: createDiscoveryTransportMetadata({
        contentType: DiscoveryContentType.APPLICATION_JSON,
        fetchedAt: createTimestamp("2026-03-10T12:00:00.000Z"),
        statusCodeNullable: 200,
        etagNullable: null,
      }),
    });
    const normalized = istatNormalizationAdapter.normalize(payload, {
      sourceDefinition: istatDef,
      runIdNullable: null,
    });
    expect(normalized.items).toHaveLength(2);
    expect(normalized.items[0]!.headline).toBe("PIL Italia");
    expect(normalized.items[0]!.canonicalUrl).toBe("https://www.istat.it/dataset/pil");
    expect(normalized.items[1]!.headline).toBe("Occupazione");
    expect(normalized.sourceId).toBe(istatDef.id);
  });

  it("throws on empty or missing items array", () => {
    const emptyPayload = createDiscoveryFetchedPayload({
      raw: { dataset: [] },
      transportMetadata: createDiscoveryTransportMetadata({
        contentType: DiscoveryContentType.APPLICATION_JSON,
        fetchedAt: createTimestamp("2026-03-10T12:00:00.000Z"),
        statusCodeNullable: 200,
        etagNullable: null,
      }),
    });
    expect(() =>
      istatNormalizationAdapter.normalize(emptyPayload, { sourceDefinition: istatDef, runIdNullable: null }),
    ).toThrow(/No items to normalize/);
  });
});

describe("INGV adapter – normalization behavior", () => {
  const ingvDef = createDiscoverySourceDefinition({
    id: createDiscoverySourceId("dsrc_ingv_terremoti"),
    key: createDiscoverySourceKey("ingv-terremoti"),
    kind: DiscoverySourceKind.API,
    tier: DiscoverySourceTier.PRIMARY,
    status: DiscoverySourceStatus.ENABLED,
    pollingHint: DiscoveryPollingHint.INTERVAL,
    geoScope: DiscoveryGeoScope.IT,
    topicScope: DiscoveryTopicScope.GENERAL,
    trustTier: DiscoveryTrustTier.VERIFIED,
    endpoint: createDiscoverySourceEndpoint({ url: "https://webservices.ingv.it", method: "GET", headersNullable: null }),
    authMode: DiscoverySourceAuthMode.NONE,
    sourceDefinitionIdNullable: null,
  });

  it("normalizes INGV earthquake-like JSON to NormalizedDiscoveryPayload", () => {
    const payload = createDiscoveryFetchedPayload({
      raw: {
        events: [
          { id: "ev1", time: "2026-03-10T10:00:00.000Z", mag: 3.5, place: "3 km N Roma" },
          { id: "ev2", time: "2026-03-09T14:00:00.000Z", magnitude: 2.1, place: "5 km S Milano" },
        ],
      },
      transportMetadata: createDiscoveryTransportMetadata({
        contentType: DiscoveryContentType.APPLICATION_JSON,
        fetchedAt: createTimestamp("2026-03-10T12:00:00.000Z"),
        statusCodeNullable: 200,
        etagNullable: null,
      }),
    });
    const normalized = ingvNormalizationAdapter.normalize(payload, {
      sourceDefinition: ingvDef,
      runIdNullable: null,
    });
    expect(normalized.items).toHaveLength(2);
    expect(normalized.items[0]!.headline).toContain("3.5");
    expect(normalized.items[0]!.headline).toContain("Roma");
    expect(normalized.items[0]!.geoPlaceTextNullable).toBe("3 km N Roma");
    expect(normalized.items[0]!.publishedAtPresent).toBe(true);
    expect(normalized.items[1]!.headline).toContain("2.1");
    expect(normalized.items[1]!.headline).toContain("Milano");
    expect(normalized.items[1]!.geoPlaceTextNullable).toBe("5 km S Milano");
    expect(normalized.sourceId).toBe(ingvDef.id);
  });

  it("throws on empty or missing events array", () => {
    const emptyPayload = createDiscoveryFetchedPayload({
      raw: { events: [] },
      transportMetadata: createDiscoveryTransportMetadata({
        contentType: DiscoveryContentType.APPLICATION_JSON,
        fetchedAt: createTimestamp("2026-03-10T12:00:00.000Z"),
        statusCodeNullable: 200,
        etagNullable: null,
      }),
    });
    expect(() =>
      ingvNormalizationAdapter.normalize(emptyPayload, { sourceDefinition: ingvDef, runIdNullable: null }),
    ).toThrow(/No items to normalize/);
  });
});

describe("Wikimedia Pageviews adapter", () => {
  const wikimediaDef = createDiscoverySourceDefinition({
    id: createDiscoverySourceId("dsrc_wikimedia_pageviews"),
    key: createDiscoverySourceKey("wikimedia-pageviews"),
    kind: DiscoverySourceKind.API,
    tier: DiscoverySourceTier.SECONDARY,
    status: DiscoverySourceStatus.ENABLED,
    pollingHint: DiscoveryPollingHint.INTERVAL,
    geoScope: DiscoveryGeoScope.GLOBAL,
    topicScope: DiscoveryTopicScope.GENERAL,
    trustTier: DiscoveryTrustTier.CURATED,
    endpoint: createDiscoverySourceEndpoint({
      url: "https://wikimedia.org/api/rest_v1/metrics/pageviews/per-article/en.wikipedia/all-access/all-agents/Italy/daily/20260101/20260102",
      method: "GET",
      headersNullable: null,
    }),
    authMode: DiscoverySourceAuthMode.NONE,
    sourceDefinitionIdNullable: null,
  });

  it("happy path: normalizes Wikimedia pageviews JSON to NormalizedDiscoveryPayload", () => {
    const payload = createDiscoveryFetchedPayload({
      raw: {
        items: [
          { project: "en.wikipedia", article: "Italy", timestamp: "2026010100", views: 13441 },
          { project: "en.wikipedia", article: "Rome", timestamp: "2026010200", views: 8200 },
        ],
      },
      transportMetadata: createDiscoveryTransportMetadata({
        contentType: DiscoveryContentType.APPLICATION_JSON,
        fetchedAt: createTimestamp("2026-03-10T12:00:00.000Z"),
        statusCodeNullable: 200,
        etagNullable: null,
      }),
    });
    const normalized = wikimediaPageviewsNormalizationAdapter.normalize(payload, {
      sourceDefinition: wikimediaDef,
      runIdNullable: null,
    });
    expect(normalized.items).toHaveLength(2);
    expect(normalized.items[0]!.headline).toBe("Italy");
    expect(normalized.items[0]!.canonicalUrl).toContain("wikipedia.org/wiki/Italy");
    expect(normalized.items[0]!.bodySnippetNullable).toBeNull();
    expect(normalized.items[0]!.observedMetricsNullable).toEqual({ pageviewsNullable: 13441 });
    expect(normalized.items[1]!.headline).toBe("Rome");
    expect(normalized.sourceId).toBe(wikimediaDef.id);
    expect(normalized.provenanceMetadata.sourceKey).toBe(wikimediaDef.key);
    expect(normalized.provenanceMetadata.sourceTier).toBe(DiscoverySourceTier.SECONDARY);
    expect(normalized.provenanceMetadata.trustTier).toBe(DiscoveryTrustTier.CURATED);
  });

  it("runConnectorWithNormalize returns success for valid Wikimedia fixture", async () => {
    const fixture = {
      items: [
        { project: "en.wikipedia", article: "Italy", timestamp: "2026010100", views: 13441 },
      ],
    };
    vi.stubGlobal(
      "fetch",
      vi.fn(() =>
        Promise.resolve({
          ok: true,
          status: 200,
          headers: new Headers({ "content-type": "application/json" }),
          json: () => Promise.resolve(fixture),
          text: () => Promise.reject(new Error("not text")),
        } as Response),
      ),
    );
    const entry = discoverySourceRegistry.getByKey("wikimedia-pageviews");
    expect(entry).toBeDefined();
    const def = catalogEntryToSourceDefinition(entry!);
    const request = createDiscoveryFetchRequest({
      sourceDefinition: def,
      requestedAt: createTimestamp(new Date().toISOString()),
      cursorNullable: null,
    });
    const adapter = getAdapterByKey("wikimedia-pageviews")!;
    const result = await runConnectorWithNormalize(request, adapter.connector, adapter.normalizer);
    expect(result.outcome).toBe("success");
    if (result.outcome === "success") {
      expect(result.itemCount).toBe(1);
      expect(result.normalizedPayload.items[0]!.headline).toBe("Italy");
      expect(result.normalizedPayload.items[0]!.canonicalUrl).toContain("wikipedia.org");
    }
    vi.unstubAllGlobals();
  });

  it("throws on empty or missing items array", () => {
    const emptyPayload = createDiscoveryFetchedPayload({
      raw: { items: [] },
      transportMetadata: createDiscoveryTransportMetadata({
        contentType: DiscoveryContentType.APPLICATION_JSON,
        fetchedAt: createTimestamp("2026-03-10T12:00:00.000Z"),
        statusCodeNullable: 200,
        etagNullable: null,
      }),
    });
    expect(() =>
      wikimediaPageviewsNormalizationAdapter.normalize(emptyPayload, {
        sourceDefinition: wikimediaDef,
        runIdNullable: null,
      }),
    ).toThrow(/No items to normalize/);
  });
});

describe("YouTube Data API (Italy) adapter", () => {
  const youtubeDef = createDiscoverySourceDefinition({
    id: createDiscoverySourceId("dsrc_youtube_data_it"),
    key: createDiscoverySourceKey("youtube-data-it"),
    kind: DiscoverySourceKind.API,
    tier: DiscoverySourceTier.SECONDARY,
    status: DiscoverySourceStatus.ENABLED,
    pollingHint: DiscoveryPollingHint.INTERVAL,
    geoScope: DiscoveryGeoScope.IT,
    topicScope: DiscoveryTopicScope.GENERAL,
    trustTier: DiscoveryTrustTier.CURATED,
    endpoint: createDiscoverySourceEndpoint({
      url: "https://www.googleapis.com/youtube/v3/search?part=snippet&regionCode=IT",
      method: "GET",
      headersNullable: null,
    }),
    authMode: DiscoverySourceAuthMode.NONE,
    sourceDefinitionIdNullable: null,
  });

  it("happy path: normalizes YouTube search/list JSON to NormalizedDiscoveryPayload", () => {
    const payload = createDiscoveryFetchedPayload({
      raw: {
        items: [
          {
            id: { kind: "youtube#video", videoId: "abc123" },
            snippet: {
              title: "Test Video Italy",
              publishedAt: "2026-03-01T10:00:00Z",
              channelTitle: "Test Channel",
              description: "Short desc",
            },
          },
        ],
      },
      transportMetadata: createDiscoveryTransportMetadata({
        contentType: DiscoveryContentType.APPLICATION_JSON,
        fetchedAt: createTimestamp("2026-03-10T12:00:00.000Z"),
        statusCodeNullable: 200,
        etagNullable: null,
      }),
    });
    const normalized = youtubeDataItNormalizationAdapter.normalize(payload, {
      sourceDefinition: youtubeDef,
      runIdNullable: null,
    });
    expect(normalized.items).toHaveLength(1);
    expect(normalized.items[0]!.headline).toBe("Test Video Italy");
    expect(normalized.items[0]!.canonicalUrl).toBe("https://www.youtube.com/watch?v=abc123");
    expect(normalized.items[0]!.externalItemId).toBe("abc123");
    expect(normalized.sourceId).toBe(youtubeDef.id);
  });

  it("runConnectorWithNormalize returns success for valid YouTube fixture", async () => {
    const fixture = {
      items: [
        {
          id: { videoId: "xyz789" },
          snippet: { title: "Italy News", publishedAt: "2026-03-09T08:00:00Z" },
        },
      ],
    };
    vi.stubGlobal(
      "fetch",
      vi.fn(() =>
        Promise.resolve({
          ok: true,
          status: 200,
          headers: new Headers({ "content-type": "application/json" }),
          json: () => Promise.resolve(fixture),
          text: () => Promise.reject(new Error("not text")),
        } as Response),
      ),
    );
    const entry = discoverySourceRegistry.getByKey("youtube-data-it");
    expect(entry).toBeDefined();
    const def = catalogEntryToSourceDefinition(entry!);
    const request = createDiscoveryFetchRequest({
      sourceDefinition: def,
      requestedAt: createTimestamp(new Date().toISOString()),
      cursorNullable: null,
    });
    const adapter = getAdapterByKey("youtube-data-it")!;
    const result = await runConnectorWithNormalize(request, adapter.connector, adapter.normalizer);
    expect(result.outcome).toBe("success");
    if (result.outcome === "success") {
      expect(result.itemCount).toBe(1);
      expect(result.normalizedPayload.items[0]!.headline).toBe("Italy News");
      expect(result.normalizedPayload.items[0]!.canonicalUrl).toBe("https://www.youtube.com/watch?v=xyz789");
    }
    vi.unstubAllGlobals();
  });

  it("throws on empty or missing items array", () => {
    const emptyPayload = createDiscoveryFetchedPayload({
      raw: { items: [] },
      transportMetadata: createDiscoveryTransportMetadata({
        contentType: DiscoveryContentType.APPLICATION_JSON,
        fetchedAt: createTimestamp("2026-03-10T12:00:00.000Z"),
        statusCodeNullable: 200,
        etagNullable: null,
      }),
    });
    expect(() =>
      youtubeDataItNormalizationAdapter.normalize(emptyPayload, {
        sourceDefinition: youtubeDef,
        runIdNullable: null,
      }),
    ).toThrow(/No items to normalize/);
  });
});

describe("Google Trends Italy adapter (experimental)", () => {
  const googleTrendsDef = createDiscoverySourceDefinition({
    id: createDiscoverySourceId("dsrc_google_trends_it"),
    key: createDiscoverySourceKey("google-trends-it"),
    kind: DiscoverySourceKind.API,
    tier: DiscoverySourceTier.EXPERIMENTAL,
    status: DiscoverySourceStatus.ENABLED,
    pollingHint: DiscoveryPollingHint.INTERVAL,
    geoScope: DiscoveryGeoScope.IT,
    topicScope: DiscoveryTopicScope.GENERAL,
    trustTier: DiscoveryTrustTier.UNVERIFIED,
    endpoint: createDiscoverySourceEndpoint({
      url: "https://config-driven/trends",
      method: "GET",
      headersNullable: null,
    }),
    authMode: DiscoverySourceAuthMode.NONE,
    sourceDefinitionIdNullable: null,
  });

  it("minimal happy path: normalizes trend queries JSON to NormalizedDiscoveryPayload", () => {
    const payload = createDiscoveryFetchedPayload({
      raw: {
        items: [
          { query: "elezioni Italia 2026", timeframe: "2026-03" },
          { query: "inflazione", region: "IT" },
        ],
      },
      transportMetadata: createDiscoveryTransportMetadata({
        contentType: DiscoveryContentType.APPLICATION_JSON,
        fetchedAt: createTimestamp("2026-03-10T12:00:00.000Z"),
        statusCodeNullable: 200,
        etagNullable: null,
      }),
    });
    const normalized = googleTrendsItNormalizationAdapter.normalize(payload, {
      sourceDefinition: googleTrendsDef,
      runIdNullable: null,
    });
    expect(normalized.items).toHaveLength(2);
    expect(normalized.items[0]!.headline).toBe("elezioni Italia 2026");
    expect(normalized.items[0]!.canonicalUrl).toContain("trends.google.com");
    expect(normalized.items[1]!.headline).toBe("inflazione");
    expect(normalized.sourceId).toBe(googleTrendsDef.id);
  });

  it("runConnectorWithNormalize returns success for valid Google Trends fixture", async () => {
    const fixture = { items: [{ query: "test trend" }] };
    vi.stubGlobal(
      "fetch",
      vi.fn(() =>
        Promise.resolve({
          ok: true,
          status: 200,
          headers: new Headers({ "content-type": "application/json" }),
          json: () => Promise.resolve(fixture),
          text: () => Promise.reject(new Error("not text")),
        } as Response),
      ),
    );
    const entry = discoverySourceRegistry.getByKey("google-trends-it");
    expect(entry).toBeDefined();
    const def = catalogEntryToSourceDefinition(entry!);
    const request = createDiscoveryFetchRequest({
      sourceDefinition: def,
      requestedAt: createTimestamp(new Date().toISOString()),
      cursorNullable: null,
    });
    const adapter = getAdapterByKey("google-trends-it")!;
    const result = await runConnectorWithNormalize(request, adapter.connector, adapter.normalizer);
    expect(result.outcome).toBe("success");
    if (result.outcome === "success") {
      expect(result.itemCount).toBe(1);
      expect(result.normalizedPayload.items[0]!.headline).toBe("test trend");
    }
    vi.unstubAllGlobals();
  });

  it("optional/degraded: throws on empty payload", () => {
    const emptyPayload = createDiscoveryFetchedPayload({
      raw: {},
      transportMetadata: createDiscoveryTransportMetadata({
        contentType: DiscoveryContentType.APPLICATION_JSON,
        fetchedAt: createTimestamp("2026-03-10T12:00:00.000Z"),
        statusCodeNullable: 200,
        etagNullable: null,
      }),
    });
    expect(() =>
      googleTrendsItNormalizationAdapter.normalize(emptyPayload, {
        sourceDefinition: googleTrendsDef,
        runIdNullable: null,
      }),
    ).toThrow(/No items to normalize/);
  });

  it("optional/degraded: throws on empty items array", () => {
    const emptyPayload = createDiscoveryFetchedPayload({
      raw: { items: [] },
      transportMetadata: createDiscoveryTransportMetadata({
        contentType: DiscoveryContentType.APPLICATION_JSON,
        fetchedAt: createTimestamp("2026-03-10T12:00:00.000Z"),
        statusCodeNullable: 200,
        etagNullable: null,
      }),
    });
    expect(() =>
      googleTrendsItNormalizationAdapter.normalize(emptyPayload, {
        sourceDefinition: googleTrendsDef,
        runIdNullable: null,
      }),
    ).toThrow(/No items to normalize/);
  });
});

describe("Source adapters – malformed/empty handling", () => {
  it("ANSA adapter: runConnectorWithNormalize returns unsupported_shape or parse_failure for empty feed", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn((url: string) => {
        if (url.includes("ansa") || url.includes("config-driven")) {
          return Promise.resolve({
            ok: true,
            status: 200,
            headers: new Headers({ "content-type": "application/rss+xml" }),
            text: () => Promise.resolve(emptyRss),
            json: () => Promise.reject(new Error("not json")),
          } as Response);
        }
        return Promise.reject(new Error("unknown"));
      }),
    );
    const entry = discoverySourceRegistry.getByKey("ansa-rss");
    const def = catalogEntryToSourceDefinition(entry!);
    const request = createDiscoveryFetchRequest({
      sourceDefinition: def,
      requestedAt: createTimestamp(new Date().toISOString()),
      cursorNullable: null,
    });
    const adapter = getAdapterByKey("ansa-rss")!;
    const result = await runConnectorWithNormalize(request, adapter.connector, adapter.normalizer);
    expect(result.outcome === "unsupported_shape" || result.outcome === "parse_failure").toBe(true);
    vi.unstubAllGlobals();
  });

  it("ANSA adapter: runConnectorWithNormalize returns parse_failure for malformed XML", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(() =>
        Promise.resolve({
          ok: true,
          status: 200,
          headers: new Headers({ "content-type": "application/xml" }),
          text: () => Promise.resolve(malformedXml),
          json: () => Promise.reject(new Error("not json")),
        } as Response),
      ),
    );
    const entry = discoverySourceRegistry.getByKey("ansa-rss");
    const def = catalogEntryToSourceDefinition(entry!);
    const request = createDiscoveryFetchRequest({
      sourceDefinition: def,
      requestedAt: createTimestamp(new Date().toISOString()),
      cursorNullable: null,
    });
    const adapter = getAdapterByKey("ansa-rss")!;
    const result = await runConnectorWithNormalize(request, adapter.connector, adapter.normalizer);
    expect(result.outcome).toBe("fetch_failure");
    if (result.outcome === "fetch_failure") {
      expect(result.failure.code).toBe("PARSE_FAILURE");
    }
    vi.unstubAllGlobals();
  });
});
