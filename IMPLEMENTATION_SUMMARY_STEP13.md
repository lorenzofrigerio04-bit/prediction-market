# Step 13 – Full Pipeline Wiring for Discovery-Backed Flow: Implementation Summary

## 1. Created/Modified files

**Created**
- `lib/mde-pipeline/run-discovery-backed-pipeline.ts` – Orchestrator and result types (`runDiscoveryBackedPipeline`, `runDiscoveryBackedPipelineFromLeads`, `DiscoveryBackedPipelineLeadResult`, `DiscoveryBackedPipelineResult`, `DiscoveryBackedPipelineParams`, `PipelineRunner`).
- `lib/mde-pipeline/__tests__/run-discovery-backed-pipeline.test.ts` – Focused tests for the discovery-backed flow.

**Modified**
- `lib/mde-pipeline/index.ts` – Exported the new functions and types.
- `foundation-layer/src/discovery-news-engine/LEGACY_DISCOVERY_COMPONENTS.md` – Added Step 13 (Section 16).
- `lib/mde-pipeline/README.md` – Added subsection “3. Discovery-backed path (EventLead → pipeline)”.
- `vitest.config.ts` – Added `resolve.alias` for `@market-design-engine/foundation-layer` → `foundation-layer/dist/src/index.js` so root Vitest can resolve the foundation package when running lib tests.

**Foundation-layer (minimal fixes for build and tests)**
- `foundation-layer/src/discovery-news-engine/entities/event-lead.entity.ts` – Optional props (`cautionFlags`, `missingConditionsNullable`) built without assigning `undefined` (exactOptionalPropertyTypes).
- `foundation-layer/src/discovery-news-engine/entities/event-lead-evidence-set.entity.ts` – Same for `memberSignalIds`.
- `foundation-layer/src/discovery-news-engine/entities/discovery-ranking-entry.entity.ts` – Same for `cautionFlags`, `orderingBasis`.
- `foundation-layer/src/discovery-news-engine/implementations/event-lead-extraction-evaluator.ts` – Call sites updated to omit optional props when undefined; `enoughSignals` logic kept.
- `foundation-layer/src/discovery-news-engine/implementations/discovery-ranking-evaluator.ts` – Optional context props passed only when defined; `enoughSignals` rewritten to avoid TS2367; `createDiscoveryRankingEntry` call fixed.
- `foundation-layer/tests/discovery-news-engine/discovery-ranking-evaluator.test.ts` – Snapshot option names fixed (`hasAuthoritative` etc.).
- `foundation-layer/tests/discovery-news-engine/event-lead-extraction-evaluator.test.ts` – `createDiscoveryRankingEntry` call fixed for optional `cautionFlags`.

---

## 2. Canonical downstream pipeline path

The single canonical path is:

1. **Entry:** `runMdePipelineFromObservation({ observation: SourceObservation, ... })` in `lib/mde-pipeline/run-mde-pipeline.ts`.
2. **Stages:** `interpretObservation` → `interpretationToEventCandidate` → `candidateToCanonicalEvent` → deterministic assessors (opportunity, contract, outcome, deadline, source, scorecard) → `FoundationCompatibleMarketDraftBuilder` → title/summary/rulebook → `DeterministicPublishableCandidateBuilder`.
3. **Output:** `RunMdePipelineResult` = `{ publishableCandidate, pipeline, titleSet, resolutionSummary }`.
4. **Handoff:** `pipelineArtifactsToAppCandidate({ pipeline, titleSet, resolutionSummary })` in `lib/mde-pipeline/publishable-to-app-candidate.ts` produces the event-gen-v2 `Candidate` for `validateCandidates` → `scoreCandidate` → `publishSelectedV2`.

No app route or cron calls this path yet; the discovery-backed orchestrator is the new entry that feeds it.

---

## 3. Discovery-backed orchestration architecture

- **Module:** `lib/mde-pipeline/run-discovery-backed-pipeline.ts`.
- **Input:** One or more `EventLead` (e.g. from discovery ranking → event lead extraction).
- **Steps:** For each lead, call `eventLeadToSourceObservationAdapter.convert(lead)` (foundation). If outcome is `"converted"` and `observation` is present, call `runMdePipelineFromObservation({ ...params, observation })` (optional `pipelineRunner` injectable for tests). Catch pipeline errors and set `rejectionPoint` in the result.
- **Output:** Per-lead `DiscoveryBackedPipelineLeadResult`; batch via `runDiscoveryBackedPipelineFromLeads` returns `{ results }`.
- **Single pipeline:** All MDE semantics stay in `run-mde-pipeline.ts`; the orchestrator only sequences convert → run pipeline → wrap result.

