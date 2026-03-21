/**
 * Initial Discovery Source Catalog – Italian-first, globally extensible.
 * Endpoint URLs are config-driven placeholders where not committed.
 */

import { createDiscoverySourceEndpoint } from "../entities/discovery-source-endpoint.entity.js";
import { createDiscoverySourceCatalogEntry } from "../entities/discovery-source-catalog-entry.entity.js";
import { createDiscoveryScheduleHint } from "../value-objects/discovery-schedule-hint.vo.js";
import { createDiscoverySourceId } from "../value-objects/discovery-source-id.vo.js";
import { createDiscoverySourceKey } from "../value-objects/discovery-source-key.vo.js";
import { DiscoverySourceAuthMode } from "../enums/discovery-auth-mode.enum.js";
import { DiscoverySourceCapability } from "../enums/discovery-source-capability.enum.js";
import { DiscoveryGeoScope } from "../enums/discovery-geo-scope.enum.js";
import { DiscoverySourceKind } from "../enums/discovery-source-kind.enum.js";
import { DiscoveryPollingHint } from "../enums/discovery-polling-hint.enum.js";
import { DiscoverySourceStatus } from "../enums/discovery-source-status.enum.js";
import { DiscoverySourceTier } from "../enums/discovery-source-tier.enum.js";
import { DiscoveryTopicScope } from "../enums/discovery-topic-scope.enum.js";
import { DiscoveryTrustTier } from "../enums/discovery-trust-tier.enum.js";
import { DiscoverySourceUsageRole } from "../enums/discovery-source-usage-role.enum.js";

const PLACEHOLDER_ENDPOINT = createDiscoverySourceEndpoint({
  url: "https://config-driven",
  method: "GET",
  headersNullable: null,
});

const DEFAULT_SCHEDULE = createDiscoveryScheduleHint({
  cronExpressionNullable: null,
  intervalSecondsNullable: 3600,
});

function entry(
  key: string,
  name: string,
  role: DiscoverySourceUsageRole,
  tier: DiscoverySourceTier,
  trustTier: DiscoveryTrustTier,
  geoScope: DiscoveryGeoScope,
  topicScope: DiscoveryTopicScope,
  kind: DiscoverySourceKind,
  capabilities: DiscoverySourceCapability[],
  descriptionNullable: string | null,
  endpoint = PLACEHOLDER_ENDPOINT,
  status: DiscoverySourceStatus = DiscoverySourceStatus.ENABLED,
) {
  return createDiscoverySourceCatalogEntry({
    id: createDiscoverySourceId(`dsrc_${key.replace(/-/g, "_")}`),
    key: createDiscoverySourceKey(key),
    name,
    kind,
    tier,
    status,
    role,
    pollingHint: DiscoveryPollingHint.INTERVAL,
    geoScope,
    topicScope,
    trustTier,
    endpoint,
    authMode: DiscoverySourceAuthMode.NONE,
    sourceDefinitionIdNullable: null,
    scheduleHint: DEFAULT_SCHEDULE,
    descriptionNullable,
    capabilities,
  });
}

// Authoritative Italian
const protezioneCivileRss = entry(
  "protezione-civile-rss",
  "Protezione Civile RSS",
  DiscoverySourceUsageRole.AUTHORITATIVE,
  DiscoverySourceTier.PRIMARY,
  DiscoveryTrustTier.VERIFIED,
  DiscoveryGeoScope.IT,
  DiscoveryTopicScope.WEATHER_EMERGENCY,
  DiscoverySourceKind.RSS,
  [DiscoverySourceCapability.DISCOVERY],
  "Protezione Civile Italia – feed ufficiale. Endpoint from config.",
);

const istatSdmx = entry(
  "istat-sdmx",
  "ISTAT API / SDMX",
  DiscoverySourceUsageRole.AUTHORITATIVE,
  DiscoverySourceTier.PRIMARY,
  DiscoveryTrustTier.VERIFIED,
  DiscoveryGeoScope.IT,
  DiscoveryTopicScope.FINANCE,
  DiscoverySourceKind.API,
  [DiscoverySourceCapability.DISCOVERY],
  "ISTAT statistical data (SDMX). Endpoint from config.",
);

const ingvTerremoti = entry(
  "ingv-terremoti",
  "INGV earthquake open data",
  DiscoverySourceUsageRole.AUTHORITATIVE,
  DiscoverySourceTier.PRIMARY,
  DiscoveryTrustTier.VERIFIED,
  DiscoveryGeoScope.IT,
  DiscoveryTopicScope.GEOPHYSICS,
  DiscoverySourceKind.API,
  [DiscoverySourceCapability.DISCOVERY],
  "INGV terremoti – open data. Endpoint from config.",
);

