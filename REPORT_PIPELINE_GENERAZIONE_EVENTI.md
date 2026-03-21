# Report: Pipeline di generazione eventi (dalla A alla Z)

**Obiettivo:** capire cosa fa il sistema quando genera eventi, in linguaggio semplice, senza entrare nell’architettura tecnica.

---

## In sintesi: cosa fa il sistema

Il sistema **cerca notizie e segnali** da varie fonti, **li trasforma in “domande sì/no”** adatte a un prediction market, **li filtra** con regole di qualità e risolvibilità, **li ordina** e **ne pubblica un certo numero** come eventi aperti sulla piattaforma.  
Tutto questo avviene in una **pipeline unica** che puoi lanciare a mano (pannello admin) o in automatico (cron).

---

## 1. Chi fa partire il processo

- **Cron (automatico):** l’endpoint `POST /api/cron/generate-events` viene chiamato in base allo scheduler (es. 2 volte al giorno). Se la generazione è disabilitata (`DISABLE_EVENT_GENERATION=true`) risponde “ok, disabilitato” e non fa nulla.
- **Admin (manuale):** da pannello admin puoi lanciare la generazione con `POST /api/admin/run-generate-events` (stessa pipeline, eventuale limite di eventi per run).

In entrambi i casi viene eseguita **una sola pipeline**: **Event Gen v2** (`runEventGenV2Pipeline`).  
Non viene più usata la vecchia pipeline “fetch NewsAPI → verifica → LLM → crea eventi”.

---

## 2. Quale “strada” prende la pipeline

La pipeline può seguire **tre strade** diverse, in base a variabili d’ambiente:

| Condizione | Strada | In breve |
|------------|--------|----------|
| `USE_DISCOVERY_BACKED_PIPELINE=true` | **Discovery-backed** | Prende “lead” dal motore di discovery (registry → connector → dedup → cluster → trend → estrazione lead), li converte in “osservazioni” e poi in candidati tramite la pipeline MDE. |
| `CANDIDATE_EVENT_GEN=true` (e discovery non attivo) | **Trend** | Usa i “trend” dal Trend Detection Engine. Da ogni trend genera candidati (con AI o con regole), poi valida, punteggia, deduplica e pubblica. |
| Altrimenti | **Storyline** | Usa le “storyline elegibili” (cluster di articoli già in DB). Da ogni storyline genera candidati con template, poi valida, punteggia, deduplica e pubblica. |

Quindi: **prima** il sistema decide *da dove* prendere le idee (discovery / trend / storyline), **poi** per tutte e tre le strade fa **gli stessi passi** verso la pubblicazione: validazione rulebook → punteggio qualità → deduplica → selezione → pubblicazione.

---

## 3. Da dove arrivano i dati (le “informazioni”)

Dipende dalla strada.

### 3a. Strada **Storyline** (default se nessun flag attivo)

- I dati **non** vengono cercati in questo momento: la pipeline usa **articoli e cluster già presenti nel database**.
- Questi articoli e cluster arrivano da un **altro processo**, l’**ingestion**, che gira separatamente (es. con uno script o un altro cron):
  - **NewsAPI**: articoli per parole chiave (Italia, politica, sport, tecnologia, economia, cronaca), lingua italiana.
  - **RSS**: feed media e feed “ufficiali” (es. ANSA, siti istituzionali).
  - **Calendari**: eventi sportivi, earnings.
- L’ingestion: scarica gli articoli, deduplica per URL, raggruppa articoli simili (Jaccard) in **cluster**, e salva tutto in `SourceArticle` e `SourceCluster`.
- La pipeline di generazione eventi **legge** i cluster che hanno abbastanza articoli recenti e che superano soglie di **momentum**, **novelty** e **authority** (fonte ufficiale o reputabile). Questi sono le “storyline elegibili”.

Quindi, in linguaggio semplice: **per la strada storyline, le “informazioni” sono le notizie già raccolte e raggruppate dall’ingestion** (NewsAPI, RSS, calendari). La generazione eventi non fa fetch di nuove notizie in questo passo.

### 3b. Strada **Trend**

- I **trend** vengono dal **Trend Detection Engine**: sono topic/segnali già elaborati (non fetch diretto in questo step).
- La pipeline prende un numero limitato di trend (es. 50) e per ciascuno genera uno o più **candidati evento**:
  - se `AI_EVENT_GENERATOR=true`: usa un generatore AI da trend;
  - altrimenti: usa regole/template (candidate-event-generator) per trasformare il trend in candidati.

Quindi: **le “informazioni” sono i trend già calcolati dal sistema**; la pipeline li trasforma in candidati evento.

### 3c. Strada **Discovery-backed**

- I **lead** vengono dal **Discovery Lead Supplier**: registro sorgenti → connector/adapter per ogni sorgente → normalizzazione → deduplica → clustering → trend → ranking → estrazione di “event lead”.
- Ogni lead viene convertito in una **SourceObservation** (adapter di foundation) e poi passato alla **pipeline MDE** (`runMdePipelineFromObservation`), che da una singola osservazione produce un **candidato pubblicabile** (titolo, criteri di risoluzione, scadenza, ecc.).

Quindi: **le “informazioni” sono i lead forniti dal motore di discovery**; la pipeline li converte in osservazioni e poi in candidati tramite MDE.

---

## 4. Da “dati/lead” a “candidati evento”

- **Storyline:**  
  Per ogni storyline elegibile, il **Candidate Generator** (con supporto ai template e alla authority) costruisce fino a N candidati (titolo domanda sì/no, descrizione, categoria, `closesAt`, autorità di risoluzione, criteri sì/no). Usa template per categoria/fonte e calcola la scadenza in modo deterministico.

