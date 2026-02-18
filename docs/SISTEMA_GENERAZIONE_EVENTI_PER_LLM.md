# Sistema di generazione eventi – Guida completa per revisione strategia (LLM)

Questo documento descrive **per filo e per segno** l’intero sistema di generazione eventi della piattaforma prediction market: dalla raccolta notizie alla scrittura in DB. Serve a un LLM (es. ChatGPT) per capire come funziona oggi e per rivedere/migliorare la strategia.

---

## 1. Panoramica end-to-end

Il flusso è una **pipeline in 6 fasi**:

1. **Fetch** – Recupero candidati (notizie) da fonte esterna (NewsAPI.ai).
2. **Ranking** – Ordinamento per “hype” (recency + fonte) e boost fonti italiane; eventuali pesi da feedback.
3. **Verifica** – Filtro qualità/risolvibilità (domini, titoli vaghi, date passate, score).
4. **Generazione** – Per ogni candidato verificato, una chiamata LLM (OpenAI o Anthropic) produce un evento strutturato (titolo SÌ/NO, categoria, closesAt, resolutionSourceUrl, resolutionNotes).
5. **Scadenza (closesAt)** – Calcolo deterministico di `closesAt` a partire da data esito (testo o hint LLM) o da default per categoria; eventi incoerenti (es. esito nel passato) vengono scartati.
6. **Creazione in DB** – Validazione finale, anti-duplicati, scrittura `Event` con utente sistema e AuditLog.

**Punti di ingresso:**

- **Cron:** `GET /api/cron/generate-events` (schedule: `0 8,20 * * *` UTC, cioè 2 volte al giorno). Mantiene un numero target di eventi aperti; se sotto soglia esegue la pipeline.
- **Admin:** `POST /api/admin/run-generate-events` – stessa pipeline, invocabile a mano (con fallback su candidati di esempio se il fetch restituisce 0).

---

## 2. Fase 1 – Fetch candidati (event-sources)

**Moduli:** `lib/event-sources/` (index, types, newsapi-ai).

- **Funzione principale:** `fetchTrendingCandidates(limit)`.
- **Fonte attuale:** NewsAPI.ai (Event Registry), endpoint `getArticles`.
  - Parametri fissi: keyword OR tra "Italia", "politica", "sport", "tecnologia", "economia", "cronaca"; lingua `ita`; sort by date; max 31 giorni (free tier); fino a 100 articoli per richiesta.
- **Config da env:** `EventSourcesConfig` (timeout, retry, lingua, maxAgeHours, domainBlacklist, cacheTtlSeconds). Default: italiano, 7 giorni, cache 1h.
- **Output:** array di `NewsCandidate`: `{ title, snippet, url, sourceName, publishedAt, rawCategory? }`.
- **Deduplica:** per URL (lowercase); ordine per `publishedAt` (più recenti prima).
- **Cache:** se `cacheTtlSeconds > 0`, una volta riempita la cache le chiamate successive servono da cache (stesso processo).

**Limitazione:** una sola fonte (NewsAPI.ai). Se l’API fallisce o restituisce 0 risultati, in admin si usa un **fallback** con candidati di esempio hardcoded (`FALLBACK_CANDIDATES` in `lib/event-generation/fallback-candidates.ts`).

---

## 3. Fase 2 – Ranking (ingestion)

**Moduli:** `lib/ingestion/` (hype-scorer, italy-sources).

- **Funzione:** `rankByHypeAndItaly(candidates, options)`.
- **Hype score (0–1):**
  - **Recency:** 0–1 in base all’età dell’articolo (es. full score ≤6h, decay fino a 7 giorni). Peso default 0.6.
  - **Source:** 0.5 base; 1 per fonti “Italia” (whitelist domini/nomi); 0.7–0.8 per Reuters/AP/BBC/CNN. Peso default 0.4.
  - Se sono forniti `sourceWeights` (dal feedback loop), il punteggio della fonte viene moltiplicato per il peso (priorità alle fonti che performano bene sui mercati).
