# Pipeline generazione eventi e Cron

La pipeline end-to-end genera eventi da ingestion (SourceArticle/SourceCluster) → storyline engine → candidate generator → rulebook validator → publish. È eseguibile manualmente (GET con segreto) o tramite **Vercel Cron**.

## Flusso

1. **Ingestion** – Il cron **generate-events** esegue prima l’ingest (se `INGESTION_ENABLED`): `processAllSources` popola SourceArticle e SourceCluster, poi `invalidateTrendCache`. Se l’ingest è disabilitato o fallisce (e non è impostato `GENERATE_EVENTS_REQUIRE_INGEST`), la pipeline procede con i dati già in DB.
2. **Trend Detector** – `getEligibleStorylines` seleziona storyline con momentum/novelty sufficienti
3. **Candidate Generator** – genera candidati da template (title, criteria, closesAt)
4. **Rulebook Validator** – `validateMarket` filtra candidati hard-fail
5. **Quality Scoring** – score 0..100 (momentum, novelty, authority, clarity)
6. **Dedup + Select** – rimuove duplicati, seleziona rispettando cap
7. **Publish** – crea Event + AmmState nel DB

Con **EVENT_GEN_V2=true**: pipeline v2.0 con marketId (PM-YYYY-NNNNN), sourceType=NEWS, resolutionSourceUrl.

## Endpoint

- **GET|POST /api/cron/generate-events** – Esegue prima l’ingest (se abilitato), poi l’intera pipeline.
  - **Autorizzazione**: header `Authorization: Bearer <CRON_SECRET>`.
  - **Risposta**: `{ success, eventGenV2, result, ingestRun, ... }` con `ingestRun: true | 'skipped'`, opzionali `ingestDurationMs`, `ingestError`, `ingestTotals`; `result` con `eligibleStorylinesCount`, `candidatesCount`, `createdCount`, ecc.

## Variabili d'ambiente

| Variabile | Obbligatoria | Descrizione |
|-----------|---------------|-------------|
| `CRON_SECRET` | In prod | Segreto per GET/POST su `/api/cron/generate-events`. |
| `INGESTION_ENABLED` | Opzionale | Se `false`, il cron generate-events non esegue l’ingest prima della pipeline (default `true`). |
| `GENERATE_EVENTS_REQUIRE_INGEST` | Opzionale | Se `true`, la run generate-events fallisce con 500 se l’ingest fallisce. Default: log e continua. |
| `EVENT_GEN_V2` | Opzionale | Se `true` usa pipeline v2.0 (marketId, sourceType=NEWS). Default `false`. |
| `DATABASE_URL` | Sì | Connessione PostgreSQL. |
| `EVENT_GENERATOR_USER_ID` | Opzionale | ID utente che crea gli eventi. Se non impostato: utente sistema o primo admin. |

## Cron su Vercel

In `vercel.json`:

```json
"crons": [
  { "path": "/api/cron/resolve-events", "schedule": "0 0 * * *" },
  { "path": "/api/cron/generate-events", "schedule": "0 8,20 * * *" }
]
```

- **generate-events**: `0 8,20 * * *` = due run al giorno alle 08:00 e 20:00 (UTC).

## Esecuzione locale

```bash
# Con CRON_SECRET in .env.local
curl -H "Authorization: Bearer test" "http://localhost:3000/api/cron/generate-events"
```

Script:

- `pnpm pipeline:v2` – pipeline V2 con debug
- `pnpm pipeline:v2:dry` – dry run (nessuna scrittura DB)
- `pnpm migrate:delete-all-markets` – elimina tutti gli eventi (richiede CONFIRM_DELETE_ALL_MARKETS=true)
