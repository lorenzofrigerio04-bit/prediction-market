# Prediction Market

Piattaforma italiana di previsioni sociali con crediti virtuali.

## Setup Iniziale

1. **Installa le dipendenze**:
   ```bash
   npm install
   ```

2. **Configura il database**:
   - Crea un file `.env` copiando `.env.example`
   - Modifica `DATABASE_URL` con le tue credenziali PostgreSQL
   - Esegui le migrazioni:
     ```bash
     npm run db:generate
     npm run db:push
     ```
   - Popola il database con dati di esempio:
     ```bash
     npm run db:seed
     ```
     Questo creerà un utente admin e 3 eventi generici per testare l'applicazione.

3. **Avvia il server di sviluppo**:
   ```bash
   npm run dev
   ```

4. Apri [http://localhost:3000](http://localhost:3000) nel browser.

## Deploy su Vercel – Passi da fare tu

Per **Google Login** e **variabili d’ambiente su Vercel**, segui la guida:

- **[docs/PASSI_DA_FARE.md](docs/PASSI_DA_FARE.md)** – cosa fare su Vercel e Google Cloud; cosa scrivere in chat quando hai finito o quando cambi dominio/database.

Riferimento variabili: `.env.example`.

## Script Disponibili

- `npm run dev` - Avvia il server di sviluppo
- `npm run build` - Crea la build di produzione
- `npm run start` - Avvia il server di produzione
- `npm run lint` - Esegue il linter
- `npm run db:generate` - Genera il Prisma Client
- `npm run db:push` - Sincronizza lo schema con il database
- `npm run db:migrate` - Crea una nuova migrazione
- `npm run db:studio` - Apre Prisma Studio
- `npm run db:seed` - Popola il database con dati di esempio (admin + 3 eventi)
- `npx tsx scripts/seed-100-eventi-feed.ts` - Crea 100 eventi nel feed Discover con foto AI e commenti LLM (richiede `OPENAI_API_KEY`, `BLOB_READ_WRITE_TOKEN`; vedi commenti nello script)
- `npx tsx scripts/sync-blob-images-to-db.ts` - Sincronizza le immagini già presenti nel Blob (cartella `ai-images/`) con il DB: aggiorna `Post.aiImageUrl` per i post che non ce l'hanno. Utile se le foto sono nel Blob ma il DB è stato resettato (richiede `BLOB_READ_WRITE_TOKEN`).

## Sistema di Risoluzione Eventi

Il sistema gestisce automaticamente gli eventi chiusi:

### Funzionalità Automatiche

1. **Risoluzione Automatica**: Quando un evento chiude (`closesAt` < ora), viene automaticamente processato quando la homepage viene caricata
2. **Calcolo Payout**: Le previsioni vincenti ricevono crediti proporzionali alla loro scommessa
3. **Aggiornamento Statistiche**: Accuracy, totalEarned, totalSpent vengono aggiornati automaticamente
4. **Esclusione dalla Homepage**: Gli eventi risolti non appaiono più nella homepage

### API Endpoints

- `POST /api/events/resolve-closed` - Elenco eventi chiusi in attesa di risoluzione (admin/cron)
- `POST /api/admin/events/[id]/resolve` - Risolve un evento AMM (outcome YES/NO, payout 1 per share ai vincenti)
- `GET /api/cron/resolve-events` - Endpoint per cron job esterni (richiede `CRON_SECRET`)
- `GET|POST /api/cron/generate-events` - Pipeline generazione eventi (ingestion → storyline → rulebook → publish); richiede `CRON_SECRET`. Con `EVENT_GEN_V2=true` usa pipeline v2.0 (marketId PM-YYYY-NNNNN, sourceType=NEWS)

### Come Funziona

1. Tutti gli eventi sono mercati AMM (Polymarket-style): prezzo = probabilità, 1 share = 1 credit a risoluzione.
2. Quando un evento chiude, l'admin risolve da Admin → Risoluzione (outcome YES o NO).
3. I vincenti ricevono 1 credit per ogni share dell'esito vincente; i perdenti 0.
4. Le transazioni SHARE_PAYOUT e il saldo (creditsMicros) vengono aggiornati.

### Configurazione Cron Job (Produzione)

- **Risoluzione eventi chiusi**: `GET /api/cron/resolve-events` – richiede header `Authorization: Bearer CRON_SECRET`.
- **Generazione eventi (pipeline)**: `GET|POST /api/cron/generate-events` – richiede `Authorization: Bearer CRON_SECRET`. Esegue ingestion → storyline → rulebook validator → publish. Con `EVENT_GEN_V2=true` usa pipeline v2.0 (marketId, sourceType=NEWS). In `vercel.json` schedule `0 8,20 * * *` (due run al giorno alle 08:00 e 20:00 UTC).
- **Attività simulata (Feed 2.0)**: `GET|POST /api/cron/simulate-activity` – richiede **`CRON_SECRET`** e **`ENABLE_SIMULATED_ACTIVITY=true`**. I bot creano previsioni, commenti, reazioni, follow e **post nel feed** (tab Eventi). In locale: nessun cron; usa **Admin → Esegui attività simulata** per popolare il feed. In prod il cron è in `vercel.json` (`30 * * * *`, ogni ora al minuto 30).
- **Generazione immagini post (Feed 2.0)**: `GET|POST /api/cron/generate-post-images` – richiede **`CRON_SECRET`**. Processa post con tipo AI_IMAGE e `aiImageUrl` ancora null (es. per recuperare fallimenti del trigger in background). In `vercel.json` è configurato con schedule `15 * * * *` (ogni ora al minuto 15).

#### Variabili d’ambiente per Feed 2.0 (attività simulata e immagini AI)

- **ENABLE_SIMULATED_ACTIVITY** – `true` o `1` per abilitare il cron simulate-activity e il pulsante admin.
- **CRON_SECRET** – obbligatorio in prod per l’autenticazione del cron (incluso simulate-activity).
- **OPENAI_API_KEY** e **BLOB_READ_WRITE_TOKEN** – richiesti per la generazione delle immagini AI nelle card feed (post tipo AI_IMAGE). Senza questi, le card mostrano un placeholder.
- **NEXTAUTH_URL** – in prod serve per il trigger in background delle immagini (fetch verso `/api/ai/generate-event-image`). Vedi `.env.example`.

#### Variabili d’ambiente per generate-events

- **CRON_SECRET** (obbligatorio) – usato da Vercel Cron e per trigger manuale.
- **DATABASE_URL** – richiesto. **EVENT_GEN_V2** (opzionale) – se `true` usa pipeline v2.0 con marketId e sourceType=NEWS.

#### Come funziona il cron (Vercel)

Vercel invoca l’URL del cron (es. `https://tuo-progetto.vercel.app/api/cron/generate-events`) con metodo **GET** e aggiunge automaticamente l’header `Authorization: Bearer <CRON_SECRET>` se `CRON_SECRET` è impostato nelle Environment Variables del progetto. Non serve configurare nulla oltre a `vercel.json` e le variabili d’ambiente.

#### Trigger manuale

```bash
# GET (stesso comportamento del cron; publishCount = 5)
curl -X GET "https://tuo-progetto.vercel.app/api/cron/generate-events" \
  -H "Authorization: Bearer YOUR_CRON_SECRET"

# POST con numero di mercati da pubblicare (opzionale)
curl -X POST "https://tuo-progetto.vercel.app/api/cron/generate-events" \
  -H "Authorization: Bearer YOUR_CRON_SECRET" \
  -H "Content-Type: application/json" \
  -d '{"publishCount": 10}'
```

#### Verificare che il cron sia eseguito

- **Log**: In Vercel → Project → Logs, filtra per `/api/cron/generate-events`. In caso di successo vedrai `eventGenV2`, `createdCount`, ecc.
- **Risposta HTTP**: La risposta JSON contiene `success`, `eventGenV2`, `result` con `createdCount`, `eligibleStorylinesCount`, ecc.
- **Database**: Verifica che il numero di eventi/mercati creati aumenti dopo una run (es. conta i record creati dopo l’orario dell’ultimo cron, o usa Prisma Studio / query SQL sulla tabella degli eventi con `createdAt` recente).

Variabili d’ambiente e flusso dettagliato: **[docs/PIPELINE_CRON.md](docs/PIPELINE_CRON.md)**.

```bash
# GitHub Actions / Altri servizi: chiama con header
# Authorization: Bearer YOUR_CRON_SECRET
```

## Prossimi Step

Vedi il file `roadmap_gioco_previsioni_*.plan.md` per la roadmap completa.
