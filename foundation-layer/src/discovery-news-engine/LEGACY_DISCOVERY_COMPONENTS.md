# Legacy Discovery Components (Step 2.5 – Audit and Consolidation)

This document lists legacy discovery or ingestion components that overlap or relate to the Discovery News Engine, and provides the consolidation plan for transitioning to the new engine. **Do not delete legacy code in this step unless it is clearly unused and safe to remove.**

---

## Canonical path (Step 15)

- **Target canonical path for event generation:** The **discovery-backed flow** is the canonical path when `USE_DISCOVERY_BACKED_PIPELINE=true`. Legacy paths (storyline, CANDIDATE_EVENT_GEN) are **temporary** and used only when the flag is not set.
- **Where runtime enters:** Cron `POST/GET /api/cron/generate-events` and admin `POST /api/admin/run-generate-events` both call `runEventGenV2Pipeline`. When `USE_DISCOVERY_BACKED_PIPELINE=true`, the flow is: `runDiscoveryBackedEventGenPath` → `getDiscoveryBackedEventLeads()` → `runDiscoveryBackedPipelineFromLeads` → EventLead → SourceObservation (foundation adapter) → `runMdePipelineFromObservation` → validate → score → dedup → select → publish.
- **Lead supplier:** EventLeads are supplied by `getDiscoveryBackedEventLeads()` in `lib/event-gen-v2/discovery-backed-event-leads.ts`, which calls the real orchestration in `lib/event-gen-v2/discovery-lead-supplier.ts` (`runDiscoveryLeadSupplier`). The discovery-backed path is now fed by actual EventLead[] from registry → connectors → dedupe → cluster → trend → rank → event lead extraction. See Step 15 § Lead supplier for contract.

---

## 1. Legacy system architecture map

All paths are relative to the repository root.

| File path | Module responsibility | Dependencies | Referenced by runtime/jobs? |
|-----------|------------------------|--------------|----------------------------|
| `lib/ingestion/config/sources.ts` | RSS_MEDIA_FEEDS, RSS_OFFICIAL_FEEDS, CALENDAR_EVENTS; getSourceConfigs() | — | Yes: pipeline, calendar fetcher |
| `lib/ingestion/processing/pipeline.ts` | Orchestrates fetch (NewsAPI, RSS, Calendar) → canonical → dedup → jaccard cluster → save SourceArticle/SourceCluster, IngestionLog | sources, fetchers, canonical, dedup, jaccard, prisma | Yes: cron/ingest, scripts/ingest, scripts/pipeline-v2 |
| `lib/ingestion/fetchers/newsapi.ts` | fetchNewsAPI() → RawArticle[] | NEWSAPI_API_KEY, ingestion types | Yes: pipeline + newsapi-provider |
| `lib/ingestion/fetchers/rss.ts` | fetchRSS(urls, sourceType) → RawArticle[] | rss-parser, ingestion types | Yes: pipeline only |
| `lib/ingestion/fetchers/calendar.ts` | fetchCalendar(SPORT\|EARNINGS) → RawArticle[] | sources.ts CALENDAR_EVENTS | Yes: pipeline only |
| `lib/ingestion/processing/canonical.ts` | extractCanonicalUrl(url) | cheerio | Yes: pipeline |
| `lib/ingestion/processing/dedup.ts` | checkDuplicate/isDuplicate(canonicalUrl) via SourceArticle | prisma | Yes: pipeline |
| `lib/ingestion/processing/jaccard.ts` | clusterArticle(ProcessedArticle) → clusterId | prisma, JACCARD_THRESHOLD | Yes: pipeline |
| `lib/ingestion/types.ts` | RawArticle, ProcessedArticle, SourceType, IngestionResult, etc. | — | Yes: pipeline, fetchers, mde-ingestion |
| `app/api/cron/ingest/route.ts` | GET/POST cron: processAllSources(), invalidateTrendCache() | pipeline | Yes: Vercel Cron / manual |
| `lib/trend-detection/signal-providers/newsapi-provider.ts` | SignalProvider: fetchNewsAPI() → RawSignal[] | lib/ingestion/fetchers/newsapi | Yes: getTrends() |
| `lib/trend-detection/signal-providers/google-trends-provider.ts` | Stub SignalProvider (returns []) | trend types | Yes: registered in trend-detection |
| `lib/trend-detection/signal-providers/reddit-provider.ts` | Stub | trend types | Yes: registered |
| `lib/trend-detection/signal-providers/twitter-provider.ts` | Stub | trend types | Yes: registered |
| `lib/trend-detection/signal-providers/crypto-feed-provider.ts` | Stub | trend types | Yes: registered |
| `lib/trend-detection/index.ts` | getTrends(), getTrendObjects(), fetchAllSignals(), cache | signal-providers, trend-detector, cache | Yes: event-gen-v2 run-pipeline, trend-detector |
| `lib/trend-detection/trend-detector.ts` | getTrendsFromSignals(), aggregateSignals, rankTrends | types, scoring | Yes: via index |
| `lib/trend-detection/cache.ts` | getCachedTrends, setCachedTrends, invalidateTrendCache | — | Yes: cron/ingest invalidates; getTrends uses |
| `lib/trend-detection/scoring.ts` | computeTrendScore, computeTimeSensitivity | types | Yes: trend-detector |
| `lib/trend-detection/types.ts` | RawSignal, SignalProvider, TrendObject, GetTrendsParams | — | Yes: providers, event-gen-v2, candidate-event-generator |
| `lib/event-gen-v2/run-pipeline.ts` | runEventGenV2Pipeline: storyline path or CANDIDATE_EVENT_GEN trend path | storyline-engine, trend-detection, candidate-generator, etc. | Yes: cron generate-events |
| `lib/event-gen-v2/trend-detector.ts` | getTrendSignals; TREND_RADAR_V2 reorder via getTrends() | storyline-engine, trend-detection | Yes: storyline path |
| `lib/storyline-engine/index.ts` | getEligibleStorylines(SourceCluster + SourceArticle) | prisma, authority | Yes: event-gen-v2, trend-detector |
| `lib/mde-ingestion/article-to-observation.ts` | articleToSourceObservation(ProcessedArticle) → SourceObservation | foundation-layer, ingestion types | No callers yet |
| `lib/ingestion/italy-sources.ts` | ITALY_SOURCE_* whitelist, isItalySource() | — | Yes: hype-scorer only |
| `lib/ingestion/hype-scorer.ts` | getHypeScore, rankByHypeAndItaly | italy-sources | Tests + index export only; no app/cron/pipeline caller |
| `lib/ingestion/index.ts` | Re-exports italy-sources + hype-scorer | — | Consumers of getHypeScore/rankByHype (none in app/cron found) |
| `foundation-layer/src/sources/` | SourceDefinition, SourceRegistryEntry (identity, health, audit) | — | Used by foundation/admin; not discovery replacement |
| `foundation-layer/src/discovery-news-engine/` | Registry, catalog, DiscoveryFetchAdapter, DiscoverySourceConnector, entities | — | Tests + package export only; no app route uses it yet |

