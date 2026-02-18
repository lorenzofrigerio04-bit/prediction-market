# BLOCCO 5 - Event Publishing

Sistema deterministico per generazione e pubblicazione eventi OPEN nel DB.

## Overview

Il BLOCCO 5 prende output da BLOCCO 3 (storyline elegibili) e BLOCCO 4 (candidati verificati) e crea eventi OPEN nel DB in modo deterministico, senza LLM.

## Variabili d'Ambiente

### Configurazione Selezione

- `TARGET_OPEN_EVENTS` (default: `40`): Numero target di eventi OPEN da mantenere
- `CATEGORY_CAP_DEFAULT` (default: `10`): Massimo eventi per categoria
- `CATEGORY_CAP_<CATEGORIA>` (opzionale): Cap specifico per categoria (es. `CATEGORY_CAP_TECH=15`)
- `MAX_EVENTS_PER_STORYLINE` (default: `3`): Massimo eventi per storyline sorgente

### Debug

- `EVENT_GEN_DEBUG` (default: `false`): Se `true`, logga dettagli pipeline e top 10 candidates

### Autenticazione Cron

- `CRON_SECRET` (obbligatorio): Segreto per autenticazione endpoint cron

### Sistema

- `SYSTEM_USER_ID` (opzionale): ID utente sistema per creazione eventi (default: `"system"`)

## Comandi

### Dry Run

Esegue la pipeline senza pubblicare nel DB:

```bash
pnpm dry-run:events
```

Mostra:
- Numero storyline elegibili
- Numero candidati generati
- Numero candidati dopo dedup
- Numero candidati selezionati
- Ragioni di scarto

### Generazione Eventi

Esegue la pipeline completa e pubblica nel DB:

```bash
pnpm generate-events
```

### Purge Eventi

Rimuove tutti gli eventi dal DB (utile per test):

```bash
pnpm purge:events
```

### Test

Esegue test unitari:

```bash
pnpm test
```

## Flusso Pipeline

1. **Get Eligible Storylines** (BLOCCO 3)
   - Query storyline elegibili (lookback 7 giorni)
   - Restituisce storyline con momentum/novelty

2. **Generate Candidates** (BLOCCO 4)
   - Genera candidati verificati da storyline
   - Ogni candidato include: title, description, category, closesAt, authority, criteria, storylineId, templateId

3. **Score Candidates**
   - Calcola score 0..100 basato su:
     - Momentum (40%)
     - Novelty (20%)
     - Authority (20%): OFFICIAL=100, REPUTABLE=60
     - Clarity (20%): basato su title/description

4. **Dedup Candidates**
   - Intra-run: rimuove duplicati nello stesso batch (tiene score maggiore)
   - DB dedup: rimuove candidati con dedupKey già presente

5. **Select Candidates**
   - Calcola `need = max(0, TARGET_OPEN_EVENTS - openEventsCount)`
   - Se `need == 0`, non crea nulla
   - Altrimenti seleziona rispettando:
     - Category cap
     - Storyline cap
     - Ordine per score desc

6. **Publish Selected**
   - Crea eventi in transazione
   - Gestisce errori (unique constraint, etc.) senza crashare

## Endpoint Cron

### POST /api/cron/generate-events

Endpoint protetto per esecuzione automatica pipeline.

**Autenticazione:**
- Header: `Authorization: Bearer <CRON_SECRET>`
- Query param: `?secret=<CRON_SECRET>`

**Risposta:**
```json
{
  "success": true,
  "result": {
    "eligibleStorylinesCount": 10,
    "candidatesCount": 25,
    "dedupedCandidatesCount": 20,
    "selectedCount": 15,
    "createdCount": 15,
    "skippedCount": 0,
    "reasonsCount": {}
  }
}
```

## Struttura File

```
/lib/event-publishing/
  types.ts          # Tipi TypeScript
  scoring.ts        # Scoring deterministico
  dedup.ts          # Deduplicazione (intra-run + DB)
  selection.ts      # Selezione con caps
  publish.ts        # Pubblicazione DB
  index.ts          # Export principale
  __tests__/        # Test unitari

/lib/pipeline/
  runPipelineV2.ts  # Orchestratore pipeline

/lib/storyline-engine/
  index.ts          # Interfaccia BLOCCO 3

/lib/event-generation-v2/
  index.ts          # Interfaccia BLOCCO 4

/scripts/
  dry-run-generate-events.ts
  generate-events.ts

/app/api/cron/generate-events/
  route.ts          # Endpoint cron protetto
```

## Schema Database

Il modello `Event` include i seguenti campi aggiunti per BLOCCO 5:

- `status`: String (default: "OPEN")
- `dedupKey`: String? @unique (chiave deterministica per dedup)
- `resolutionAuthorityHost`: String?
- `resolutionAuthorityType`: String? (OFFICIAL | REPUTABLE)
- `resolutionCriteriaYes`: String?
- `resolutionCriteriaNo`: String?
- `sourceStorylineId`: String?
- `templateId`: String?

## Note

- Nessun LLM utilizzato nel BLOCCO 5
- Nessun fetch RSS/API nel BLOCCO 5
- Tutto deterministico e testabile
- Gestione errori resiliente (non crasha su constraint violations)
- Transazioni DB per atomicità
