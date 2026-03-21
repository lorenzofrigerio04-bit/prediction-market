import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import {
  jsonApiConnector,
  jsonApiNormalizationAdapter,
  runConnectorWithNormalize,
  normalizeJsonApiPayload,
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

const apiSourceDefinition = createDiscoverySourceDefinition({
  id: createDiscoverySourceId("dsrc_api001"),
  key: createDiscoverySourceKey("api-test"),
  kind: DiscoverySourceKind.API,
  tier: DiscoverySourceTier.PRIMARY,
  status: DiscoverySourceStatus.ENABLED,
  pollingHint: DiscoveryPollingHint.INTERVAL,
  geoScope: DiscoveryGeoScope.IT,
  topicScope: DiscoveryTopicScope.GENERAL,
  trustTier: DiscoveryTrustTier.CURATED,
  endpoint: createDiscoverySourceEndpoint({
    url: "https://api.example.com/items",
    method: "GET",
    headersNullable: null,
  }),
  authMode: DiscoverySourceAuthMode.NONE,
  sourceDefinitionIdNullable: null,
});

describe("jsonApiConnector", () => {
  beforeEach(() => {
    vi.stubGlobal(
      "fetch",
      vi.fn((url: string) => {
        if (url.includes("items")) {
          return Promise.resolve({
            ok: true,
            status: 200,
            headers: new Headers({ "content-type": "application/json" }),
            text: () =>
              Promise.resolve(
                JSON.stringify({
                  articles: [
                    {
                      title: "API title",
                      url: "https://example.com/api/1",
                      publishedAt: "2026-03-10T12:00:00.000Z",
                    },
                  ],
                }),
              ),
            json: () =>
              Promise.resolve({
                articles: [
                  {
                    title: "API title",
                    url: "https://example.com/api/1",
                    publishedAt: "2026-03-10T12:00:00.000Z",
                  },
                ],
              }),
          } as Response);
        }
        if (url.includes("empty")) {
          return Promise.resolve({
            ok: true,
            status: 200,
            headers: new Headers({ "content-type": "application/json" }),
            json: () => Promise.resolve({}),
          } as Response);
        }
        if (url.includes("malformed")) {
          return Promise.resolve({
            ok: true,
            status: 200,
            headers: new Headers({ "content-type": "application/json" }),
            text: () => Promise.resolve("not json {{{"),
            json: () => Promise.reject(new SyntaxError("Unexpected token")),
          } as Response);
        }
        return Promise.reject(new Error("unknown url"));
      }),
    );
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("canHandle returns true for API kind", () => {
    expect(jsonApiConnector.canHandle(apiSourceDefinition)).toBe(true);
  });

  it("canHandle returns false for RSS kind", () => {
    const rssDef = createDiscoverySourceDefinition({
      ...apiSourceDefinition,
      kind: DiscoverySourceKind.RSS,
      key: createDiscoverySourceKey("rss-other"),
    });
    expect(jsonApiConnector.canHandle(rssDef)).toBe(false);
  });

  it("fetch returns payload for valid JSON with articles array", async () => {
    const request = createDiscoveryFetchRequest({
      sourceDefinition: apiSourceDefinition,
      requestedAt: createTimestamp(new Date().toISOString()),
      cursorNullable: null,
    });
    const response = await jsonApiConnector.fetch(request);
    expect(response.ok).toBe(true);
    if (response.ok) {
      expect(response.payload.raw).toHaveProperty("articles");
      const articles = (response.payload.raw as { articles: unknown[] }).articles;
      expect(articles).toHaveLength(1);
      expect(articles[0]).toMatchObject({ title: "API title", url: "https://example.com/api/1" });
    }
  });

  it("runConnectorWithNormalize returns success with normalized items", async () => {
    const request = createDiscoveryFetchRequest({
      sourceDefinition: apiSourceDefinition,
      requestedAt: createTimestamp(new Date().toISOString()),
      cursorNullable: null,
    });
    const result = await runConnectorWithNormalize(
      request,
      jsonApiConnector,
      jsonApiNormalizationAdapter,
    );
    expect(result.outcome).toBe("success");
    if (result.outcome === "success") {
      expect(result.itemCount).toBe(1);
      expect(result.normalizedPayload.items[0]!.headline).toBe("API title");
      expect(result.normalizedPayload.items[0]!.canonicalUrl).toBe("https://example.com/api/1");
    }
  });
});

describe("json-api normalizer", () => {
  it("normalizeJsonApiPayload produces NormalizedDiscoveryPayload from raw with items key", () => {
    const fetchedAt = "2026-03-10T12:00:00.000Z";
    const payload = createDiscoveryFetchedPayload({
      raw: {
        items: [
          {
            title: "J1",
            url: "https://j.com/1",
            publishedAt: "2026-03-10T12:00:00.000Z",
          },
        ],
      },
      transportMetadata: createDiscoveryTransportMetadata({
        contentType: DiscoveryContentType.APPLICATION_JSON,
        fetchedAt: createTimestamp(fetchedAt),
        statusCodeNullable: 200,
        etagNullable: null,
      }),
    });
    const normalized = normalizeJsonApiPayload(payload, {
      sourceDefinition: apiSourceDefinition,
      runIdNullable: null,
    });
    expect(normalized.items).toHaveLength(1);
    expect(normalized.items[0]!.headline).toBe("J1");
    expect(normalized.items[0]!.canonicalUrl).toBe("https://j.com/1");
  });

  it("normalizeJsonApiPayload throws when raw has no items array", () => {
    const payload = createDiscoveryFetchedPayload({
      raw: { other: "data" },
      transportMetadata: createDiscoveryTransportMetadata({
        contentType: DiscoveryContentType.APPLICATION_JSON,
        fetchedAt: createTimestamp("2026-03-10T12:00:00.000Z"),
        statusCodeNullable: 200,
        etagNullable: null,
      }),
    });
    expect(() =>
      normalizeJsonApiPayload(payload, {
        sourceDefinition: apiSourceDefinition,
        runIdNullable: null,
      }),
    ).toThrow(/no supported items array|empty/);
  });

  it("normalizeJsonApiPayload skips records without headline and url", () => {
    const payload = createDiscoveryFetchedPayload({
      raw: {
        items: [
          { title: "Valid", url: "https://v.com/1" },
          { title: "No URL" },
          { url: "https://v.com/3" },
        ],
      },
      transportMetadata: createDiscoveryTransportMetadata({
        contentType: DiscoveryContentType.APPLICATION_JSON,
        fetchedAt: createTimestamp("2026-03-10T12:00:00.000Z"),
        statusCodeNullable: 200,
        etagNullable: null,
      }),
    });
    const normalized = normalizeJsonApiPayload(payload, {
      sourceDefinition: apiSourceDefinition,
      runIdNullable: null,
    });
    expect(normalized.items).toHaveLength(1);
    expect(normalized.items[0]!.headline).toBe("Valid");
  });
});
