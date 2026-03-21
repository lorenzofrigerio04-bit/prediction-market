# Operations Cockpit (`/admin/operations`)

## Scope

The operations cockpit is the MDE-backed admin UI for:

- **Manual submission** of event candidates (title, category, closesAt, resolution source, etc.)
- **Run pipeline** to trigger Event Gen v2 (storyline or trend path)
- **Inspection** of submissions, pipeline snapshot, readiness, and audit

## Contract type: binary only

**Only binary (YES/NO) markets are supported.**

- The submit form and API accept no contract type or outcome set; submissions are always treated as binary.
- The rulebook validator requires `resolutionCriteriaYes` and `resolutionCriteriaNo`.
- The Event model stores outcome as YES/NO. Multi-outcome, scalar, race, sequence, and conditional contract types exist in the foundation-layer but are **not** wired to the cockpit or pipeline.

To support other contract types, the submit API, adapters, rulebook validator, and Event schema would need to be extended.

## Feature flags (gates)

- **MDE enforce / MDE shadow:** When `MDE_ENFORCE_VALIDATION=true`, failed MDE shadow validation blocks auto-publish (submission goes PENDING). The badge is informational.
- **Event Gen v2:** The pipeline is always Event Gen v2. The deprecated `ENABLE_LEGACY_PIPELINE_V2` env var no longer switches behaviour; it is not used at runtime. The UI shows "Event Gen v2" for clarity.

## Run pipeline

POST `/api/admin/run-generate-events` accepts an optional body `{ "maxTotal": number }` (valid range 1–50). When provided, it caps how many events are created in that run. If omitted, the pipeline uses its default selection logic.

## Approving PENDING submissions

Admins can approve a PENDING submission (and publish an event) via:

- **POST** `/api/admin/operations/submissions/[id]/approve` (admin-only, requires `events:create`).

The endpoint loads the submission, re-runs validation and rulebook checks, then publishes via the MDE path (`publishSelectedV2`). The event is attributed to the original submitter. On success, the submission is updated to status `APPROVED` with `eventId` and `reviewedAt`/`reviewedById`. The operations detail page shows an "Approva e pubblica" button when the submission is PENDING and not yet linked to an event.