- **Trend:**  
  Per ogni trend, o il generatore AI o il candidate-event-generator produce una lista di candidati nello stesso formato (titolo, categoria, `closesAt`, criteri, ecc.).

- **Discovery-backed:**  
  Per ogni lead convertito in SourceObservation, la **pipeline MDE** fa: interpretazione osservazione → candidato evento → evento canonico → opportunità → tipo di contratto → esiti → scadenza e fonti → market draft → titolo/summary/rulebook → **PublishableCandidate**. Poi questo viene adattato al formato “candidato” dell’app (con titolo, criteri, host authority, ecc.).

In tutti i casi in uscita hai una lista di **candidati** (titolo, descrizione, categoria, `closesAt`, authority, criteri di risoluzione, eventuale URL fonte, ecc.).

---

## 5. Filtri e controlli prima della pubblicazione

Sulla lista di candidati il sistema fa, in ordine:

1. **Rulebook (validateCandidates)**  
   Controlli di regole: titolo valido, categoria ammessa, criteri di risoluzione sensati, niente claim non verificabili, ecc. I candidati che non passano vengono scartati e contati per “motivo di rigetto”.

2. **Quality scoring (scoreCandidates)**  
   A ogni candidato viene assegnato un punteggio di qualità (momentum, novelty, authority, chiarezza, ecc.). Serve per ordinare e poi selezionare i “migliori”.

3. **Deduplica (dedupCandidates)**  
   Confronto con gli eventi già presenti in DB (es. stesso titolo normalizzato o stessa chiave dedup): i duplicati vengono esclusi e contati.

4. **Selezione (selectCandidatesWithInfo)**  
   In base a: quanti eventi aperti ci sono già, target di eventi aperti, cap per categoria, `maxNewPerRun` (es. da admin), e punteggio qualità, il sistema sceglie **quanti e quali** candidati sono effettivamente da pubblicare. Il resto viene scartato (e puoi avere diagnostica tipo “need=0” o “tutti filtrati da cap”).

Quindi: **prima di scrivere nulla in DB, il sistema filtra per regole, punteggia, toglie duplicati e seleziona solo un sottoinsieme**.

---

## 6. Pubblicazione (scrittura in DB)

- La funzione **publishSelectedV2** prende i candidati **selezionati** e per ciascuno:
  - assegna un **marketId** (progressivo per anno),
  - prepara i dati v2 (sourceType=NEWS, resolution sources, generator version, punteggi di generazione, timezone),
  - genera un **image brief** per l’immagine dell’evento e verifica la conformità alle regole immagini (rulebook v2),
  - chiama la logica di **publish** che crea l’**Event** nel DB: titolo, descrizione, categoria, `closesAt`, autorità di risoluzione, criteri sì/no, stato OPEN, `resolutionStatus` (es. PENDING o NEEDS_REVIEW se il validator lo richiede), `dedupKey`, utente sistema, parametri di mercato (b, resolutionBufferHours), ecc.,
  - crea lo stato AMM per l’evento e scrive **AuditLog** (azione EVENT_CREATE, source event-generation).

- Se qualcosa fallisce (es. validazione immagine bloccante, dedupKey mancante), quell’evento non viene creato e il motivo viene contato in `reasonsCount` (es. `skipped`, `IMAGE_VALIDATION_BLOCK`).

Quindi: **“pubblicare” = scrivere in DB l’evento OPEN, con tutti i campi e i metadati, e registrare l’azione in audit**. Da lì l’evento compare nelle API e nelle pagine (Eventi, Discover, feed, ecc.) come evento su cui si può scommettere.

---

## 7. Riepilogo linea A→Z (in linguaggio semplice)

1. **Chi parte:** Cron o admin → parte sempre la pipeline Event Gen v2.
2. **Da dove prende le idee:**  
   - **Storyline:** articoli già in DB (raccolti prima dall’ingestion: NewsAPI, RSS, calendari), raggruppati in cluster e filtrati per momentum/novelty/authority.  
   - **Trend:** trend già calcolati dal Trend Detection Engine.  
   - **Discovery:** lead dal Discovery Engine (registry → connector → dedup → cluster → trend → lead) convertiti in osservazioni e poi in candidati tramite MDE.
3. **Cosa fa con le idee:** Le trasforma in “candidati evento” (domanda sì/no, categoria, scadenza, criteri di risoluzione, fonte) tramite generator/template o pipeline MDE.
4. **Controlli:** Rulebook (regole), punteggio qualità, deduplica, selezione (target eventi aperti, cap per categoria, max per run).
5. **Pubblicazione:** Per ogni candidato selezionato: assegna marketId, controlla immagini, crea l’evento OPEN nel DB, crea stato AMM e audit.  
Ecco la linea dalla A alla Z: **dalla ricerca/uso delle informazioni (ingestion o discovery o trend) fino alla pubblicazione degli eventi nel DB e quindi sulla piattaforma**.

---

## 8. Cose utili da ricordare

- **Ingestion e generazione eventi sono separati:** l’ingestion riempie il DB di articoli e cluster; la pipeline di generazione eventi **legge** quei dati (strada storyline) o usa trend/discovery, e poi crea solo gli **eventi** (record `Event`).
- **Una sola pipeline attiva:** cron e admin usano sempre `runEventGenV2Pipeline`; quale delle tre strade (discovery / trend / storyline) si usa dipende dai flag d’ambiente.
- **“Pubblicare”** qui significa **creare l’evento nel database** con stato OPEN e tutti i metadati; non c’è un altro step “pubblica su social” o simile: l’evento è già visibile alle API e al frontend una volta creato.

Fine del report.
