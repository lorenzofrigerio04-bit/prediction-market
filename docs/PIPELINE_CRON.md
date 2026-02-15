# Pipeline generazione eventi e Cron (Fase 6)

La pipeline end-to-end recupera notizie trending, le verifica, genera eventi con LLM e li crea in DB. È eseguibile manualmente (GET con segreto) o tramite **Vercel Cron** due volte al giorno.

## Flusso

1. **Fetch trending (Fase 1)** – `fetchTrendingCandidates(limit)` da NewsAPI.ai
2. **Verifica (Fase 2)** – `verifyCandidates(candidates)` (domini, vaghezza, score)
3. **Generazione (Fase 3+4)** – `generateEventsFromCandidates(verified, options)` con cap per categoria e scadenza
4. **Creazione (Fase 5)** – `createEventsFromGenerated(prisma, generated)` in DB con utente sistema

Gli eventi creati compaiono in **Discover** come quelli creati a mano; nessuna modifica alla UI.

### Eventi già in DB: nessuna modifica

La pipeline **crea solo nuovi eventi**; non modifica né rimuove eventi esistenti. Se in lista vedi ancora eventi con scadenza sbagliata (es. "Il ddl X sarà approvato entro la fine del 2023?"), sono stati creati **prima** dell’introduzione dei controlli su data esito e closesAt. Per non vederli più:

- **Risolvili dall’admin** (Risoluzione eventi chiusi) oppure chiudili/archiviali se previsto.
- I **nuovi** eventi generati dal cron (o da una run manuale) rispettano già le regole: data esito nel passato → evento scartato in verifica e in generazione; closesAt nel passato → rifiutato in creazione.

Quindi sì: per vedere l’effetto del fix sui “nuovi” eventi bisogna aspettare una run del cron (o lanciare manualmente `GET /api/cron/generate-events`); gli eventi vecchi sbagliati restano finché non li gestisci dall’admin.

## Endpoint

- **GET /api/cron/generate-events** – Esegue l’intera pipeline (fetch → verify → generate → create).
  - **Autorizzazione**: header `Authorization: Bearer <CRON_SECRET>` oppure `Authorization: Bearer <EVENT_GENERATOR_SECRET>`.
  - **Query (opzionali)**: `limit` (candidati da fetch, default 50), `maxPerCategory` (default 3), `maxTotal` (eventi da generare per run, default 15).
  - **Risposta**: `{ success, timestamp, candidatesCount, verifiedCount, generatedCount, created, skipped, errors, eventIds }`.

- **POST /api/cron/generate-events** – Crea in DB solo gli eventi inviati nel body `{ events: GeneratedEvent[] }`. Stessa autorizzazione. Utile per test o integrazioni che generano eventi altrove.

## Variabili d’ambiente

| Variabile | Obbligatoria | Descrizione |
|-----------|---------------|-------------|
| `CRON_SECRET` | In prod per cron | Segreto per GET/POST su `/api/cron/generate-events` (e resolve-events). Genera con `openssl rand -base64 32`. |
| `EVENT_GENERATOR_SECRET` | Opzionale | Alternativa a `CRON_SECRET` solo per generate-events. Se non impostato, si usa `CRON_SECRET`. |
| `EVENT_GENERATOR_USER_ID` | Opzionale | ID utente che crea gli eventi in DB. Se non impostato: utente `event-generator@system` o primo admin (vedi seed). |
| `NEWS_API_KEY` | Per Fase 1 | Chiave NewsAPI.ai per fetch trending. |
| `OPENAI_API_KEY` o `ANTHROPIC_API_KEY` | Per Fase 3 | LLM per generazione (vedi `GENERATION_PROVIDER` in `.env.example`). |
| Fase 2 / Fase 3 | Vedi `.env.example` | Domini, soglie verifica, modello, retry, ecc. |

In **produzione** (Vercel), almeno uno tra `CRON_SECRET` e `EVENT_GENERATOR_SECRET` deve essere impostato; altrimenti GET e POST rispondono 503.

## Cron su Vercel

In `vercel.json`:

```json
"crons": [
  { "path": "/api/cron/resolve-events", "schedule": "0 0 * * *" },
  { "path": "/api/cron/generate-events", "schedule": "0 8,20 * * *" }
]
```

- **generate-events**: `0 8,20 * * *` = due run al giorno alle 08:00 e 20:00 (UTC).

Configura in Vercel **Settings → Environment Variables** almeno `CRON_SECRET` (o `EVENT_GENERATOR_SECRET`) e, in **Cron Jobs**, l’header `Authorization: Bearer <valore_segreto>` per le chiamate a `/api/cron/generate-events`.

## Metriche e log

La risposta GET include:

- `candidatesCount` – candidati restituiti dal fetch
- `verifiedCount` – candidati passati dalla verifica
- `generatedCount` – eventi generati dall’LLM (prima del cap per categoria)
- `created` – eventi effettivamente creati in DB
- `skipped` – duplicati (stesso titolo già presente)
- `errors` – eventuali errori di validazione/creazione
- `eventIds` – ID degli eventi creati

In console viene loggato un riepilogo: `[cron/generate-events] { candidates, verified, generated, created, skipped, errors }` per monitoraggio.

## Esecuzione locale

Per testare la pipeline in locale:

```bash
# Con segreto in .env.local (es. CRON_SECRET=test)
curl -H "Authorization: Bearer test" "http://localhost:3000/api/cron/generate-events?limit=20&maxTotal=5"
```

Oppure usare gli script:

- `npm run generate-events` – genera eventi (Fase 1–4) senza scrivere in DB
- Script `create-events-from-generated.ts` – crea in DB da eventi generati a mano
