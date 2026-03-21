/**
 * Resolves discovery source endpoints from env and defaults.
 * Replaces placeholder "https://config-driven" with real URLs so the lead supplier can fetch.
 * Does not modify foundation-layer catalog; only patches the source definition at runtime.
 */

import type { DiscoverySourceCatalogEntry, DiscoverySourceDefinition } from "@market-design-engine/foundation-layer";
import {
  catalogEntryToSourceDefinition,
  createDiscoverySourceEndpoint,
} from "@market-design-engine/foundation-layer";

const PLACEHOLDER_URL = "https://config-driven";

function envUrl(key: string): string | undefined {
  const envKey = `DISCOVERY_${key.replace(/-/g, "_").toUpperCase()}_URL`;
  const v = process.env[envKey];
  return typeof v === "string" && v.trim() ? v.trim() : undefined;
}

/** Default URLs when env is not set (public feeds/APIs). */
const DEFAULT_URLS: Record<string, string> = {
  "protezione-civile-rss":
    "https://dpc-web-api.protezionecivile.gov.it/rss/dpcPortalGenerateRss?categoria=notizia",
  "agi-rss": "https://www.agi.it/cronaca/rss",
  "ingv-terremoti":
    "https://webservices.ingv.it/fdsnws/event/1/query?format=json&limit=50",
  "wikimedia-pageviews":
    "https://wikimedia.org/api/rest_v1/metrics/pageviews/top-per-country/it.wikipedia/all-access/2024/01/all-days",
  "istat-sdmx":
    "https://esploradati.istat.it/SDMXWS/rest/data/22_289?lastNObservations=15",
};

/**
 * Returns a source definition with endpoint resolved from env or defaults.
 * If the catalog endpoint is already a real URL (not placeholder), it is kept unless env overrides.
 */
export function getResolvedSourceDefinition(
  entry: DiscoverySourceCatalogEntry
): DiscoverySourceDefinition {
  const definition = catalogEntryToSourceDefinition(entry);
  const key = String(entry.key);
  const catalogUrl = definition.endpoint.url;

  const isPlaceholder = catalogUrl === PLACEHOLDER_URL;
  const envOverride = envUrl(key);

  if (envOverride) {
    return {
      ...definition,
      endpoint: createDiscoverySourceEndpoint({
        url: envOverride,
        method: definition.endpoint.method,
        headersNullable: definition.endpoint.headersNullable,
      }),
    };
  }

  if (isPlaceholder && DEFAULT_URLS[key]) {
    const url = DEFAULT_URLS[key]!;
    const headersNullable =
      key === "istat-sdmx"
        ? { Accept: "application/vnd.sdmx.data+json;version=1.0.0" }
        : definition.endpoint.headersNullable;
    return {
      ...definition,
      endpoint: createDiscoverySourceEndpoint({
        url,
        method: definition.endpoint.method,
        headersNullable,
      }),
    };
  }

  if (key === "youtube-data-it") {
    const apiKey = process.env.YOUTUBE_API_KEY?.trim();
    if (apiKey) {
      const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&regionCode=IT&maxResults=25&key=${encodeURIComponent(apiKey)}`;
      return {
        ...definition,
        endpoint: createDiscoverySourceEndpoint({
          url,
          method: "GET",
          headersNullable: null,
        }),
      };
    }
  }

  if (key === "google-trends-it") {
    const url = envUrl("google-trends-it");
    if (url) {
      const apiKey = process.env.GOOGLE_TRENDS_API_KEY?.trim();
      const finalUrl = apiKey ? `${url}${url.includes("?") ? "&" : "?"}key=${encodeURIComponent(apiKey)}` : url;
      return {
        ...definition,
        endpoint: createDiscoverySourceEndpoint({
          url: finalUrl,
          method: "GET",
          headersNullable: null,
        }),
      };
    }
  }

  return definition;
}