---

## 4. Result contract

**`DiscoveryBackedPipelineLeadResult`** (readonly):

- `leadId` – EventLeadId (traceability).
- `conversionOutcome` – `"converted" | "skipped" | "rejected"` (from adapter).
- `conversionReasonCode` – optional; set when skipped/rejected or when pipeline throws.
- `observationId` – optional; set when converted (e.g. `obs_lead_<id>`).
- `pipelineResult` – optional `RunMdePipelineResult`; set only when conversion was `"converted"` and the pipeline ran successfully.
- `publishableReadiness` – `true` when `pipelineResult?.publishableCandidate` exists, else `false`.
- `rejectionPoint` – optional; `"conversion_skipped"` | `"conversion_rejected"` | `"pipeline_failed: <reason>"` when the flow stops early.
- `clusterId` – optional string (from conversion) for traceability.

**`DiscoveryBackedPipelineResult`** – `{ results: readonly DiscoveryBackedPipelineLeadResult[] }`.

---

## 5. Typing/build issues

- **New code:** Fully typed; no `any` or suppressions in the new orchestrator or tests.
- **Foundation-layer:** Minimal fixes were applied so that `foundation-layer` builds and root tests can run: exactOptionalPropertyTypes (omit optional props instead of passing `undefined`) in entity factories and call sites, and one logic fix in the ranking evaluator. These are in discovery-news-engine entities and implementations used by the adapter and by existing tests.
- **Root tests:** Vitest could not resolve `@market-design-engine/foundation-layer` (package “main” points at `dist/index.js` while tsc emits to `dist/src/index.js`). Added `resolve.alias` in `vitest.config.ts` to `foundation-layer/dist/src/index.js`. Foundation must be built (`cd foundation-layer && npm run build`) before running the discovery-backed pipeline tests from the root.
- **Pre-existing:** Any other tsc/type issues elsewhere in the repo were not changed; only what was needed for this flow was touched.

---

## 6. Legacy overlap and Step 13 doc

- **articleToSourceObservation:** Unchanged; remains the ingestion path (ProcessedArticle → SourceObservation). Discovery path is complementary.
- **lib/storyline-engine (getEligibleStorylines):** Superseded for lead source by discovery (event lead extraction). Kept in place until event-gen-v2/cron cutover; documented in LEGACY_DISCOVERY_COMPONENTS.md.
- **lib/event-gen-v2/candidate-generator:** Unchanged; still downstream. Future wiring can feed it from `runDiscoveryBackedPipeline` → `pipelineArtifactsToAppCandidate`.

Step 13 is documented in `foundation-layer/src/discovery-news-engine/LEGACY_DISCOVERY_COMPONENTS.md` as Section 16.

---

## 7. Tests added

**File:** `lib/mde-pipeline/__tests__/run-discovery-backed-pipeline.test.ts`

**Scenarios:**
1. **Success** – READY + HIGH lead → converted → pipeline runs → `publishableReadiness` true, `observationId` set, no `rejectionPoint`.
2. **Not ready / skipped** – NOT_READY or LOW confidence → conversion skipped/rejected → no pipeline run → `publishableReadiness` false, `rejectionPoint` set.
3. **Downstream failure** – Injected `PipelineRunner` throws → `rejectionPoint` contains `"pipeline_failed"`, no `pipelineResult`, `publishableReadiness` false.
4. **Traceability** – Success result has `leadId` and `observationId` consistent (observation id derived from lead id).
5. **Batch** – `runDiscoveryBackedPipelineFromLeads` with mixed converted/skipped leads returns one result per lead in order.

Fixtures use foundation `createEventLead`, `createEventLeadId`, etc. No live network; optional `pipelineRunner` used for the failure case.

---

## 8. Intentionally not implemented in this step

- Publisher redesign or full UI redesign.
- Scheduler/cron or runtime orchestration that calls the new orchestrator.
- HTML scraping, Apify runtime, or new persistence/DB for wiring.
- LLM/ML features.
- Removing or refactoring legacy ingestion/pipeline/storyline-engine beyond documentation.
- Changes to `pipelineArtifactsToAppCandidate` or event-gen-v2 publish flow beyond what is documented.
