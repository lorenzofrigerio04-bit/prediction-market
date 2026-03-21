# Step 15 – Final Legacy Cutover + Hardening: Implementation Summary

## 1. Created/Modified files

**Modified**

- `foundation-layer/src/discovery-news-engine/LEGACY_DISCOVERY_COMPONENTS.md` – Added "Canonical path (Step 15)" summary at top; added §2.1 Step 15 classification table (remove/deprecate/keep temporarily); added §18 Step 15 section and Lead supplier subsection; blockers and build note.
- `lib/event-gen-v2/run-pipeline.ts` – File head and gate comment: canonical path (discovery when flag set) vs legacy paths.
- `lib/event-gen-v2/discovery-backed-integration.ts` – Comment: canonical path when flag set, storyline/trend legacy.
- `lib/mde-pipeline/README.md` – Discovery-backed path described as canonical discovery entry; ingestion path remains for article-based input.
- `.env.example` – Documented `USE_DISCOVERY_BACKED_PIPELINE`.
- `lib/ingestion/hype-scorer.ts` – @deprecated text updated to "Use discovery ranking engine instead".
- `lib/ingestion/config/sources.ts` – File-level @deprecated (canonical source list = discovery registry); getSourceConfigs() @deprecated.
- `lib/event-gen-v2/discovery-backed-event-leads.ts` – Contract (READY, suitable for adapter), gap, and JSDoc for getDiscoveryBackedEventLeads.
- `foundation-layer/package.json` – `main` and `types` set to `dist/src/index.js` and `dist/src/index.d.ts` so package entry matches tsc output.
- `lib/event-gen-v2/__tests__/discovery-backed-integration.test.ts` – New test: when USE_DISCOVERY_BACKED_PIPELINE=true, result includes all discovery-specific fields.
- `lib/mde-pipeline/__tests__/run-discovery-backed-pipeline.test.ts` – Import eventLeadToSourceObservationAdapter; new describe "foundation-layer module resolution" with test that adapter is importable and has convert method.
- `docs/SISTEMA_GENERAZIONE_EVENTI_PER_LLM.md` – Updated 9.2 to mention discovery-backed; optional 9.3 not added (special character in heading prevented match).

**Created**

- `IMPLEMENTATION_SUMMARY_STEP15.md` – This file.

---

## 2. Final canonical path

- **When `USE_DISCOVERY_BACKED_PIPELINE=true`:** Cron `POST/GET /api/cron/generate-events` and admin `POST /api/admin/run-generate-events` call `runEventGenV2Pipeline` → `runDiscoveryBackedEventGenPath` → `getDiscoveryBackedEventLeads()` → `runDiscoveryBackedPipelineFromLeads(leads)` → for each lead: EventLead → `eventLeadToSourceObservationAdapter.convert(lead)` → SourceObservation → `runMdePipelineFromObservation` → publishable candidate → `pipelineArtifactsToAppCandidate` → validate → score → dedup → select → publish.
- **When flag not set:** Storyline or CANDIDATE_EVENT_GEN (trend) path runs; these are temporary legacy paths.

---

## 3. Removed / deprecated / kept temporarily

- **Removed:** None. No legacy runtime code removed.
- **Deprecated (now):** `lib/ingestion/hype-scorer.ts` (getHypeScore, rankByHypeAndItaly) – use discovery ranking engine; `lib/ingestion/config/sources.ts` (getSourceConfigs, RSS_*, CALENDAR_*) – canonical source list is discovery registry; kept for legacy pipeline.
- **Kept temporarily:** Fetchers (rss, newsapi, calendar); trend-detection/*; event-gen run-pipeline storyline and CANDIDATE_EVENT_GEN branches; storyline-engine; jaccard; article-to-observation bridge; candidate-generator, candidate-event-generator, ai-event-generator. See LEGACY_DISCOVERY_COMPONENTS.md §2.1 table.

---

## 4. Critical hardening fixes

- **Foundation-layer package entry:** `main` and `types` in `foundation-layer/package.json` set to `dist/src/index.js` and `dist/src/index.d.ts` so they match tsc output (rootDir "." emits src/* to dist/src/*). Root Vitest alias already pointed to the same path; now package resolution is consistent.
- **Result shape:** Verified EventGenV2Result with discoveryBacked, leadCount, conversionCount, observationIds, publishableFromDiscovery is returned by runDiscoveryBackedEventGenPath and passed through by admin/cron (spread ...result).
- **Build requirement:** Documented in LEGACY_DISCOVERY_COMPONENTS.md Step 15: run `cd foundation-layer && npm run build` before root tests that use foundation.

---

## 5. Lead supplier status

- **Contract:** `getDiscoveryBackedEventLeads(): Promise<EventLead[]>`. Returned leads must be READY and suitable for `eventLeadToSourceObservationAdapter.convert(lead)`. Documented in JSDoc and LEGACY_DISCOVERY_COMPONENTS.md Step 15 § Lead supplier.
- **Current:** Stub returns `[]`. Gap documented: full discovery run (registry → connectors → normalize → dedupe → cluster → trend → rank → event lead extraction) not implemented; foundation has no single orchestrator returning EventLead[].
- **Real implementation:** Requires an orchestrator that composes foundation steps and returns EventLead[] (not implemented in this step).

---

## 6. Remaining blockers to full autonomous go-live

1. **Lead supplier is a stub** – Returns no leads; no events from discovery path until a real discovery run is implemented.
2. **Ingestion** – Still on legacy pipeline; discovery-run trigger for ingest is a future step.

---

## 7. Tests added/updated

- **lib/event-gen-v2/__tests__/discovery-backed-integration.test.ts:** Added test "when USE_DISCOVERY_BACKED_PIPELINE=true, result includes all discovery-specific fields" (discoveryBacked, leadCount, conversionCount, observationIds, publishableFromDiscovery). Existing tests already cover gating and result shape.
- **lib/mde-pipeline/__tests__/run-discovery-backed-pipeline.test.ts:** Import `eventLeadToSourceObservationAdapter` from foundation; added describe "foundation-layer module resolution" with test that adapter is importable and has convert method (guards module resolution).
- **Deprecation:** Existing `lib/ingestion/hype-scorer.test.ts` already tests getHypeScore and rankByHypeAndItaly; no new test added (exports remain callable).

---

## 8. Intentionally NOT implemented in this step

- Publisher redesign
- Full UI redesign
- Major new source integrations
- HTML scraping
- Apify runtime integration
- Scheduler/orchestration redesign
- Persistence/database redesign
- LLM/ML features
- Removal of legacy pipeline, fetchers, storyline-engine, trend-detection, or candidate-generator
- Full discovery run orchestrator that returns EventLead[] (Option 1 minimal real supplier not implemented; contract and gap formalized only)
