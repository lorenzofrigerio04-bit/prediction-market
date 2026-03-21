# MDE Pipeline (SourceObservation path)

This module implements the **full Market Design Engine pipeline** from `SourceObservation` to `PublishableCandidate`, and adapts its output to the app’s publish flow.

## Two submission paths

### 1. Manual admin path (binary-only)

- **Entry:** `/admin/operations` → form → `POST /api/events/submit` (or approve flow).
- **Flow:** Form → `toCandidateDraftContract` → `manualDraftToCandidate` → event-gen-v2 `Candidate` (binary YES/NO only) → `validateCandidates` → `scoreCandidate` → `publishSelectedV2`.
- **Behaviour:** Bypasses SourceObservation, ObservationInterpretation, CanonicalEvent, contract type selection, and rulebook/title/summary generation. Always produces a **binary** market (resolutionCriteriaYes / resolutionCriteriaNo). Documented as the **manual binary-only fast path**.

### 2. SourceObservation path (full MDE pipeline)

- **Entry:** Build or obtain a foundation-layer `SourceObservation` (e.g. via `articleToSourceObservation` from `@/lib/mde-ingestion` from ingestion data).
- **Flow:** `SourceObservation` → `interpretObservation` → `interpretationToEventCandidate` → `candidateToCanonicalEvent` → opportunity assessment, contract selection (default BINARY), outcome generation, deadline/source/scorecard → MarketDraftPipeline → title/summary/rulebook generation → `PublishableCandidate`.
- **Publish:** Use `runMdePipelineFromObservation()` to get `{ publishableCandidate, pipeline, titleSet, resolutionSummary }`, then `pipelineArtifactsToAppCandidate({ pipeline, titleSet, resolutionSummary })` to get an event-gen-v2 `Candidate`, then `validateCandidates` → `scoreCandidate` → `publishSelectedV2` as usual.

### 3. Discovery-backed path (EventLead → pipeline) — canonical discovery entry

- **Canonical:** The discovery-backed path (EventLead → `runDiscoveryBackedPipelineFromLeads` → MDE pipeline) is the **canonical discovery entry** for event generation when `USE_DISCOVERY_BACKED_PIPELINE=true`. The ingestion path (ProcessedArticle → `articleToSourceObservation`) remains for article-based input; both feed the same MDE pipeline.
- **Entry:** EventLead(s) from the Discovery News Engine (ranking → event lead extraction). Use `runDiscoveryBackedPipeline(lead, params?)` or `runDiscoveryBackedPipelineFromLeads(leads, params?)` from `@/lib/mde-pipeline`.
- **Flow:** EventLead → `eventLeadToSourceObservationAdapter` (foundation) → SourceObservation → same canonical pipeline as path 2 (`runMdePipelineFromObservation`) → publishable candidate. Result includes per-lead `DiscoveryBackedPipelineLeadResult` (conversion outcome, observationId, pipelineResult, publishableReadiness, rejectionPoint).
- **Note:** API route and scheduler wiring are not part of this module; cron and admin run-generate-events call `runEventGenV2Pipeline`, which gates on the env flag.

## Using the pipeline from ingestion

1. After ingestion (e.g. from `ProcessedArticle` or DB), create a `SourceObservation` with `articleToSourceObservation()` from `@/lib/mde-ingestion`.
2. Call `runMdePipelineFromObservation({ observation, preferredContractType?, eventDeadline?, marketCloseTime? })` from `@/lib/mde-pipeline`.
3. Get an app candidate: `pipelineArtifactsToAppCandidate({ pipeline: result.pipeline, titleSet: result.titleSet, resolutionSummary: result.resolutionSummary })`.
4. Run `validateCandidates([appCandidate])`, then `scoreCandidate(valid[0], storylineStats)`, then `publishSelectedV2(prisma, [scored], now, options)`.

## Optional: manual submission via pipeline

To send **manual** form data through the full pipeline (contract selection, title/summary/rulebook generation), you would:

1. Build a minimal `SourceObservation` from the form (title → normalizedHeadlineNullable, description → normalizedSummaryNullable, plus required IDs and evidence spans).
2. Call `runMdePipelineFromObservation({ observation: minimalObservation })` and then adapt to app candidate and publish as above.

Until that path is implemented, manual submission remains the **binary-only fast path** described in section 1.
