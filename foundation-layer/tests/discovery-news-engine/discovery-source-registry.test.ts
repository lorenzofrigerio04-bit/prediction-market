import { describe, expect, it } from "vitest";
import {
  createDiscoverySourceId,
  createDiscoverySourceKey,
  createDiscoverySourceCatalogEntry,
  catalogEntryToSourceDefinition,
  validateDiscoverySourceCatalogEntry,
  createDiscoverySourceRegistry,
  discoverySourceRegistry,
  INITIAL_DISCOVERY_SOURCE_CATALOG,
  DiscoverySourceKind,
  DiscoverySourceTier,
  DiscoverySourceStatus,
  DiscoverySourceUsageRole,
  DiscoverySourceCapability,
  DiscoveryGeoScope,
  DiscoveryTopicScope,
  DiscoveryTrustTier,
  DiscoveryPollingHint,
  DiscoverySourceAuthMode,
} from "../../src/discovery-news-engine/index.js";
import { createDiscoverySourceEndpoint } from "../../src/discovery-news-engine/entities/discovery-source-endpoint.entity.js";
import { createDiscoveryScheduleHint } from "../../src/discovery-news-engine/value-objects/discovery-schedule-hint.vo.js";

const EXPECTED_INITIAL_KEYS = [
  "protezione-civile-rss",
  "istat-sdmx",
  "ingv-terremoti",
  "gazzetta-ufficiale",
  "ansa-rss",
  "agi-rss",
  "wikimedia-pageviews",
  "youtube-data-it",
  "google-trends-it",
  "direct-article-fetch",
  "apify-actor-extraction",
];

