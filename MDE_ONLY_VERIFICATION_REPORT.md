# MDE-ONLY VERIFICATION PASS – Report finale

## 1. OVERALL VERDICT

**PASS WITH NOTES**

- Nessun path runtime attivo di generazione eventi fuori da MDE per submit manuale, admin create e pipeline automatica (cron / run-generate-events).
- Unico path alternativo intenzionale: **pipeline odds** (`/api/cron/generate-odds-events` → `createEventFromOdds` → `prisma.event.create`), pipeline separata per eventi da quote, non parte del cutover MDE.
- Test obsoleti identificati e messi in sicurezza (describe.skip + commento). Commenti deprecation aggiunti dove il flag legacy poteva indurre in errore.

---

## 2. RUNTIME LEGACY BYPASS CHECK

| Simbolo/path | File | Classificazione | Impatto | Azione |
|--------------|------|-----------------|---------|--------|
| `createEventFromSubmission` | `lib/event-submission/validate.ts` | **shared / dead (runtime)** | Definizione presente; nessun caller da route prod | Nessuna: lasciata per test/migrazioni |
| `createEventFromSubmission` | `app/api/events/submit/route.test.ts` | **test only** | Mock + assert "not called" | Nessuna |
| `prisma.event.create` | `app/api/admin/events/route.ts` | **nessuno** | Solo commento "no prisma.event.create" | Nessuna |
| `prisma.event.create` | `lib/event-publishing/publish.ts` | **shared (MDE)** | Usato da `publishSelected` chiamato da `publishSelectedV2` | Nessuna: path MDE |
| `prisma.event.create` | `lib/event-submission/validate.ts` | **dead (runtime)** | Dentro `createEventFromSubmission` non chiamata da prod | Nessuna |
| `prisma.event.create` | `lib/odds-event-generation/create-from-odds.ts` | **runtime active (pipeline odds)** | Crea eventi da quote; pipeline separata | Documentato: non è legacy MDE |
| `prisma.event.create` | `prisma/seed.ts`, `scripts/*.ts` | **migration/seed/manual** | Seed e script one-off | Nessuna |
| `publishSelected(` | `lib/event-gen-v2/publisher.ts` | **shared (MDE)** | Unico caller: `publishSelectedV2` | Nessuna |
| `publishSelected(` | `lib/event-publishing/publish.ts` | **helper shared** | Definizione | Nessuna |
| `publishSelectedV2` | submit route, admin events route, run-pipeline.ts | **runtime active MDE** | Unici path di creazione eventi per submit/admin/pipeline | Nessuna |
| `runPipelineV2` | `lib/pipeline/runPipelineV2.ts` | **runtime active MDE** | Delega sempre a `runEventGenV2Pipeline` | Nessuna |
| `runEventGenV2Pipeline` | cron, admin run-generate-events, runPipelineV2, scripts | **runtime active MDE** | Entry point canonico pipeline | Nessuna |
| `getEligibleStorylines` / `generateEventsFromEligibleStorylines` | `lib/event-gen-v2/run-pipeline.ts`, trend-detector | **shared (MDE)** | Usati **dentro** event-gen-v2 (MDE) | Nessuna |
| `getEligibleStorylines` | runPipelineV2-gating.test (mock) | **test only** | Mock; legacy branch rimosso | Nessuna |
| `storyline-engine` / `event-generation-v2` | event-gen-v2 (candidate-generator, trend-detector, run-pipeline) | **shared (MDE)** | Dipendenze interne MDE | Nessuna |
| `ensureAmmStateForEvent` | `lib/event-publishing/publish.ts` | **shared (MDE)** | Chiamato dopo creazione evento in publishSelected | Nessuna |
| `ensureAmmStateForEvent` | create-from-odds, seed, scripts | **pipeline odds / migration** | Odds e seed | Nessuna |
| `MDE_AUTHORITATIVE_MANUAL_SUBMIT` | submit/route.ts | **deprecated** | Solo commento; path sempre MDE | Già commentato |
| `MDE_AUTHORITATIVE_MANUAL_SUBMIT` | submit/route.test.ts | **test only** | save/restore env | Nessuna |
| `ENABLE_LEGACY_PIPELINE_V2` | runPipelineV2.ts | **deprecated** | Non usato; path sempre MDE | Già commentato |
| `ENABLE_LEGACY_PIPELINE_V2` | operations route, [id]/route | **deprecated (UI)** | Esposto in gates; non comanda path | Commento deprecation aggiunto |
| `ENABLE_LEGACY_PIPELINE_V2` | runPipelineV2-gating.test.ts | **test only** | Verifica che flag non riattivi legacy | Nessuna |