---

## 2. Classification table

| Component | Classification | Rationale |
|-----------|----------------|-----------|
| lib/ingestion/config/sources.ts | **MIGRATE** | Source list should be driven by Discovery Source Registry / catalog; config becomes registry-backed. |
| lib/ingestion/processing/pipeline.ts | **MIGRATE** | Orchestration should use discovery engine run/job contracts and connectors; keep until cutover. |
| lib/ingestion/fetchers/newsapi.ts | **MIGRATE** | Becomes a DiscoverySourceConnector (or adapter behind registry). |
| lib/ingestion/fetchers/rss.ts | **MIGRATE** | Becomes connector(s) driven by registry RSS entries. |
| lib/ingestion/fetchers/calendar.ts | **MIGRATE** | Calendar source(s) represented in registry; fetch logic becomes connector. |
| lib/ingestion/processing/canonical.ts | **REUSE** | Canonical URL logic useful for discovery normalization. |
| lib/ingestion/processing/dedup.ts | **REUSE** | Dedup by canonical URL aligns with discovery dedupe; can feed DiscoveryDedupeEvaluator or equivalent. |
| lib/ingestion/processing/jaccard.ts | **REUSE** | Clustering logic can inform discovery signal grouping / storylines. |
| lib/ingestion/types.ts | **KEEP TEMPORARILY** | Used everywhere until pipeline and MDE bridge migrate; then align with discovery entities. |
| app/api/cron/ingest/route.ts | **KEEP TEMPORARILY** | Runtime trigger; replace with discovery-run trigger when engine is wired. |
| lib/trend-detection/signal-providers/newsapi-provider.ts | **MIGRATE** | Same NewsAPI source; should use discovery signals / registry. |
| lib/trend-detection/signal-providers/google-trends-provider.ts | **MIGRATE** | Register as experimental attention source in registry; implement behind connector. |
| lib/trend-detection/signal-providers (reddit, twitter, crypto stubs) | **KEEP TEMPORARILY** | Stubs; migrate when implementing as discovery connectors. |
| lib/trend-detection/* (index, trend-detector, cache, scoring, types) | **KEEP TEMPORARILY** | Used by event-gen-v2; refactor to consume discovery signals in later phase. |
| lib/event-gen-v2/run-pipeline.ts, trend-detector.ts | **KEEP TEMPORARILY** | Runtime; switch to discovery-backed storylines/signals when ready. |
| lib/storyline-engine/index.ts | **KEEP TEMPORARILY** | Reads SourceCluster/SourceArticle; keep until discovery pipeline fills equivalent model or we map discovery → storylines. |
| lib/mde-ingestion/article-to-observation.ts | **REUSE** | Bridge ProcessedArticle → SourceObservation; reuse for discovery output → MDE. |
| lib/ingestion/italy-sources.ts | **REUSE** | Italy-first prioritization useful for discovery scoring/ranking. |
| lib/ingestion/hype-scorer.ts | **KEEP TEMPORARILY** | No current pipeline caller; could be REMOVE if confirmed dead, or REUSE for discovery ranking. |
| foundation-layer/src/sources/ | **KEEP TEMPORARILY** | Different domain; registry can reference SourceDefinitionId. |
| foundation-layer discovery-news-engine (registry, catalog, interfaces) | **REUSE** | New canonical system; no removal. |

**Definitions:**

- **REMOVE:** Component is obsolete and should be deleted in a future step.
- **MIGRATE:** Logic should move into the new Discovery News Engine.
- **KEEP TEMPORARILY:** Component is still used by runtime and must remain until cutover.
- **REUSE:** Component contains logic useful for the new engine.

### 2.1 Step 15 – Final legacy audit (classification)

For each relevant component, Step 15 assigns an **action**: remove now | deprecate now | keep temporarily (with reason). No legacy pipeline/fetcher/storyline/trend code is removed in this step.

| Area | Component | Classification | Reason |
|------|-----------|----------------|--------|
| Source config | `lib/ingestion/config/sources.ts` (getSourceConfigs, RSS_*, CALENDAR_*) | **Deprecate now** | Canonical source list is discovery registry; keep for legacy pipeline until ingest cutover. |
| Fetchers | `lib/ingestion/fetchers/rss.ts`, `newsapi.ts`, `calendar.ts` | **Keep temporarily** | Used by ingestion pipeline and trend newsapi-provider; remove only after discovery-run replaces ingest. |
| Trend/signals | `lib/trend-detection/*` (getTrends, trend-detector, scoring, cache, signal-providers) | **Keep temporarily** | Used by event-gen storyline and CANDIDATE_EVENT_GEN path; discovery path does not use them. |
| Event-gen entry | `lib/event-gen-v2/run-pipeline.ts` (storyline + CANDIDATE_EVENT_GEN branches) | **Keep temporarily** | Legacy paths; discovery is third branch; keep until discovery is default. |
| Storyline | `lib/storyline-engine` | **Keep temporarily** | Feeds storyline path; superseded for lead source by discovery when lead supplier is real. |
| Clustering | `lib/ingestion/processing/jaccard.ts` | **Keep temporarily** | Used by ingestion pipeline; discovery uses foundation story clustering. |
| Ranking/hype | `lib/ingestion/hype-scorer.ts` | **Deprecate now** | No pipeline caller; add explicit deprecation; use discovery ranking engine instead. |
| Observation bridge | `lib/mde-ingestion/article-to-observation.ts` | **Keep temporarily** | Ingestion path into MDE; complementary to EventLead bridge; keep for future ingest→MDE. |
| Candidate gen | `lib/event-gen-v2/candidate-generator.ts`, `candidate-event-generator`, `ai-event-generator` | **Keep temporarily** | Used by storyline/trend paths; discovery path uses MDE pipeline output. |

**Remove now:** Only truly dead code (unused exports with no callers). Do not remove any legacy pipeline, fetchers, storyline-engine, trend-detection, or candidate-generator in this step.

---

## 3. Consolidation plan (multi-phase)

### Phase 1 – Replace legacy source configuration with Discovery Registry

- Add discovery catalog entries for all sources currently in `sources.ts` (RSS media/official, calendar, NewsAPI).
- Introduce a thin layer that “reads” source list from registry (or sync registry from config) so pipeline can optionally use registry.
- Deprecate `getSourceConfigs()` and RSS_MEDIA_FEEDS / RSS_OFFICIAL_FEEDS / CALENDAR_EVENTS as the source of truth; document migration path.

### Phase 2 – Replace fetchers with discovery connectors

- Implement `DiscoverySourceConnector` (or `DiscoveryFetchAdapter`) for NewsAPI, RSS (per-feed or grouped), and calendar.
- Reuse existing fetch logic from `lib/ingestion/fetchers/` inside connectors; map to DiscoveryFetchRequest/DiscoveryFetchResponse.
- Wire registry to connectors (by source kind/key).
- No removal of legacy fetchers yet; pipeline still uses them until Phase 3.

### Phase 3 – Replace ingestion pipeline

- Implement discovery “run” that: (a) reads sources from registry, (b) calls connectors, (c) normalizes to a common item type, (d) runs dedup (reuse or mirror `lib/ingestion/processing/dedup.ts`), (e) optionally clusters (reuse jaccard idea), (f) writes to DB (SourceArticle/SourceCluster) or to a new discovery-backed store.
- Route cron/ingest to trigger this discovery run instead of `processAllSources()`.
- Keep legacy pipeline code behind a feature flag or env so it can be reverted; then remove once stable.

### Phase 4 – Replace legacy trend detection providers

- Trend layer (getTrends, event-gen-v2) should consume discovery signals: either discovery run produces “signals” that trend-detection aggregates, or trend-detection calls a discovery “signals” API that reads from discovery runs.
- Remove direct use of `fetchNewsAPI()` from `lib/trend-detection/signal-providers/newsapi-provider.ts`; replace with discovery-backed signal source.
- Google Trends / other stubs become connectors when implemented; registry entries already exist (e.g. google-trends-it).

### Phase 5 – Remove legacy ingestion cron path

- Cron ingest route only triggers discovery run (no `processAllSources()`).
- Remove or deprecate legacy pipeline, legacy fetchers, and legacy source config.
- Remove duplicate NewsAPI path; ensure single code path for all discovery.

---

## 4. Safe cleanups

- **Obviously dead:** None that are 100% safe to delete without product confirmation.
  - **getHypeScore / rankByHypeAndItaly:** Only used in tests and exported from `lib/ingestion/index.ts`; no caller in app/cron/pipeline. **Action:** Mark as deprecated in JSDoc (e.g. “Deprecated: consider discovery-based ranking”) rather than remove, in case ranking is reintroduced.
  - **articleToSourceObservation:** No callers; do not remove – needed for MDE bridge from discovery output.
- **Unused imports:** No aggressive cleanup in this step; run a lint/audit in a follow-up if desired.
- **Deprecated modules (mark only):** After Phase 1, mark `lib/ingestion/config/sources.ts` and `getSourceConfigs()` as deprecated in favor of Discovery Source Registry.

---

## 5. Risks and migration notes

- **Risk:** Cutting over cron/ingest to discovery before connectors are complete breaks ingestion.  
  **Mitigation:** Use a feature flag or env to switch between legacy and discovery run.

- **Risk:** Event-gen-v2 and storyline-engine depend on SourceArticle/SourceCluster; discovery must write the same shape or provide an adapter until event-gen is refactored.  
  **Mitigation:** Ensure discovery run can persist to existing SourceArticle/SourceCluster tables (or provide a thin adapter) until event-gen is updated to consume discovery output directly.

- **Note:** foundation-layer `sources/` (SourceDefinition/SourceRegistryEntry) is out of scope for discovery replacement; keep and reference by SourceDefinitionId where a discovery source is tied to an existing source definition.

---

## 6. Step 3 – Connector layer

- **Reused:** Feed connector parse logic and `rss-parser` usage (timeout, customFields for item) are adapted from `lib/ingestion/fetchers/rss.ts`. Output format is `DiscoveryFetchedPayload` / `NormalizedDiscoveryPayload`, not `RawArticle[]`.
- **Not reused:** NewsAPI-specific article mapping from `lib/ingestion/fetchers/newsapi.ts` was not copied; the JSON/API connector is generic (array or `articles`/`results`/`items`/`data`) and does not hardcode NewsAPI field names or URLs.
- **Legacy code:** No legacy fetchers or pipeline code was removed in this step; legacy components remain in place.

---

## 7. Step 4 – Source adapters

- **Overlap with legacy RSS:** `lib/ingestion/fetchers/rss.ts` and the RSS portion of the pipeline are **partially superseded** by the discovery feed connector plus the new source adapters for Italian canonical sources: **ANSA** (`ansa-rss`), **AGI** (`agi-rss`), **Protezione Civile** (`protezione-civile-rss`), and **Gazzetta Ufficiale** (`gazzetta-ufficiale`). For these sources, discovery can run via `getAdapterByKey(key)` → `runConnectorWithNormalize(request, adapter.connector, adapter.normalizer)` without using the legacy RSS fetcher.
- **Overlap with legacy config:** `lib/ingestion/config/sources.ts` has `ansa-top` (RSS_MEDIA_FEEDS) and `gazzetta-ufficiale` (RSS_OFFICIAL_FEEDS) with the **same URLs** as the discovery catalog entries `ansa-rss` and `gazzetta-ufficiale`. AGI and Protezione Civile have **no** corresponding entries in legacy `sources.ts`; they exist only in the Discovery Source Registry and adapter layer.
- **NewsAPI / trend:** Not in scope for Step 4; already classified as MIGRATE in §2. No change in this step.
- **No legacy code removed:** No legacy runtime code was removed in this step. Prefer deprecation/documentation over risky removal. Legacy `lib/ingestion/fetchers/rss.ts` and `lib/ingestion/config/sources.ts` remain in place and are still used by the pipeline and cron until cutover (Phase 2/3).

---

## 8. Step 5 – Attention source adapters

- **Partially superseded:** `lib/trend-detection/signal-providers/google-trends-provider.ts` (stub) is now **partially superseded** by the discovery adapter `google-trends-it` for the purpose of providing an experimental attention source behind the registry. The stub remains in the codebase and is still registered in trend-detection until Phase 4.
- **Temporarily active:** `lib/trend-detection/*` (getTrends, cache, scoring, signal-providers), `lib/event-gen-v2/trend-detector.ts`, and related runtime remain in use; they do not yet consume discovery adapters.
- **Later:** Phase 4 should switch trend-detection to discovery-backed signals and remove or replace the Google Trends stub. No legacy runtime code was deleted or changed in this step.

---

## 9. Step 6 – Normalization and provenance hardening

- **Topic/geo conventions:** Discovery now uses an extended **DiscoveryTopicScope** (e.g. `WEATHER_EMERGENCY`, `GEOPHYSICS`, `LAW_REGULATION`, `EDITORIAL_NEWS`, `ATTENTION_MEDIA`, `SOCIAL_VIDEO`, `UNKNOWN`) and **DiscoveryGeoScope** (`LOCAL`, `UNKNOWN` added). Catalog entries have been updated so that topic/geo are set per source family (e.g. INGV → GEOPHYSICS, Protezione Civile → WEATHER_EMERGENCY, Gazzetta Ufficiale → LAW_REGULATION, ANSA/AGI → EDITORIAL_NEWS, Wikimedia/Google Trends → ATTENTION_MEDIA, YouTube → SOCIAL_VIDEO). Any legacy ingestion or trend code that used different topic/geo labels should treat discovery **topicScope** / **geoScope** as the canonical set when integrating with discovery output.
- **bodySnippet vs observed metrics:** **bodySnippet** is no longer used to encode pageviews (Wikimedia), timeframe/region (Google Trends), or location (INGV). These are now in **observedMetricsNullable** (pageviewsNullable, timeframeNullable, regionNullable, channelIdNullable) and **geoPlaceTextNullable** (source-provided place text). Downstream code that previously parsed "Pageviews: N" or "Time: …; Region: …" from bodySnippet should use the structured fields instead.
- **Provenance:** Payload and signal provenance now include sourceKey, sourceRoleNullable, sourceTier, trustTier, endpointReferenceNullable, adapterKeyNullable, and fetchMetadataNullable (statusCode, etag). Use **buildDiscoveryProvenanceMetadata** for consistent construction.
- **No legacy code removed:** No major runtime code was removed in this step. Legacy pipeline, fetchers, and trend-detection remain in place.

---

## 10. Step 7 – Dedupe Engine v1

- **Discovery Dedupe Engine v1:** Implements deterministic, explainable deduplication for discovery items and signals. Keys are derived from: canonical URL, source key + external item id, synthetic locator (for structured sources), and normalized title + 1-hour time window. The evaluator compares candidates against within-run and optional prior collections and returns explicit outcomes: `unique`, `duplicate_within_run`, `duplicate_of_existing`, `insufficient_evidence`, `not_deduplicated`, with full explainability (reason, matchedKey, matchedCandidateId, evidenceStrength, foundWithinRun).
- **Legacy `lib/ingestion/processing/dedup.ts`:** Canonical-URL-only, DB-backed deduplication is **superseded for discovery runs** by the new dedupe layer when the discovery run is wired (Phase 3). Until then, the legacy pipeline continues to use `dedup.ts`; no legacy runtime code was removed in this step.
- **Other legacy heuristics:** Hype-scorer (`lib/ingestion/hype-scorer.ts`), jaccard clustering (`lib/ingestion/processing/jaccard.ts`), and trend ranking remain as-is and are out of scope for dedupe v1. No duplicate/hype/ranking logic was replaced beyond the dedup step intended for discovery runs.

---

## 11. Step 8 – Story Clustering v1

- **Story clustering v1:** The Discovery News Engine now has a canonical **story clustering** layer for grouping related discovery items/signals into early story clusters. It is conservative, deterministic, and explainable: rules are URL continuity, source identity, structured-source locator, and title + narrow temporal proximity (same day). Geo/topic are supporting factors only; no join solely on geo/topic. No embeddings, LLM, or Jaccard-style text similarity. No persistence in v1.
- **Legacy `lib/ingestion/processing/jaccard.ts`:** Jaccard clustering (token similarity on title+content, DB-backed `SourceCluster`/`SourceArticle`) is **superseded for discovery runs** by the new rule-based story clustering when the discovery pipeline is wired (Phase 3). Until cutover, the legacy pipeline continues to use `jaccard.ts`; no legacy runtime code was removed in this step.
- **Overlap:** Both legacy jaccard and discovery story clustering group articles/items. **Difference:** jaccard = token similarity + database; story clustering v1 = deterministic rules (canonical URL, source id, synthetic locator, title+same-day) + in-memory, with full explainability (reason, matchedMemberId, evidenceStrength, createdNewCluster).

---

## 12. Step 9 – Trend Engine Multi-Horizon v1

- **Trend Engine Multi-Horizon v1:** The Discovery News Engine now has a deterministic, explainable **trend** layer that evaluates story clusters over multiple horizons (FAST_PULSE, SHORT_CYCLE, MEDIUM_CYCLE, SCHEDULED_MONITOR). It produces trend snapshots with structured indicators (signal count, source diversity, role presence, activity density, time span, freshness consistency, scheduled-source relevance) and horizon-specific rules. No ranking, no persistence, no LLM/embeddings in v1.
- **Partially superseded (conceptually):**
  - **lib/trend-detection/** (aggregateSignals, getTrendsFromSignals, trend_score, time_sensitivity): Topic-based aggregation and scoring; the discovery trend engine provides **cluster-based**, **multi-horizon**, **explainable** trend snapshots without a single composite trend_score or ranking. When the discovery pipeline is wired, trend semantics can migrate to discovery trend snapshots.
  - **lib/trend-detection/scoring.ts** (computeTrendScore, recency/frequency/crossSource/entityImportance): Heuristic scoring; discovery trend uses **explicit indicators and horizon rules** instead of a composite score. No removal; document as alternative/superseded for discovery-backed flows.
  - **lib/ingestion/hype-scorer.ts** (getHypeScore, rankByHypeAndItaly): Recency + source authority; discovery trend uses **horizon + source role presence + activity density** etc., with no ranking in v1. Already marked deprecated; trend engine is the discovery-side replacement for “hype” semantics.
  - **lib/event-gen-v2/trend-detector.ts** (reorderByTrendRadar via getTrends()): Reorders storylines by legacy trend_score; once discovery trend is wired, a future step could reorder using discovery trend snapshots instead.
- **Not superseded / unchanged:** Legacy pipeline, cron, event-gen-v2 runtime, storyline-engine, and all existing callers remain; **no removal of major runtime code** in this step.

---

## 13. Step 10 – Ranking Engine v1

- **Ranking Engine v1:** The Discovery News Engine now has a deterministic, explainable **ranking** layer that consumes discovery outputs (story clusters, cluster summaries, trend snapshots) and produces prioritized ranked entries with factor breakdown and reasons. It is Italian-first, product-aware, and does not create EventLead or SourceObservation. No persistence, no LLM/ML in v1.
- **Superseded for discovery-backed flows:**
  - **lib/ingestion/hype-scorer.ts** (`getHypeScore`, `rankByHypeAndItaly`): Recency + source authority + Italy boost; **superseded** for discovery-backed flows by the discovery ranking engine, which uses structured factors (authoritative/editorial/attention relevance, Italian relevance, signal density, freshness, scheduled relevance, atomicity/resolvability hints) and explicit breakdown and reasons. Already marked deprecated; no legacy runtime code was removed in this step.
  - **lib/trend-detection/trend-detector.ts** (`rankTrends(trends)`): Sorts by opaque `trend_score`; **superseded** for discovery-backed flows by discovery ranking, which orders by priority class and structured ordering basis (Italian-first, then authority/editorial, then density) with full explainability.
  - **lib/trend-detection/scoring.ts** (`computeTrendScore`, `computeTimeSensitivity`): Composite recency/frequency/cross-source/entity scoring; **conceptually superseded** for discovery prioritization by the new factor set (authoritative/editorial/attention, Italian, freshness, scheduled, atomicity/resolvability). Legacy code remains for current trend-detection callers.
- **No legacy code removed:** No major runtime code was removed in this step. Hype-scorer and trend-detection remain in place; document only.

---

## 14. Step 11 – Event Lead Extraction v1

- **Event Lead Extraction v1:** The Discovery News Engine now has a conservative, rule-based **event lead extraction** layer that consumes ranked discovery entries (and optional cluster summaries / trend snapshots) and produces either an **EventLead** or an explicit **not_extracted** outcome per cluster, with full explainability (reasons, missing conditions). EventLead is distinct from SourceObservation, ObservationInterpretation, and EventCandidate. No persistence, no LLM/ML, no publication in v1.
- **Superseded for discovery-backed flows (conceptually):**
  - **lib/storyline-engine (getEligibleStorylines):** Conceptually overlaps with “selecting clusters that become event leads.” Today it selects **SourceCluster**-based storylines from the legacy DB using momentum/novelty/authority. **Superseded for discovery-backed flows** by Event Lead Extraction when the discovery pipeline is wired: discovery will produce EventLeads from ranked discovery clusters; a future SourceObservation bridge will consume EventLeads, not storyline-engine’s eligible list. No removal of storyline-engine in this step.
- **Not superseded / unchanged:**
  - **lib/event-gen-v2/candidate-generator:** Consumes `EligibleStoryline[]` and produces template-based `Candidate[]`. It is **downstream** of “lead selection.” EventLead is **upstream** of EventCandidate: eventually EventLead → (bridge) → SourceObservation/interpretation → EventCandidate. Candidate-generator is not superseded; the **source of leads** (storyline-engine vs discovery event-lead extraction) will change when the discovery path is wired.
  - **lib/mde-ingestion/article-to-observation.ts:** Bridge from ProcessedArticle to SourceObservation. **Unchanged.** Event Lead Extraction does not produce SourceObservation; Step 12 adds the bridge from EventLead to SourceObservation.
- **No legacy code removed:** No major runtime code was removed in this step. Storyline-engine, candidate-generator, and article-to-observation remain in place; document only.

---

## 15. Step 12 – EventLead → SourceObservation bridge

- **EventLead → SourceObservation bridge:** The Discovery News Engine now has a dedicated adapter that converts ready **EventLead** objects into foundation-layer **SourceObservation** objects. This is the first integration point between the Discovery News Engine and the Market Design Engine pipeline. The adapter lives in `foundation-layer/src/discovery-news-engine/bridges/` (`eventLeadToSourceObservationAdapter`, `EventLeadObservationConversionResult`). It does **not** trigger ObservationInterpretation, EventCandidate generation, title/summary/rulebook, or publisher logic. No persistence, no LLM/ML in v1.
- **Relationship to legacy bridge:**
  - **Discovery path:** EventLead (from ranking → event lead extraction) → **EventLeadToSourceObservationAdapter** → SourceObservation.
  - **Ingestion path:** ProcessedArticle (from RSS/NewsAPI/calendar, etc.) → **articleToSourceObservation** (lib/mde-ingestion/article-to-observation.ts) → SourceObservation.
  - The two paths are **complementary**. The new adapter is the discovery path into the MDE pipeline; `article-to-observation` remains the ingestion path and is **unchanged**.
- **No legacy code removed:** No removal of `articleToSourceObservation` or any other runtime code in this step.

---

## 16. Step 13 – Discovery-backed pipeline wiring

- **Discovery-backed pipeline path:** The repository now has a full wiring from EventLead through the canonical MDE pipeline to publishable/publication-ready outputs. The orchestration layer lives in `lib/mde-pipeline/run-discovery-backed-pipeline.ts` (`runDiscoveryBackedPipeline`, `runDiscoveryBackedPipelineFromLeads`). It does **not** bypass or duplicate the canonical pipeline; it converts READY EventLeads to SourceObservation via the existing foundation adapter, then calls `runMdePipelineFromObservation`. Flow: EventLead (from ranking → event lead extraction) → **eventLeadToSourceObservationAdapter** → SourceObservation → **runDiscoveryBackedPipeline** (orchestrator) → **runMdePipelineFromObservation** → publishable candidate + app candidate handoff (`pipelineArtifactsToAppCandidate`).
- **Relationship to existing bridges:**
  - **articleToSourceObservation (lib/mde-ingestion/article-to-observation.ts):** Unchanged; remains the **ingestion path** (ProcessedArticle → SourceObservation). The discovery path is complementary (EventLead → SourceObservation). Both feed the same canonical pipeline entry point.
  - **lib/storyline-engine (getEligibleStorylines):** Conceptually **superseded for lead source** by discovery (event lead extraction produces EventLeads). Storyline-engine remains in use until event-gen-v2/cron is switched to the discovery-backed pipeline; document as “to be replaced by discovery path at cutover.”
  - **lib/event-gen-v2/candidate-generator:** **Unchanged**; still downstream. When the app wires discovery, it will feed candidates from `runDiscoveryBackedPipeline` → `pipelineArtifactsToAppCandidate` instead of (or in addition to) the storyline-based candidate-generator.
- **Temporary / future:** Cron/scheduler and API route wiring are **out of scope** for this step. Runtime trigger and persistence are future steps. No removal of legacy runtime code in this step.

---

## 17. Step 14 – Runtime integration

- **Runtime entry points:** The same entry points that invoke event generation now support a **third path** (discovery-backed) when `USE_DISCOVERY_BACKED_PIPELINE=true`: **cron** `POST/GET /api/cron/generate-events` and **admin** `POST /api/admin/run-generate-events`. Both call `runEventGenV2Pipeline`; the gate and discovery branch live inside that function in `lib/event-gen-v2/run-pipeline.ts`.
- **EventLead sourcing:** EventLeads are supplied by `getDiscoveryBackedEventLeads()` in `lib/event-gen-v2/discovery-backed-event-leads.ts`. **Step 14 stub** returns `[]` so the discovery path is exercised and returns structured empty results. Full discovery run (fetch → normalize → dedupe → cluster → trend → rank → event lead extraction) is a follow-up; no new API route or cron job was added for the same flow.
- **Wiring:** When the flag is on, the flow is: `getDiscoveryBackedEventLeads()` → `runDiscoveryBackedPipelineFromLeads(leads)` → `pipelineArtifactsToAppCandidate` for each publishable result → existing **validateCandidates** → **scoreCandidates** → **dedupCandidates** → **selectCandidatesWithInfo** → **publishSelectedV2**. No second downstream pipeline; the same publisher is used.
- **Result and persistence:** The pipeline result includes optional `discoveryBacked`, `leadCount`, `conversionCount`, `observationIds`, `publishableFromDiscovery`. PipelineRun is persisted with `source: "discovery"` when the discovery path runs.
- **Legacy paths:** Storyline and CANDIDATE_EVENT_GEN paths remain; no removal of legacy ingestion, pipeline, storyline-engine, or cron ingest logic. Only the **source of candidates** changes when the flag is on (EventLeads → discovery pipeline → Candidate[] instead of storylines or trends).

---

## 18. Step 15 – Final legacy cutover + hardening

- **Canonical:** The discovery-backed flow (when `USE_DISCOVERY_BACKED_PIPELINE=true`) is the **target canonical path** for event generation. Entry: cron/admin → `runEventGenV2Pipeline` → `runDiscoveryBackedEventGenPath` → `getDiscoveryBackedEventLeads()` → `runDiscoveryBackedPipelineFromLeads` → EventLead → SourceObservation → MDE pipeline → validate/score/dedup/select/publish.
- **Temporary:** Storyline path and CANDIDATE_EVENT_GEN (trend) path; legacy ingestion pipeline, fetchers, trend-detection, storyline-engine, jaccard, candidate-generator; all kept until discovery is default or ingest cutover.
- **Removed in Step 15:** None (no legacy runtime code removed).
- **Deprecated in Step 15:** `lib/ingestion/hype-scorer.ts` (getHypeScore, rankByHypeAndItaly) — use discovery ranking engine; `lib/ingestion/config/sources.ts` (getSourceConfigs, RSS_*, CALENDAR_*) — canonical source list is discovery registry; kept for legacy pipeline.
- **Lead supplier:** See subsection below.
- **Blockers to full autonomous go-live:** (1) ~~Lead supplier stub~~ **Resolved in Step 16:** the stub has been replaced by a real supplier. (2) Ingestion still uses legacy pipeline; discovery-run trigger for ingest is a future step. (3) No persistence of discovery runs or supplier report in this step (v1 is in-memory only).
- **Build:** Running root tests that use `@market-design-engine/foundation-layer` (e.g. discovery-backed pipeline tests) requires building the foundation first: `cd foundation-layer && npm run build`. The package `main`/`types` point to `dist/src/index.js` and `dist/src/index.d.ts`.

### Lead supplier (Step 15 / Step 16)

- **Contract:** `getDiscoveryBackedEventLeads(): Promise<EventLead[]>`. Returned leads must be **READY** (EventLeadReadiness.READY) and suitable for `eventLeadToSourceObservationAdapter.convert(lead)`; the adapter converts only READY + (MEDIUM|HIGH) confidence leads to SourceObservation.
- **Current behaviour (Step 16):** The stub has been **replaced**. `getDiscoveryBackedEventLeads()` calls `runDiscoveryLeadSupplier()` in `lib/event-gen-v2/discovery-lead-supplier.ts`, which composes the discovery engine: enabled sources from registry → `getAdapterByKey` + `runConnectorWithNormalize` → aggregate items/signals → dedupe → story clustering → trend evaluation → ranking → event lead extraction → return READY EventLead[] plus a structured `DiscoveryLeadSupplierReport`. Partial source failures are recorded in the report and do not collapse the run.
- **What legacy ingestion/discovery remains temporarily:** Legacy pipeline (`lib/ingestion/processing/pipeline.ts`), fetchers (RSS, NewsAPI, calendar), storyline-engine, trend-detection, jaccard clustering, and candidate-generator remain in use when `USE_DISCOVERY_BACKED_PIPELINE` is not set. No removal of major runtime code in Step 16.