describe("Discovery Source Registry", () => {
  describe("valid catalog entry", () => {
    it("builds and validates DiscoverySourceCatalogEntry with all required fields", () => {
      const entry = createDiscoverySourceCatalogEntry({
        id: createDiscoverySourceId("dsrc_test001"),
        key: createDiscoverySourceKey("test-source"),
        name: "Test Source",
        kind: DiscoverySourceKind.RSS,
        tier: DiscoverySourceTier.PRIMARY,
        status: DiscoverySourceStatus.ENABLED,
        role: DiscoverySourceUsageRole.EDITORIAL,
        pollingHint: DiscoveryPollingHint.INTERVAL,
        geoScope: DiscoveryGeoScope.IT,
        topicScope: DiscoveryTopicScope.GENERAL,
        trustTier: DiscoveryTrustTier.CURATED,
        endpoint: createDiscoverySourceEndpoint({
          url: "https://example.com/feed",
          method: "GET",
          headersNullable: null,
        }),
        authMode: DiscoverySourceAuthMode.NONE,
        sourceDefinitionIdNullable: null,
        scheduleHint: createDiscoveryScheduleHint({
          cronExpressionNullable: null,
          intervalSecondsNullable: 3600,
        }),
        descriptionNullable: "A test source.",
        capabilities: [DiscoverySourceCapability.DISCOVERY],
      });
      const report = validateDiscoverySourceCatalogEntry(entry);
      expect(report.isValid).toBe(true);
      expect(report.issues).toHaveLength(0);
    });

    it("catalogEntryToSourceDefinition produces valid DiscoverySourceDefinition shape", () => {
      const entry = createDiscoverySourceCatalogEntry({
        id: createDiscoverySourceId("dsrc_conv001"),
        key: createDiscoverySourceKey("conv-source"),
        name: "Conversion Test",
        kind: DiscoverySourceKind.API,
        tier: DiscoverySourceTier.SECONDARY,
        status: DiscoverySourceStatus.ENABLED,
        role: DiscoverySourceUsageRole.ATTENTION,
        pollingHint: DiscoveryPollingHint.ON_DEMAND,
        geoScope: DiscoveryGeoScope.GLOBAL,
        topicScope: DiscoveryTopicScope.FINANCE,
        trustTier: DiscoveryTrustTier.UNVERIFIED,
        endpoint: createDiscoverySourceEndpoint({
          url: "https://api.example.com",
          method: "GET",
          headersNullable: null,
        }),
        authMode: DiscoverySourceAuthMode.NONE,
        sourceDefinitionIdNullable: null,
        scheduleHint: createDiscoveryScheduleHint({
          cronExpressionNullable: null,
          intervalSecondsNullable: null,
        }),
        descriptionNullable: null,
        capabilities: [DiscoverySourceCapability.ENRICHMENT],
      });
      const def = catalogEntryToSourceDefinition(entry);
      expect(def.id).toBe(entry.id);
      expect(def.key).toBe(entry.key);
      expect(def.kind).toBe(entry.kind);
      expect(def.tier).toBe(entry.tier);
      expect(def.status).toBe(entry.status);
      expect(def.endpoint).toBe(entry.endpoint);
    });
  });

  describe("invalid catalog entry", () => {
    it("returns validation issues for empty name", () => {
      const validEntry = createDiscoverySourceCatalogEntry({
        id: createDiscoverySourceId("dsrc_bad001"),
        key: createDiscoverySourceKey("bad-entry"),
        name: "Valid Name",
        kind: DiscoverySourceKind.RSS,
        tier: DiscoverySourceTier.PRIMARY,
        status: DiscoverySourceStatus.ENABLED,
        role: DiscoverySourceUsageRole.FALLBACK,
        pollingHint: DiscoveryPollingHint.INTERVAL,
        geoScope: DiscoveryGeoScope.IT,
        topicScope: DiscoveryTopicScope.GENERAL,
        trustTier: DiscoveryTrustTier.UNVERIFIED,
        endpoint: createDiscoverySourceEndpoint({
          url: "https://example.com",
          method: "GET",
          headersNullable: null,
        }),
        authMode: DiscoverySourceAuthMode.NONE,
        sourceDefinitionIdNullable: null,
        scheduleHint: createDiscoveryScheduleHint({
          cronExpressionNullable: null,
          intervalSecondsNullable: 3600,
        }),
        descriptionNullable: null,
        capabilities: [],
      });
      const entryWithEmptyName = { ...validEntry, name: "   " };
      const report = validateDiscoverySourceCatalogEntry(
        entryWithEmptyName as typeof validEntry,
      );
      expect(report.isValid).toBe(false);
      expect(report.issues.some((i) => i.path.includes("name"))).toBe(true);
    });

    it("returns validation issues for invalid role (schema)", () => {
      const validEntry = createDiscoverySourceCatalogEntry({
        id: createDiscoverySourceId("dsrc_bad002"),
        key: createDiscoverySourceKey("bad-role"),
        name: "Bad Role",
        kind: DiscoverySourceKind.API,
        tier: DiscoverySourceTier.PRIMARY,
        status: DiscoverySourceStatus.ENABLED,
        role: DiscoverySourceUsageRole.AUTHORITATIVE,
        pollingHint: DiscoveryPollingHint.INTERVAL,
        geoScope: DiscoveryGeoScope.IT,
        topicScope: DiscoveryTopicScope.GENERAL,
        trustTier: DiscoveryTrustTier.VERIFIED,
        endpoint: createDiscoverySourceEndpoint({
          url: "https://example.com",
          method: "GET",
          headersNullable: null,
        }),
        authMode: DiscoverySourceAuthMode.NONE,
        sourceDefinitionIdNullable: null,
        scheduleHint: createDiscoveryScheduleHint({
          cronExpressionNullable: null,
          intervalSecondsNullable: 3600,
        }),
        descriptionNullable: null,
        capabilities: [DiscoverySourceCapability.DISCOVERY],
      });
      const entryWithInvalidRole = { ...validEntry, role: "invalid_role" };
      const report = validateDiscoverySourceCatalogEntry(
        entryWithInvalidRole as typeof validEntry,
      );
      expect(report.isValid).toBe(false);
    });
  });

  describe("registry integrity", () => {
    it("initial catalog has unique source keys", () => {
      const keys = INITIAL_DISCOVERY_SOURCE_CATALOG.map((e) => e.key as string);
      const unique = new Set(keys);
      expect(unique.size).toBe(keys.length);
    });

    it("registry getByKey returns entry for each initial key", () => {
      for (const key of EXPECTED_INITIAL_KEYS) {
        const entry = discoverySourceRegistry.getByKey(key);
        expect(entry).toBeDefined();
        expect(entry!.key as string).toBe(key);
      }
    });

    it("registry getAll returns all initial catalog entries", () => {
      const all = discoverySourceRegistry.getAll();
      expect(all.length).toBe(EXPECTED_INITIAL_KEYS.length);
    });

    it("presence of expected initial sources", () => {
      for (const key of EXPECTED_INITIAL_KEYS) {
        const entry = discoverySourceRegistry.getByKey(key);
        expect(entry, `Expected source "${key}" to exist in registry`).toBeDefined();
      }
    });
  });

  describe("role and tier consistency", () => {
    it("Google Trends entry is marked experimental", () => {
      const entry = discoverySourceRegistry.getByKey("google-trends-it");
      expect(entry).toBeDefined();
      expect(entry!.tier).toBe(DiscoverySourceTier.EXPERIMENTAL);
      expect(entry!.descriptionNullable ?? "").toMatch(/experimental/i);
    });

    it("Apify entry is marked fallback/enrichment", () => {
      const entry = discoverySourceRegistry.getByKey("apify-actor-extraction");
      expect(entry).toBeDefined();
      expect(entry!.role).toBe(DiscoverySourceUsageRole.FALLBACK);
      expect(entry!.descriptionNullable ?? "").toMatch(/fallback|enrichment/i);
      expect(entry!.capabilities).toContain(DiscoverySourceCapability.ENRICHMENT);
    });

    it("filter by role returns correct subsets", () => {
      const authoritative = discoverySourceRegistry.getByRole(
        DiscoverySourceUsageRole.AUTHORITATIVE,
      );
      expect(authoritative.length).toBe(4);
      const fallback = discoverySourceRegistry.getByRole(
        DiscoverySourceUsageRole.FALLBACK,
      );
      expect(fallback.length).toBe(2);
    });

    it("filter by tier returns correct subsets", () => {
      const experimental = discoverySourceRegistry.getByTier(
        DiscoverySourceTier.EXPERIMENTAL,
      );
      expect(experimental.length).toBe(1);
      const first = experimental[0];
      expect(first).toBeDefined();
      expect((first!.key as string) === "google-trends-it").toBe(true);
    });

    it("filter by geo scope returns Italian sources", () => {
      const itSources = discoverySourceRegistry.getByGeoScope(DiscoveryGeoScope.IT);
      expect(itSources.length).toBeGreaterThan(0);
    });

    it("filter by status returns enabled sources", () => {
      const enabled = discoverySourceRegistry.getByStatus(DiscoverySourceStatus.ENABLED);
      expect(enabled.length).toBe(INITIAL_DISCOVERY_SOURCE_CATALOG.length);
    });
  });

  describe("createDiscoverySourceRegistry", () => {
    it("builds registry from custom catalog", () => {
      const single = createDiscoverySourceCatalogEntry({
        id: createDiscoverySourceId("dsrc_custom1"),
        key: createDiscoverySourceKey("custom-one"),
        name: "Custom One",
        kind: DiscoverySourceKind.RSS,
        tier: DiscoverySourceTier.PRIMARY,
        status: DiscoverySourceStatus.ENABLED,
        role: DiscoverySourceUsageRole.EDITORIAL,
        pollingHint: DiscoveryPollingHint.INTERVAL,
        geoScope: DiscoveryGeoScope.IT,
        topicScope: DiscoveryTopicScope.GENERAL,
        trustTier: DiscoveryTrustTier.CURATED,
        endpoint: createDiscoverySourceEndpoint({
          url: "https://custom.example.com",
          method: "GET",
          headersNullable: null,
        }),
        authMode: DiscoverySourceAuthMode.NONE,
        sourceDefinitionIdNullable: null,
        scheduleHint: createDiscoveryScheduleHint({
          cronExpressionNullable: null,
          intervalSecondsNullable: 3600,
        }),
        descriptionNullable: null,
        capabilities: [DiscoverySourceCapability.DISCOVERY],
      });
      const reg = createDiscoverySourceRegistry([single]);
      expect(reg.getAll().length).toBe(1);
      expect(reg.getByKey("custom-one")).toBeDefined();
      expect(reg.getByRole(DiscoverySourceUsageRole.EDITORIAL).length).toBe(1);
    });
  });
});