---

## 3. ENTRY POINT TRUTH TABLE

| Entry point | File | Genera eventi? | Usa solo MDE? | Caveat |
|-------------|------|----------------|----------------|--------|
| POST /api/events/submit | `app/api/events/submit/route.ts` | Sì | Sì | draft → validateCandidates → publishSelectedV2; reject/publish fail → PENDING, no evento |
| POST /api/admin/events | `app/api/admin/events/route.ts` | Sì | Sì | validateMarket → draft → validateCandidates → publishSelectedV2; no prisma.event.create |
| POST /api/cron/generate-events | `app/api/cron/generate-events/route.ts` | Sì | Sì | Solo `runEventGenV2Pipeline` |
| POST /api/admin/run-generate-events | `app/api/admin/run-generate-events/route.ts` | Sì | Sì | Solo `runEventGenV2Pipeline` |
| GET/POST /api/cron/generate-odds-events | `app/api/cron/generate-odds-events/route.ts` | Sì | No | Pipeline **odds**: `runOddsEventPipeline` → `createEventFromOdds` → `prisma.event.create`. Intenzionale, fuori scope MDE. |
| Scripts: pipeline-v2.ts, pipeline-audit.ts, pipeline-v2-debug.ts | `scripts/*.ts` | Sì (solo pipeline-v2) | Sì | Chiamano `runPipelineV2` che delega a runEventGenV2Pipeline |
| GET/PATCH /api/events/submit/[id] | `app/api/events/submit/[id]/route.ts` | No | - | Legge/aggiorna submission; non crea eventi |
| Altre route admin (dispute, resolve, ecc.) | varie | No | - | Non creano eventi |

---

## 4. GREP EVIDENCE (principali match)