- **Boost Italia:** opzione `boostItaly: true` (default) moltiplica lo score per `ITALY_SOURCE_BOOST` per le fonti italiane.
- **Output:** stesso array di candidati, **ordinato per score decrescente**.

Le liste “Italia” sono in `italy-sources.ts` (domini e nomi fonte).

---

## 4. Fase 3 – Verifica candidati (event-verification)

**Moduli:** `lib/event-verification/` (verify, criteria, config, types).

- **Funzione principale:** `verifyCandidates(candidates, config?)`.
- **Config:** `VerificationConfig` (whitelist/blacklist domini, min/max lunghezza titolo, parole vaghe, parole non-binarie, filterByScore, minVerificationScore). Caricata da env (e opzionale file JSON per domini).
- **Filtri hard (candidato scartato):**
  - Dominio non consentito (blacklist; se whitelist non vuota, deve essere in whitelist).
  - Titolo “troppo vago”: lunghezza fuori range o presenza di parole in `vagueKeywords` (es. "potrebbe", "forse", "?", "breaking").
  - Data esito nel passato: si usa `parseOutcomeDateFromText(title + snippet)` da `lib/event-generation/closes-at.ts`; se restituisce una data e questa è < now, il candidato viene scartato.
- **Score di verificabilità (0–1):**
  - Base 0.4 se supera i filtri minimi (domainAllowed, notTooVague).
  - +0.25 se binaryOutcome (titolo non suggerisce esito non binario, euristiche da `nonBinaryKeywords`).
  - +0.2 se hasOfficialSource (dominio/source in lista “ufficiali”, es. ansa, reuters, gov, ministero).
  - +0.15 se plausibleDeadline (regex su titolo+snippet per “entro”, date, “domani”, “nel 2025”, ecc.).
- Se `filterByScore` è true (default), si scartano candidati con score < `minVerificationScore` (default 0.25).
- **Output:** array di `VerifiedCandidate` = NewsCandidate + `verificationScore`, **ordinato per verificationScore decrescente**.

---

## 5. Fase 4 – Generazione con LLM (event-generation: generate, llm-*, prompts, schema)

**Moduli:** `lib/event-generation/generate.ts`, `llm-openai.ts`, `llm-anthropic.ts`, `prompts.ts`, `schema.ts`, `config.ts`.

### 5.1 Configurazione LLM

- **Env:** `GENERATION_PROVIDER` (openai | anthropic), `OPENAI_API_KEY` / `ANTHROPIC_API_KEY`, `GENERATION_MODEL`, `GENERATION_MAX_RETRIES`.
- Default model: OpenAI `gpt-4o-mini`, Anthropic `claude-3-5-haiku-20241022`.

### 5.2 Selezione candidati da processare

- I candidati verificati sono già ordinati per score. Si prendono i primi fino a `maxTotal` (e non si applica qui un cap per categoria: il cap per categoria si applica **dopo** la generazione sugli eventi generati).
- Quindi: si inviano all’LLM i primi N candidati (N = maxTotal dalla pipeline/cron).

### 5.3 Prompt

- **System prompt:** definito in `prompts.ts`. Include: data di oggi (runtime), regole obbligatorie (titolo = domanda SÌ/NO, categorie ammesse, risolvibilità, resolutionSourceUrl = URL notizia, resolutionNotes), coerenza temporale (niente eventi passati o oltre 2 anni), formato JSON di output.
- **User prompt:** titolo notizia, snippet, URL, fonte; richiesta esplicita di restituire un JSON con `events` (array di oggetti con title, description, category, closesAt, resolutionSourceUrl, resolutionNotes, opzionali eventDate e type shortTerm/mediumTerm). Se notizia datata o troppo lontana, restituire `events: []`.

### 5.4 Chiamata e parsing