const gazzettaUfficiale = entry(
  "gazzetta-ufficiale",
  "Gazzetta Ufficiale / Normattiva",
  DiscoverySourceUsageRole.AUTHORITATIVE,
  DiscoverySourceTier.PRIMARY,
  DiscoveryTrustTier.VERIFIED,
  DiscoveryGeoScope.IT,
  DiscoveryTopicScope.LAW_REGULATION,
  DiscoverySourceKind.RSS,
  [DiscoverySourceCapability.DISCOVERY],
  "Gazzetta Ufficiale – Normattiva compatible surface.",
  createDiscoverySourceEndpoint({
    url: "https://www.gazzettaufficiale.it/rss/home",
    method: "GET",
    headersNullable: null,
  }),
);

// Editorial Italian
const ansaRss = entry(
  "ansa-rss",
  "ANSA RSS",
  DiscoverySourceUsageRole.EDITORIAL,
  DiscoverySourceTier.PRIMARY,
  DiscoveryTrustTier.CURATED,
  DiscoveryGeoScope.IT,
  DiscoveryTopicScope.EDITORIAL_NEWS,
  DiscoverySourceKind.RSS,
  [DiscoverySourceCapability.DISCOVERY],
  "ANSA – Agenzia Nazionale Stampa Associata. Can align URL with ingestion config.",
  createDiscoverySourceEndpoint({
    url: "https://www.ansa.it/sito/notizie/topnews/topnews_rss.xml",
    method: "GET",
    headersNullable: null,
  }),
);

const agiRss = entry(
  "agi-rss",
  "AGI RSS",
  DiscoverySourceUsageRole.EDITORIAL,
  DiscoverySourceTier.PRIMARY,
  DiscoveryTrustTier.CURATED,
  DiscoveryGeoScope.IT,
  DiscoveryTopicScope.EDITORIAL_NEWS,
  DiscoverySourceKind.RSS,
  [DiscoverySourceCapability.DISCOVERY],
  "AGI – Agenzia Giornalistica Italia. Endpoint from config.",
);

// Attention / trend
const wikimediaPageviews = entry(
  "wikimedia-pageviews",
  "Wikimedia Pageviews",
  DiscoverySourceUsageRole.ATTENTION,
  DiscoverySourceTier.SECONDARY,
  DiscoveryTrustTier.CURATED,
  DiscoveryGeoScope.GLOBAL,
  DiscoveryTopicScope.ATTENTION_MEDIA,
  DiscoverySourceKind.API,
  [DiscoverySourceCapability.DISCOVERY],
  "Wikimedia pageview API – attention/trend signal. Endpoint from config.",
);

const youtubeDataIt = entry(
  "youtube-data-it",
  "YouTube Data API (Italy)",
  DiscoverySourceUsageRole.ATTENTION,
  DiscoverySourceTier.SECONDARY,
  DiscoveryTrustTier.CURATED,
  DiscoveryGeoScope.IT,
  DiscoveryTopicScope.SOCIAL_VIDEO,
  DiscoverySourceKind.API,
  [DiscoverySourceCapability.DISCOVERY],
  "YouTube Data API – region Italy. Endpoint from config.",
);

const googleTrendsIt = entry(
  "google-trends-it",
  "Google Trends Italy",
  DiscoverySourceUsageRole.ATTENTION,
  DiscoverySourceTier.EXPERIMENTAL,
  DiscoveryTrustTier.UNVERIFIED,
  DiscoveryGeoScope.IT,
  DiscoveryTopicScope.ATTENTION_MEDIA,
  DiscoverySourceKind.API,
  [DiscoverySourceCapability.DISCOVERY],
  "Google Trends Italy – experimental; use with caution.",
);

// Fallback / enrichment
const directArticleFetch = entry(
  "direct-article-fetch",
  "Direct article fetch",
  DiscoverySourceUsageRole.FALLBACK,
  DiscoverySourceTier.SECONDARY,
  DiscoveryTrustTier.UNVERIFIED,
  DiscoveryGeoScope.UNKNOWN,
  DiscoveryTopicScope.UNKNOWN,
  DiscoverySourceKind.FEED,
  [DiscoverySourceCapability.DISCOVERY],
  "Direct fetch of article URL – fallback when no primary source.",
);

const apifyActorExtraction = entry(
  "apify-actor-extraction",
  "Apify actor-based extraction",
  DiscoverySourceUsageRole.FALLBACK,
  DiscoverySourceTier.SECONDARY,
  DiscoveryTrustTier.UNVERIFIED,
  DiscoveryGeoScope.UNKNOWN,
  DiscoveryTopicScope.UNKNOWN,
  DiscoverySourceKind.API,
  [DiscoverySourceCapability.ENRICHMENT],
  "Apify actor-based extraction – fallback/enrichment only; never primary discovery.",
);

export const INITIAL_DISCOVERY_SOURCE_CATALOG: readonly ReturnType<
  typeof createDiscoverySourceCatalogEntry
>[] = [
  protezioneCivileRss,
  istatSdmx,
  ingvTerremoti,
  gazzettaUfficiale,
  ansaRss,
  agiRss,
  wikimediaPageviews,
  youtubeDataIt,
  googleTrendsIt,
  directArticleFetch,
  apifyActorExtraction,
];