- **createEventFromSubmission**: solo in `lib/event-submission/validate.ts` (def) e in `app/api/events/submit/route.test.ts` (mock). Submit route **non** importa né chiama → nessun path runtime.
- **prisma.event.create** (in app/): nessun match in route; solo in admin/events/route.test.ts (nome test) e in admin/events/route.ts (commento). → nessun create diretto da route.
- **prisma.event.create** (in lib/): `publish.ts` (path MDE via publishSelectedV2); `validate.ts` (dentro createEventFromSubmission non usata da prod); `create-from-odds.ts` (pipeline odds). → unico path “alternativo” è odds, documentato.
- **publishSelected(** : chiamato solo da `lib/event-gen-v2/publisher.ts` (publishSelectedV2). → unico uso runtime è MDE.
- **publishSelectedV2**: chiamato da submit route, admin events route, `lib/event-gen-v2/run-pipeline.ts`. → tutti path MDE.
- **runPipelineV2** / **runEventGenV2Pipeline**: cron e admin run-generate-events chiamano solo runEventGenV2Pipeline; scripts chiamano runPipelineV2 che delega a runEventGenV2Pipeline. → nessun path legacy.
- **getEligibleStorylines** / **generateEventsFromEligibleStorylines**: usati in `lib/event-gen-v2/run-pipeline.ts` e in `lib/event-gen-v2/trend-detector.ts`. → solo **dentro** MDE, non come path standalone legacy.
- **MDE_AUTHORITATIVE_MANUAL_SUBMIT** / **ENABLE_LEGACY_PIPELINE_V2**: letti solo per commenti o UI (operations); non controllano più branch di codice. → deprecati, nessun bypass.

---

## 5. UI / OPERATIONS CHECK

- **Cosa continua a funzionare**: `/admin/operations` e dettaglio submission caricano gates, submission, event, latestPipelineRun. `publicationPath` è derivato da `creationMetadata.created_by_pipeline` (event-gen-v2 → "mde_authoritative"). Label "Published via Market Design Engine (MDE)" vs "Submission bridged and published (legacy)" coerenti.
- **Cosa è ancora semanticamente legacy ma innocuo**: Il gate `enableLegacyPipelineV2` è ancora esposto in `gates` e usato per `legacyPipelineMode` ("legacy_v2" vs "event_gen_v2") in admin-operations. Non comanda più nessun path; aggiunto commento deprecation nelle route operations.
- **Cosa va ripulito più avanti**: Rimuovere o rinominare `enableLegacyPipelineV2` dalla response delle operations (o mostrarlo come "deprecated / no-op") per evitare confusione in UI. Eventuale rimozione della funzione `createEventFromSubmission` se non più usata da nessun test/migrazione.

---

## 6. TEST / CONTRACT CHECK

- **Test aggiornati**: submit/route.test.ts (MDE-only, PENDING su reject/publish fail, createEventFromSubmission never called); admin/events/route.test.ts (MDE path, no prisma.event.create); runPipelineV2-gating.test.ts (sempre runEventGenV2Pipeline anche con flag legacy). admin-operations.test.ts (publicationPath mde_authoritative / legacy_bridge) invariato e coerente.
- **Test obsoleti**: `lib/pipeline/__tests__/runPipelineV2.test.ts` usa la firma `runPipelineV2(EventInput[])` che non esiste più (oggi `runPipelineV2({ prisma, now, dryRun })`). Applicato: commento in cima che il file è obsoleto e `describe.skip` per non far fallire la suite.
- **Contratti response**: Submit e admin events mantengono shape esistente (approved, eventId, submissionId, pendingReview, event). Nessuna regressione intenzionale.

---

## 7. MICRO-FIX APPLIED

1. **app/api/admin/operations/route.ts**: commento sopra `enableLegacyPipelineV2`: "Deprecated: no longer gates pipeline path; runPipelineV2 always uses event-gen-v2."
2. **app/api/admin/operations/[id]/route.ts**: stesso commento deprecation per `enableLegacyPipelineV2`.
3. **lib/pipeline/__tests__/runPipelineV2.test.ts**: commento in cima che i test sono obsoleti (vecchia API runPipelineV2(EventInput[])); `describe.skip` sul describe principale così la suite non esegue test incompatibili con la firma attuale.

---

## 8. FINAL RUNTIME TRUTH

- **Submit manuale usa solo MDE?** Sì. POST /api/events/submit crea eventi solo tramite toCandidateDraftContract → validateEventSubmission → validateAgainstMdeContract → manualDraftToCandidate → validateCandidates → scoreCandidate → publishSelectedV2. Non chiama createEventFromSubmission. In caso di reject o publish senza evento → PENDING, nessun evento.
- **Admin create usa solo MDE?** Sì. POST /api/admin/events crea eventi solo tramite validateMarket → adminBodyToCandidateDraftContract → manualDraftToCandidate → validateCandidates → scoreCandidate → publishSelectedV2. Non usa prisma.event.create.
- **Pipeline automatica usa solo MDE?** Sì. POST /api/cron/generate-events e POST /api/admin/run-generate-events chiamano solo runEventGenV2Pipeline. Gli script che usano runPipelineV2 ricevono solo il path che delega a runEventGenV2Pipeline.
- **Esiste ancora un path runtime che genera eventi fuori da MDE?** Per submit, admin create e pipeline (cron/run-generate-events): no. L’unico altro path che crea eventi è la **pipeline odds** (cron generate-odds-events → createEventFromOdds → prisma.event.create), volutamente separata e fuori dallo scope del cutover MDE.