- Per **ogni** candidato verificato (fino a maxTotal) si fa **una** chiamata al provider (OpenAI o Anthropic).
- Risposta: si estrae JSON (rimozione eventuale markdown code block), si parse con Zod (`parseGeneratedEvents`): accetta sia array sia `{ events: [...] }`. Si prende il **primo** evento dell’array (1 candidato → al massimo 1 evento).
- Se l’LLM restituisce 0 eventi o parsing fallisce, si fa retry fino a `maxRetries`; oltre si salta il candidato e si continua.

### 5.5 Calcolo closesAt (Fase 4 – coerenza temporale)

**Modulo:** `lib/event-generation/closes-at.ts` (+ `config.ts` per regole).

- **Funzione:** `computeClosesAt(candidate, generated, category, rules?)` → `ClosureResult`: `{ ok: true, closesAt }` oppure `{ ok: false, reject: true, reason }`.
- **Ordine di decisione:**
  1. **Data esito da testo:** `parseOutcomeDateFromText(title + snippet + generated.title + description)`. Supporta “entro N mesi”, “fine 2024”, “dicembre 2025”, date esplicite (ISO, DD/MM/YYYY, “15 marzo 2025”), ecc. Se trovata:
     - Se data esito < now → **reject** (evento nel passato).
     - Se data esito > now + maxHorizonDays (default 730) → **reject** (troppo lontano).
     - Altrimenti: `closesAt = data esito - hoursBeforeEvent` (default 1h); se prima di `now + minHoursFromNow` (default 24h), si clampa a quest’ultimo.
  2. **eventDate dall’LLM:** se `generated.eventDate` (ISO) è valida, stessa logica: reject se passato o oltre orizzonte; altrimenti closesAt = eventDate - hoursBeforeEvent (e clamp min).
  3. **Nessuna data:** si usa `type` (shortTerm / mediumTerm) o `defaultDaysByCategory[category]`. shortTerm = 7 giorni, mediumTerm = 21 giorni; default per categoria in config (es. Sport 7, Tecnologia 14). closesAt = now + giorni; rispettando minHoursFromNow.

Se `computeClosesAt` restituisce `ok: false`, l’evento generato per quel candidato viene **scartato** (non entra nella lista da creare in DB).

### 5.6 Cap per categoria e maxTotal (post-generazione)

- Dopo aver raccolto tutti gli eventi generati (e filtrati per closesAt), si applica `applyCategoryCaps(events, options)`:
  - Ordine: per **categoryWeights** decrescente (se forniti dal feedback: categorie con più successo hanno peso più alto e vengono privilegiate).
  - Si riempie una lista rispettando: max N per categoria (`maxPerCategory`), max totale `maxTotal`. Gli eventi in eccesso (stessa categoria o oltre maxTotal) vengono scartati.

**Output Fase 4:** array di `GeneratedEvent`: `{ title, description, category, closesAt, resolutionSourceUrl, resolutionNotes }` (closesAt già calcolato dal nostro codice, non dall’LLM).

---

## 6. Fase 5 – Creazione in DB (create-events, validator, audit)

**Moduli:** `lib/event-generation/create-events.ts`, `lib/validator`, `lib/audit`, `lib/pricing/initialization`, `lib/markets`.

- **Funzione:** `createEventsFromGenerated(prisma, generatedEvents)`.
- **Creatore:** `getEventGeneratorUserId(prisma)`: env `EVENT_GENERATOR_USER_ID`, altrimenti utente `event-generator@system`, altrimenti primo admin. Se nessuno trovato → throw.
- **Per ogni evento:**
  1. **Validazione payload:** `validateEventPayload(ev)` – titolo non vuoto, categoria in ALLOWED_CATEGORIES, closesAt valida e nel futuro, resolutionSourceUrl e resolutionNotes obbligatorie.
  2. **Validazione market:** `validateMarket(...)` – regole “hard” (fall → evento non creato) e “needs review” (se flaggato → `resolutionStatus: "NEEDS_REVIEW"` invece di `PENDING`).
  3. **Anti-duplicati:** titolo normalizzato (lowercase, trim, spazi collassati) già presente tra eventi **non risolti** → skip (conteggiato in `skipped`).
  4. **Creazione:** `prisma.event.create` con b (LMSR) da categoria, `resolutionBufferHours` da categoria, `resolutionStatus` da validazione. AuditLog: action `EVENT_CREATE`, entityType `event`, payload con source `event-generation` e eventuale needsReview.
