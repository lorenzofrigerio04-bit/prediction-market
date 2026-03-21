# E2E Test Plan: Event Generation v2 Pipeline

## Pipeline Overview

```
Trend → Candidate → Title → Image Brief → Validator → Scoring → Publish
                                                                    ↓
                                              Image Generation (async cron)
```

## Test Matrix

| Stage | Scenario | Test Type | Input | Expected | Assertions |
|-------|----------|-----------|-------|----------|------------|
| **Trend** | No eligible storylines | E2E | Empty/mocked DB | `eligibleStorylinesCount=0`, early return | No candidates, no DB writes |
| **Trend** | No trends (CANDIDATE_EVENT_GEN) | E2E | Empty trend cache | `eligibleStorylinesCount=0` | No candidates |
| **Trend** | Eligible storylines returned | E2E | Seeded SourceCluster + SourceArticle | `eligibleStorylinesCount > 0` | Storylines have momentum/novelty |
| **Candidate** | Zero candidates | E2E | Storylines with no templates | `candidatesCount=0` | reasonsCount populated |
| **Candidate** | Candidates generated | E2E | Valid storylines | `candidatesCount > 0` | Candidates have title, closesAt, resolutionCriteria |
| **Title** | Template produces title | Unit | `generateCandidates` mock | Title present, non-empty | Title length 3–500 |
| **Image Brief** | Brief generated at publish | Unit | ScoredCandidate | `imageBrief` with final_prompt, alt_text | `isValidImageBrief` |
| **Validator** | All rejected | E2E | Invalid candidates (timezone, binary) | `rulebookValidCount=0` | reasonsCount has rulebook keys |
| **Validator** | Some valid | E2E | Mix valid/invalid | `rulebookValidCount < candidatesCount` | Valid have rulebookValid |
| **Scoring** | Quality gate | Unit | `scoreCandidate` | `overall_score >= 0.75` for selected | `isAboveQualityThreshold` |
| **Scoring** | Below threshold filtered | E2E | Low-quality candidates | Selected below threshold excluded | Dedup/selection |
| **Publish** | Dry run | E2E | `dryRun: true` | `createdCount=0`, no Event | No DB writes |
| **Publish** | Publish creates Event | E2E | Valid selected | `createdCount > 0`, Event with marketId, status=OPEN | `creationMetadata` present |
| **Publish** | Dedup skips | E2E | Duplicate dedupKey | `skippedCount > 0` | reasonsCount DEDUP |
| **Image Gen** | PENDING → SUCCESS | E2E | Event with PENDING | `imageGenerationStatus=SUCCESS`, imageUrl set | Event updated |
| **Image Gen** | FAILED retry | E2E | Event with FAILED | Retry updates status | imageProviderMetadata |

## Test File Locations

- **E2E:** `lib/event-gen-v2/__tests__/run-pipeline.e2e.test.ts`
- **Unit:** `lib/event-gen-v2/__tests__/run-pipeline.test.ts` (unit/integration)
- **Image brief:** `lib/image-brief-engine/__tests__/generate.test.ts` (existing)
- **Validator:** `lib/event-gen-v2/rulebook-validator/__tests__/rulebook-validator.test.ts` (existing)
- **Scoring:** `lib/event-publishing/__tests__/scoring.test.ts` (existing)

## Setup

### Environment Variables

```bash
# Use storyline path (default for E2E)
CANDIDATE_EVENT_GEN=false

# Optional: enable pipeline v2
EVENT_GEN_V2=true

# Optional: structured JSON logs
PIPELINE_STRUCTURED_LOG=true
```

### Database

1. Run migration for `PipelineRun` table:
   ```bash
   npx prisma db push
   # or
   npx prisma migrate dev --name add_pipeline_run
   ```

2. E2E tests seed minimal `SourceCluster` and `SourceArticle` with reputable hosts (e.g. repubblica.it).

## Running Tests

```bash
# All event-gen-v2 tests
pnpm test lib/event-gen-v2

# E2E only
pnpm test lib/event-gen-v2/__tests__/run-pipeline.e2e.test.ts

# Watch mode
pnpm test:watch lib/event-gen-v2
```

## CI

Add to your test script; the E2E tests run against the configured `DATABASE_URL`. Ensure the `pipeline_runs` table exists (run migrations before tests).

## Metrics

| Metric | Source | Calculation |
|--------|--------|-------------|
| `markets_generated_count` | PipelineRun | `createdCount` per run (aggregated) |
| `markets_rejected_count` | PipelineRun | `rulebookRejectedCount + skippedCount` |
| `avg_quality_score` | PipelineRun / Event.generationScores | Mean of `overall_score` |
| `active_markets_count` | Event | `Count(Event WHERE status='OPEN' AND sourceType='NEWS')` |
| `image_generation_success_rate` | Event | `SUCCESS / (SUCCESS + FAILED)` for `generatorVersion='2.0'` |

## Dashboard

Admin → **Pipeline metrics** (`/admin/pipeline-metrics`) shows the five metrics above with configurable time range (24h, 48h, 7d).