- **Risultato:** `CreateEventsResult`: `{ created, skipped, errors, eventIds }`.

---

## 7. Feedback loop (analytics)

**Modulo:** `lib/analytics/feedback-loop.ts`.

- **Funzione:** `getFeedbackFromMetrics(prisma, options)`.
- **Scopo:** dare alla pipeline pesi per **categoria** e **fonte** (hostname di resolutionSourceUrl) in base al “successo” dei mercati (MarketMetrics.successScore).
- **Nota importante:** nel codice attuale **MarketMetrics non esiste nello schema**; quindi `metrics` è vuoto e `eventScores` resta vuoto. Di fatto `categoryWeights` e `sourceWeights` sono oggetti vuoti; la pipeline li usa ma non cambiano il comportamento finché non ci sono metriche reali.
- Quando ci saranno metriche: i pesi sono normalizzati in (0.5, 1]; le categorie/fonti con score più alto ottengono 1, le altre proporzionalmente. Questi pesi vengono usati in `runPipeline` per `generation.categoryWeights` e in `rankByHypeAndItaly` per `sourceWeights`.

---

## 8. Pipeline unica (run-pipeline)

**Modulo:** `lib/event-generation/run-pipeline.ts`.

- **Funzione:** `runPipeline(prisma, options?)`.
- **Options:** `limit` (candidati da fetch, default 80), `candidatesOverride` (salta fetch, usa questi), `verificationConfig` (override config verifica), `generation` (maxPerCategory, maxTotal, maxRetries, provider, categoryWeights).
- **Sequenza:**
  1. Legge feedback: `getFeedbackFromMetrics(prisma, { lookbackHours: 720, minEvents: 1 })` → categoryWeights, sourceWeights.
  2. Candidati: `options.candidatesOverride ?? await fetchTrendingCandidates(limit)`.
  3. Ranking: `rankByHypeAndItaly(candidates, { boostItaly: true, sourceWeights })`.
  4. Verifica: `verifyCandidates(candidates, verificationConfig ?? getVerificationConfigFromEnv())`.
  5. Generazione: `generateEventsFromCandidates(verified, genOpts)` (genOpts include categoryWeights, maxPerCategory, maxTotal, maxRetries, provider).
  6. Creazione: `createEventsFromGenerated(prisma, generated)`.
- **Ritorno:** `{ candidatesCount, verifiedCount, generatedCount, createResult }`.

---

## 9. Cron e Admin

### 9.1 GET /api/cron/generate-events

- **Auth:** Bearer con `CRON_SECRET` o `EVENT_GENERATOR_SECRET` (in produzione almeno uno deve essere configurato).
- **Logica:** conta eventi aperti (non risolti, closesAt > now). Target da env `TARGET_OPEN_EVENTS` (default 20). `needToGenerate = min(target - openCount, maxPerRun)` (maxPerRun da env, default 15). Se needToGenerate ≤ 0 risponde con metriche a 0 e non esegue la pipeline. Altrimenti chiama `runPipeline(prisma, { limit, generation: { maxPerCategory, maxTotal, maxRetries } })`. Query params opzionali: limit, maxPerCategory, maxTotal.
- **Risposta:** success, timestamp, openCount, target, needToGenerate, candidatesCount, verifiedCount, generatedCount, created, skipped, errors, eventIds.

### 9.2 POST /api/admin/run-generate-events

- **Auth:** solo admin (`requireAdmin`).
- **Body:** opzionale `{ maxTotal }` (1–20, default 10).
- **Logica:** esegue `runPipeline` con limit 60, maxPerCategory 5, maxTotal dal body. Se **candidatesCount === 0 e created === 0**, riesegue la pipeline con `candidatesOverride: FALLBACK_CANDIDATES` e `verificationConfig: getFallbackVerificationConfig()` (così in assenza di notizie si usano comunque eventi di esempio con date future).

---

## 10. Variabili d’ambiente rilevanti

- **Event sources:** `NEWS_API_KEY`, `EVENT_SOURCES_TIMEOUT_MS`, `EVENT_SOURCES_MAX_RETRIES`, `EVENT_SOURCES_LANGUAGE`, `EVENT_SOURCES_MAX_AGE_HOURS`, `EVENT_SOURCES_CACHE_TTL`.
- **Verifica:** `EVENT_VERIFICATION_DOMAIN_WHITELIST`, `EVENT_VERIFICATION_DOMAIN_BLACKLIST`, `EVENT_VERIFICATION_DOMAINS_FILE`, `EVENT_VERIFICATION_MIN_TITLE_LENGTH`, `EVENT_VERIFICATION_MAX_TITLE_LENGTH`, `EVENT_VERIFICATION_FILTER_BY_SCORE`, `EVENT_VERIFICATION_MIN_SCORE`.
- **Generazione:** `GENERATION_PROVIDER`, `OPENAI_API_KEY`, `ANTHROPIC_API_KEY`, `GENERATION_MODEL`, `GENERATION_MAX_RETRIES`; opzionale `GENERATION_INSECURE_SSL=1` (solo dev).
- **Chiusura:** `CLOSURE_MIN_HOURS`, `CLOSURE_HOURS_BEFORE_EVENT`, `CLOSURE_MAX_HORIZON_DAYS`.
- **Cron/creatore:** `CRON_SECRET` o `EVENT_GENERATOR_SECRET`; `TARGET_OPEN_EVENTS`, `GENERATE_EVENTS_MAX_PER_RUN`; `EVENT_GENERATOR_USER_ID`.

---

## 11. Categorie ammesse

Lista fissa in `lib/event-generation/types.ts`: **Sport, Politica, Tecnologia, Economia, Cultura, Scienza, Intrattenimento.**  
Coerente con prompt LLM e con schema/seed.

---

## 12. Dove intervenire per migliorare la strategia

- **Fonti:** oggi solo NewsAPI.ai; keyword e filtri fissi. Possibile: più fonti, keyword/configurazione per categoria o per “trend”, diversificazione lingue.
- **Ranking:** pesi recency/source fissi; boost Italia on/off. Il feedback (sourceWeights/categoryWeights) è pronto ma senza MarketMetrics non ha effetto. Possibile: tuning pesi, segnali aggiuntivi (engagement, social).
- **Verifica:** soglia score, liste vaghe/non-binarie, whitelist/blacklist domini. Possibile: soglie per categoria, parole chiave per lingua/tema, uso di un LLM per “verificabilità” prima della generazione.
- **LLM:** un evento per candidato, un solo provider per run. Possibile: batch di candidati per chiamata, A/B provider, prompt più ricchi (esempi, few-shot), controlli post-LLM (duplicati semantici, qualità titolo).
- **ClosesAt:** regole conservative (min 24h, max 2 anni). Possibile: buffer per categoria diversi, orizzonti diversi per tipo di evento.
- **Cap e priorità:** maxPerCategory e maxTotal; categoryWeights da feedback (attualmente vuoto). Possibile: bilanciamento categorie, “slot” riservati per temi ad alto engagement.
- **Creazione:** anti-duplicati solo su titolo normalizzato. Possibile: deduplica semantica, merge di eventi molto simili.
- **Cron:** 2 run/giorno; target 20 aperti, max 15 per run. Possibile: frequenza, target e max per run in base al traffico o alla stagionalità.

---

Fine documento. Usare questa descrizione per analizzare il flusso attuale e proporre modifiche concrete alla strategia (es. nuovi filtri, nuovi prompt, nuove fonti, parametri diversi).
