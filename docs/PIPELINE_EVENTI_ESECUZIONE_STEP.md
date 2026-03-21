# Pipeline eventi e Rule of Book – Piano di esecuzione per step (chat separate)

Questo documento definisce **step in ordine sequenziale** per allineare il sistema di generazione eventi al documento (rule of book, Market Specification Framework, trend signal, Event Type prima del titolo, titolo psicologico, pubblico italiano/europeo). Ogni step si esegue in una chat dedicata: prima si **discute** il topic, poi si **implementa**. All'inizio di ogni chat puoi dire: *"Esegui Step N del piano Pipeline eventi Rule of Book"* e incollare la sezione dello step.

**Ordine di esecuzione:** Step 1 → 2 → 3 → 4 → 5 → 6 → 7 → 8 → 9 → 10 (solo in questo ordine).

**Riferimento:** piano di design in `.cursor/plans/event_pipeline_rule_of_book_a880c550.plan.md`.

---

# Step 1 – CRON e fonti: generazione eventi chiama la lettura fonti

**Stato:** [ ] Da eseguire

## Cosa è già stato fatto (step precedenti)
- Nessuno: è il primo step. Oggi il cron `generate-events` non invoca l'ingest: usa dati già in DB (storyline/cluster) o trend cache. L'ingest (`/api/cron/ingest`) gira separatamente (es. ogni ora).

## Obiettivo di questo step
Far sì che il cron di **generazione eventi** chiami la **lettura fonti** (ingest o discovery) **prima** di generare, così il flusso "cron attiva generazione" e "generazione richiama le fonti" è unico. L'ordine diventa: 1) fetch fonti, 2) poi pipeline eventi (storyline/trend/discovery).

## Discussione (cosa decidere in chat prima di implementare)
1. **Punto di invocazione:** All'inizio di `runEventGenV2Pipeline` (in `lib/event-gen-v2/run-pipeline.ts`) oppure all'inizio dell'handler `POST/GET` in `app/api/cron/generate-events/route.ts`? Invocare da route tiene la pipeline "pura" (solo generazione) e la route diventa "fetch + pipeline"; invocare dentro run-pipeline tiene tutto in un unico flusso.
2. **Quale "lettura fonti":** (A) `processAllSources()` da `lib/ingestion/processing/pipeline.ts` (popola SourceArticle/SourceCluster e invalida trend cache). (B) Se `USE_DISCOVERY_BACKED_PIPELINE=true`, i lead vengono da `getDiscoveryBackedEventLeads()` che già usa il discovery engine: serve comunque un fetch "ingest" prima (per avere articoli aggiornati) o il discovery è sufficiente?
3. **Invalida trend cache:** Dopo l'ingest, chiamare `invalidateTrendCache()` (come fa già il cron ingest) così `getTrends()` e storyline vedono dati freschi.

## Implementazione (cosa fare)
- [ ] Decidere dove invocare il fetch fonti (route vs run-pipeline) e documentarlo.
- [ ] Aggiungere la chiamata a `processAllSources()` (e eventuale `invalidateTrendCache()`) nel punto scelto, prima di avviare la pipeline (getEligibleStorylines / getTrends / getDiscoveryBackedEventLeads).
- [ ] Gestire errori: se l'ingest fallisce, loggare e continuare con i dati già in DB oppure fallire la run? Decidere e implementare.
- [ ] (Opzionale) Aggiungere in risposta del cron un campo tipo `ingestRun: true | skipped` per debug.

## Cosa faranno gli step successivi
- **Step 2** (pre-validazione rule of book) e **Step 3** (trend signal) lavorano sulle notizie/candidati che arrivano dalla pipeline; con questo step le notizie sono aggiornate perché le fonti sono state lette subito prima.

## File coinvolti
- `app/api/cron/generate-events/route.ts`
- `lib/event-gen-v2/run-pipeline.ts`
- `lib/ingestion/processing/pipeline.ts` (import/uso di `processAllSources`)
- `lib/trend-detection` (invalidateTrendCache se si usa)

---

# Step 2 – Pre-validazione rule of book sulla notizia grezza

**Stato:** [ ] Da eseguire

## Cosa è già stato fatto (step precedenti)
- **Step 1:** Il cron generate-events invoca la lettura fonti prima della pipeline.

## Obiettivo di questo step
Introdurre un modulo di **pre-validazione**: dato il **corpo notizia** (e metadati: fonte, data), rispondere "può soddisfare il rule of book?" **prima** di generare candidati (titolo, criteri, closesAt). Solo le notizie che passano questo gate entrano nella generazione candidati. La regola è: rule of book come **criterio di ammissibilità** sulla notizia grezza (senza richiedere allineamento esplicito alle 10 sezioni del doc).

## Discussione (cosa decidere in chat prima di implementare)
1. **Input del modulo:** Cosa passa come "notizia grezza"? Per storyline: articoli cluster (titolo, snippet, url, sourceName, publishedAt). Per trend: TrendObject (topic, trend_score, …). Per discovery: EventLead. Definire un tipo minimo comune (es. `{ title, snippet?, url?, sourceName?, publishedAt? }`) e adattatori per ogni path.
2. **Criteri di ammissibilità:** Cosa deve essere vero perché la notizia passi? Es.: (a) si può ricavare una domanda a risposta SÌ/NO (o esiti determinabili); (b) è plausibile una fonte di risoluzione (dominio/url); (c) è plausibile una scadenza; (d) niente termini troppo vaghi (euristica o lista). Non serve implementare le 10 sezioni del doc; basta un check "ammissibile sì/no" + motivo opzionale.
3. **Dove inserire nel flusso:** Subito dopo aver ottenuto i "lead" (storyline eligible, trend list, discovery leads) e **prima** del candidate generator. Quindi: getEligibleStorylines → filtra con pre-validazione → generateCandidates; oppure getTrends → filtra con pre-validazione → generateCandidateEvents; discovery → filtra lead con pre-validazione → runDiscoveryBackedPipelineFromLeads.
4. **Implementazione check:** Euristiche in codice (lunghezza titolo, blacklist parole vaghe, dominio in whitelist) oppure chiamata LLM leggera ("questa notizia può diventare un market a risoluzione deterministica? sì/no"). Decidere in base a costo e accuratezza.

## Implementazione (cosa fare)
- [ ] Creare modulo (es. `lib/event-gen-v2/pre-validate-news.ts` o `lib/rulebook-eligibility/`) con funzione tipo `isNewsEligibleForRuleOfBook(news: RawNewsInput): { eligible: boolean; reason?: string }`.
- [ ] Definire il tipo `RawNewsInput` (o equivalente) e adattatori da storyline article, trend, discovery lead al formato richiesto.
- [ ] Integrare il filtro nei tre path (storyline, trend, discovery-backed): dopo aver ottenuto eligible/trends/leads, filtrare con `isNewsEligibleForRuleOfBook` e far procedere solo gli elementi passati.
- [ ] Loggare o esporre in PipelineRun (o in risposta cron) il numero di notizie scartate per pre-validazione e il motivo principale (opzionale).

## Cosa faranno gli step successivi
- **Step 3** aggiunge un secondo gate (trend signal) dopo questo. **Step 5** (Event Type) e **Step 6** (titolo) lavorano sui candidati che sono già passati da pre-validazione e trend.

## File coinvolti
- Nuovo: `lib/event-gen-v2/pre-validate-news.ts` (o percorso concordato)
- `lib/event-gen-v2/run-pipeline.ts` (integrazione filtro in storyline path)
- `lib/event-gen-v2/discovery-backed-integration.ts` (integrazione filtro su leads)
- Path trend: `lib/candidate-event-generator` o `lib/event-gen-v2/run-pipeline.ts` (integrazione filtro su trends)

---

# Step 3 – Trend signal come gate obbligatorio

**Stato:** [ ] Da eseguire

## Cosa è già stato fatto (step precedenti)
- **Step 1:** Cron chiama fonti prima di generare.
- **Step 2:** Pre-validazione rule of book sulla notizia grezza: solo notizie ammissibili procedono.

## Obiettivo di questo step
Dopo il rule-of-book check, introdurre un **gate obbligatorio**: verificare che esista un **minimo interesse** (es. Google Trends o equivalente) per la notizia/evento. Se sotto soglia, scartare. Definire soglia e fonte (API/connector).

## Discussione (cosa decidere in chat prima di implementare)
1. **Fonte del trend:** (A) API Google Trends (non ufficiale, libreria tipo `google-trends-api` o simile). (B) Trend già presenti in codebase: storyline momentum/novelty, trend detection da articoli (`lib/trend-detection`, `lib/storyline-engine`). Se si usa (B), il "gate" può essere "trend_score >= X" o "momentum >= Y"; non serve una chiamata esterna. (C) Altra API (es. Trend API a pagamento). Decidere in base a costi e affidabilità.
2. **Soglia:** Valore minimo (es. trend_score >= 0.2, o momentum >= 30) sotto cui la notizia viene scartata. Configurabile da env (es. `TREND_GATE_MIN_SCORE`).
3. **Dove applicare:** Dopo pre-validazione, prima di generare candidati. Se il path usa già trend/momentum (storyline, trend path), il gate può essere "scarta se sotto soglia"; se il path è discovery senza score trend, serve estrarre keyword dalla notizia e interrogare un servizio trend (se si sceglie (A) o (C)).

## Implementazione (cosa fare)
- [ ] Definire interfaccia tipo `getTrendSignal(news: RawNewsInput): Promise<number>` (o sincrono se si usano solo score già presenti) e implementazione: (1) se si usa score esistenti: mappare news a storyline/trend e leggere score; (2) se si usa API esterna: estrarre keyword, chiamare API, normalizzare a 0–1.
- [ ] Aggiungere config soglia (env) e funzione `passesTrendGate(news, score): boolean`.
- [ ] Integrare il gate nella pipeline: dopo pre-validazione, applicare trend gate; far procedere solo notizie che passano.
- [ ] Loggare o esporre numero di notizie scartate per trend (opzionale).

## Cosa faranno gli step successivi
- **Step 4** (policy italiano/europeo) può essere un ulteriore filtro su notizie già passate da rule of book e trend. **Step 5** lavora sui candidati generati da notizie che hanno superato tutti i gate.

## File coinvolti
- Nuovo: modulo trend gate (es. `lib/event-gen-v2/trend-gate.ts` o in `lib/trend-detection`)
- `lib/event-gen-v2/run-pipeline.ts`
- `lib/event-gen-v2/discovery-backed-integration.ts`
- `.env.example`: documentare `TREND_GATE_MIN_SCORE` (o nome concordato)

---

# Step 4 – Policy "pubblico italiano/europeo"

**Stato:** [ ] Da eseguire

## Cosa è già stato fatto (step precedenti)
- **Step 1–3:** Cron → fonti, pre-validazione rule of book, trend signal gate.

## Obiettivo di questo step
Gate esplicito: ogni notizia/evento deve essere giudicato **adatto a pubblico italiano/europeo** (lingua, rilevanza, fonti). Le notizie che non passano non entrano in generazione. Può essere implementato come parte del rule-of-book check (Step 2) oppure come step separato dopo discovery/trend; qui lo trattiamo come **step separato** per chiarezza.

## Discussione (cosa decidere in chat prima di implementare)
1. **Criteri:** (a) Lingua: italiano o inglese (o altre EU)? (b) Rilevanza geografica: Italia/Europa esplicita oppure "non solo USA-centric"? (c) Fonte: preferenza domini .it, fonti EU, o whitelist già presente (`lib/ingestion/italy-sources.ts`, `lib/event-verification`).
2. **Dove inserire:** Subito dopo trend gate (Step 3), prima del candidate generator. Oppure integrare nella pre-validazione (Step 2) come secondo blocco: prima ammissibilità rule of book, poi ammissibilità italiano/europeo.
3. **Implementazione:** Euristiche (lingua da titolo/snippet, dominio in lista Italia/EU) vs LLM ("questa notizia è rilevante per un pubblico italiano/europeo? sì/no").

## Implementazione (cosa fare)
- [ ] Creare modulo (es. `lib/event-gen-v2/audience-policy.ts`) con funzione tipo `isSuitableForItalianEuropeanAudience(news: RawNewsInput): { suitable: boolean; reason?: string }`.
- [ ] Implementare i criteri concordati (lingua, dominio, opzionale rilevanza).
- [ ] Integrare il filtro nella pipeline dopo trend gate (o dentro pre-validazione se si sceglie di unificare).
- [ ] Documentare in .env.example eventuali variabili (es. `AUDIENCE_STRICT_EU_ONLY`).

## Cosa faranno gli step successivi
- **Step 5** (Event Type / N formulazioni) e **Step 6** (titolo psicologico) lavorano sui candidati generati da notizie che hanno superato tutti i gate inclusa la policy audience.

## File coinvolti
- Nuovo: `lib/event-gen-v2/audience-policy.ts` (o percorso concordato)
- `lib/event-gen-v2/run-pipeline.ts`
- `lib/event-gen-v2/discovery-backed-integration.ts`

---

# Step 5 – Blocco "Event Type / Market Type" (N formulazioni da macro-notizia)

**Stato:** [ ] Da eseguire

## Cosa è già stato fatto (step precedenti)
- **Step 1–4:** Cron→fonti, pre-validazione rule of book, trend gate, policy italiano/europeo. Solo notizie che passano tutti i gate arrivano qui.

## Obiettivo di questo step
Da una **macro-notizia** (es. "BTC ai massimi storici"): (1) interpretare la notizia; (2) decidere **come** spezzarla in uno o più mercati (es. "Bitcoin oltre 100k entro il 31/03? SÌ/NO", "oltre 105k? SÌ/NO", oppure "Prezzo BTC il 31/03: SOPRA 100K / SOTTO 100K"); (3) uscita = **N formulazioni** di evento (ognuna con propria domanda, soglie, esiti). Questo blocco deve essere **antecedente** al title generator (Step 6). Per ora si può implementare solo il caso **N mercati binari** (più eventi SÌ/NO) senza introdurre multi-outcome (X/Y) nel modello Event se si preferisce ridurre lo scope.

## Discussione (cosa decidere in chat prima di implementare)
1. **Multi-outcome (X/Y) ora o dopo:** Il doc chiede anche mercati tipo "SOPRA 100K / SOTTO 100K". Opzione A: modellare come **due mercati binari** ("Sopra 100k? SÌ/NO" + "Sotto 100k? SÌ/NO") senza cambiare schema Event. Opzione B: estendere il modello Event per **multi-outcome** (outcome non solo YES/NO ma lista di esiti; resolutionCriteria per ogni esito). Per questo step si consiglia A (N formulazioni binarie) e lasciare B a un step successivo.
2. **Chi fa lo "splitting":** Logica euristica (keyword + template per soglie numeriche) oppure LLM ("da questa notizia quali mercati binari si possono creare? elenca titolo + criteri + closesAt per ognuno"). LLM è più flessibile ma costa; euristiche sono più prevedibili.
3. **Input/Output:** Input = notizia già passata da gate (titolo, snippet, url, …). Output = array di "formulazioni" (titolo proposto, resolutionCriteriaYes/No, closesAt, resolutionSourceUrl, categoria). Queste diventano i candidati che poi passeranno al title generator (Step 6) e al rulebook validator esistente.
4. **Dove inserire:** Dopo i gate (Step 2–4), **prima** del candidate generator attuale. Oppure **sostituire** il candidate generator con questo blocco + generazione titolo: prima "Event Type" produce N formulazioni, poi per ognuna si applica il Psychological Title Engine. Chiarire se il candidate generator attuale (template-based o LLM) va sostituito o affiancato.

## Implementazione (cosa fare)
- [ ] Creare modulo (es. `lib/event-gen-v2/event-type-generator.ts` o `macro-news-to-formulations.ts`) con funzione tipo `generateFormulationsFromMacroNews(news, options): Promise<Formulation[]>` dove `Formulation` ha titolo, criteriaYes, criteriaNo, closesAt, resolutionSourceUrl, category.
- [ ] Implementare la logica di splitting (euristica o LLM) e il limite massimo di formulazioni per notizia (es. max 5) per evitare esplosione.
- [ ] Integrare nella pipeline: dopo i gate, per ogni notizia chiamare `generateFormulationsFromMacroNews`; raccogliere tutte le formulazioni e passarle come "candidati" allo step successivo (titolo psicologico, poi rulebook validator, score, dedup, select, publish). Se oggi il candidate generator produce un candidato per storyline, qui si produce N candidati per notizia; il resto della pipeline (validator, score, dedup, publish) resta uguale ma riceve più candidati.
- [ ] Adattare tipi: il tipo `Candidate` in event-gen-v2 deve essere compilabile a partire da `Formulation` (titolo, criteria, closesAt, …).

## Cosa faranno gli step successivi
- **Step 6** applicherà il Psychological Title Engine a ogni formulazione (titolo finale). **Step 7** genererà il Market Specification Framework per ogni evento pubblicato (a partire da candidato/formulation).

## File coinvolti
- Nuovo: `lib/event-gen-v2/event-type-generator.ts` (o nome concordato)
- `lib/event-gen-v2/run-pipeline.ts`
- `lib/event-gen-v2/candidate-generator` (eventuale integrazione o bypass)
- `lib/event-gen-v2/types.ts` (tipo Formulation o estensione Candidate)

---

# Step 6 – Titolo psicologicamente impattante su tutti i path

**Stato:** [ ] Da eseguire

## Cosa è già stato fatto (step precedenti)
- **Step 1–5:** Pipeline con fonti, gate (rule of book, trend, audience), e blocco Event Type che produce N formulazioni per macro-notizia. I candidati a questo punto hanno un titolo "tecnico" o template-based.

## Obiettivo di questo step
Usare il **Psychological Title Engine** (`lib/psychological-title-engine`, `generatePsychologicalTitle`) in **tutti** i path (storyline, trend, discovery-backed), dopo la generazione delle formulazioni/candidati e prima del rulebook validator (o dopo, se il validator accetta il titolo generato). Il titolo finale dell'evento deve essere quello restituito dall'engine (se non null), altrimenti fallback al titolo esistente.

## Discussione (cosa decidere in chat prima di implementare)
1. **Ordine:** Applicare il titolo psicologico **prima** del rulebook validator (così il validator valida il titolo finale) oppure **dopo** (il validator valida il titolo tecnico, poi si "abbellisce" con psychological title)? Il doc dice "titolo studiato per essere psicologicamente impattante" dopo la generazione del rule of book specifico; nel nostro flusso il Market Spec Framework viene generato dopo (Step 7). Quindi: candidato con titolo tecnico → psychological title → candidato con titolo finale → rulebook validator → … è un ordine coerente.
2. **Input dell'engine:** `generatePsychologicalTitle` oggi riceve un `StructuredCandidateEvent` (titolo, category, resolutionCriteriaYes/No, …). Le formulazioni dello Step 5 (o i candidati da storyline/trend) devono essere convertibili in quel formato; eventualmente estendere l'engine per accettare un tipo più generico.
3. **Fallback:** Se `generatePsychologicalTitle` restituisce null o errore, usare il titolo già presente sul candidato.

## Implementazione (cosa fare)
- [ ] Nel path **storyline** (`lib/event-gen-v2/run-pipeline.ts` → `generateCandidates`): dopo aver ottenuto i candidati da `generateCandidates`, per ogni candidato chiamare `generatePsychologicalTitle(candidate)` e, se il risultato non è null, sostituire `candidate.title` con il titolo restituito.
- [ ] Nel path **trend** (candidate-event-generator): già usato in `lib/candidate-event-generator/algorithm.ts`; verificare che sia l'unico punto e che non ci siano path trend che bypassano. Se ci sono, aggiungere la chiamata.
- [ ] Nel path **discovery-backed** (`lib/event-gen-v2/discovery-backed-integration.ts`, `lib/mde-pipeline/publishable-to-app-candidate.ts`): dopo aver mappato a Candidate, applicare `generatePsychologicalTitle` a ogni candidato e aggiornare il titolo.
- [ ] Verificare che il tipo passato a `generatePsychologicalTitle` sia compatibile (StructuredCandidateEvent o adattatore).

## Cosa faranno gli step successivi
- **Step 7** genererà il Market Specification Framework per ogni evento; il titolo usato sarà quello già "psicologico" salvato sull'Event. **Step 8** mostrerà il Market Spec nella "i" della pagina evento.

## File coinvolti
- `lib/psychological-title-engine/generate.ts`
- `lib/event-gen-v2/run-pipeline.ts`
- `lib/event-gen-v2/candidate-generator` (se genera candidati per storyline)
- `lib/event-gen-v2/discovery-backed-integration.ts`
- `lib/candidate-event-generator/algorithm.ts`

---

# Step 7 – Market Specification Framework: generazione e persistenza

**Stato:** [ ] Da eseguire

## Cosa è già stato fatto (step precedenti)
- **Step 1–6:** Pipeline completa con gate, Event Type (N formulazioni), titolo psicologico. Gli eventi vengono creati in DB con `publishSelectedV2`.

## Obiettivo di questo step
Per ogni evento **pubblicato**, generare e **salvare** il documento "Market Specification" (sezioni A–I del doc: Market Metadata, Trading Schedule, Outcomes and Settlement, Underlying Event, Resolution Sources, Resolution Criteria, Edge-Case Rules, Outcome Review Trigger, Market Change Log). Formato: testo strutturato o JSON. Dove salvarlo: campo su Event (es. `marketSpecificationText` o `marketSpecificationJson`) oppure tabella dedicata con relazione a Event.

## Discussione (cosa decidere in chat prima di implementare)
1. **Formato:** Testo markdown/plain (un unico campo `@db.Text`) oppure JSON (strutturato per sezioni A–I) per eventuale rendering in UI. Il JSON permette di mostrare sezioni espandibili; il testo è più semplice.
2. **Dove salvare:** (A) Campo su `Event`, es. `marketSpecificationText String? @db.Text` o `marketSpecificationJson Json?`. (B) Tabella `EventMarketSpecification` con `eventId`, `content` (testo o JSON), `version`. (B) permette storico; (A) è più semplice. Per la "i" nella pagina evento (Step 8) basta leggere un solo documento corrente.
3. **Chi genera il contenuto:** Usare/estendere il DeterministicRulebookCompiler della foundation per produrre un output compatibile con le sezioni A–I, oppure creare un generatore dedicato in app che compila A–I a partire da Event (o da Candidate prima del publish). Il compiler foundation produce già sezioni tipo canonical question, contract, resolution criteria, source policy, time policy, edge cases; mappare a A–I e aggiungere eventuali sezioni mancanti (Market ID, Trading Schedule, Outcome Review, Change Log).
4. **Quando generare:** Alla creazione dell'evento in `publishSelectedV2` (o nella funzione che crea un singolo Event da candidato): dopo `prisma.event.create`, generare il Market Spec e fare `prisma.event.update` con il campo compilato. Oppure job asincrono subito dopo la creazione.

## Implementazione (cosa fare)
- [ ] Aggiungere in `prisma/schema.prisma` il campo su Event (o la tabella dedicata) per il Market Specification. Migrazione.
- [ ] Creare modulo (es. `lib/event-gen-v2/market-spec-generator.ts` o in foundation adapter) che, dato un Event (o Candidate), restituisce il documento A–I in formato concordato (testo o JSON).
- [ ] Integrare la generazione nel flusso di publish: dopo aver creato l'Event, generare il Market Spec e salvarlo sull'evento (o nella tabella).
- [ ] (Opzionale) Se si usa foundation RulebookCompiler: adattare l'output al formato A–I e scriverlo su Event.

## Cosa faranno gli step successivi
- **Step 8** leggerà questo campo (o tabella) e mostrerà il contenuto nella "i" informativa della pagina evento.

## File coinvolti
- `prisma/schema.prisma` (campo Event o nuova tabella)
- Nuovo: `lib/event-gen-v2/market-spec-generator.ts` (o equivalente)
- `lib/event-publishing/publish.ts` o `lib/event-gen-v2/publisher.ts` (chiamata generatore dopo create)
- `foundation-layer/src/publishing/rulebook` (se si riusa il compiler)

---

# Step 8 – Market Specification Framework: visualizzazione nella "i" della pagina evento

**Stato:** [ ] Da eseguire

## Cosa è già stato fatto (step precedenti)
- **Step 1–7:** Eventi creati con Market Specification salvato su Event (o tabella). Il documento contiene le sezioni A–I.

## Obiettivo di questo step
Nella pagina del singolo evento (`app/events/[id]/page.tsx`), esporre il contenuto del **Market Specification** nella **"i" informativa** (icona "i" o sezione "Specifiche mercato" / "Rule of Book"). L'utente può aprire un drawer, modal o sezione espandibile e leggere il documento completo (A–I).

## Discussione (cosa decidere in chat prima di implementare)
1. **Dove mostrare:** (A) Icona "i" accanto al titolo che apre un modal/drawer con il documento. (B) Sezione espandibile "Specifiche mercato" sotto la descrizione. (C) Tab "Rule of Book" se la pagina ha tab. Scegliere in base alla UX esistente.
2. **Formato di lettura:** Se il contenuto è testo (markdown), renderizzarlo con un componente Markdown. Se è JSON, mappare le sezioni A–I a blocchi (titolo + contenuto) con eventuale espansione/collasso.
3. **Eventi senza Market Spec:** Se il campo è null (eventi creati prima dello Step 7), mostrare messaggio "Specifiche non disponibili" oppure nascondere il pulsante "i".

## Implementazione (cosa fare)
- [ ] Assicurarsi che l'API o il data fetching della pagina evento carichi il campo Market Specification (es. `event.marketSpecificationText` o `event.marketSpecificationJson`). Se la pagina usa già un include Prisma, aggiungere il campo.
- [ ] Aggiungere in UI l'elemento che apre la "i" (icona o link "Specifiche mercato").
- [ ] Creare componente (modal, drawer o sezione) che riceve il contenuto e lo renderizza (markdown o sezioni da JSON). Stili leggibili (tipografia, spaziatura).
- [ ] Gestire il caso null: nessun link/icona o messaggio "Non disponibile".

## Cosa faranno gli step successivi
- Nessuno per il Market Spec: questo step conclude la visualizzazione. **Step 9** e **Step 10** riguardano categorie/fonti e ordinamento pipeline.

## File coinvolti
- `app/events/[id]/page.tsx`
- Componente nuovo: es. `components/events/MarketSpecificationModal.tsx` o `MarketSpecificationSection.tsx`
- API o Server Component che passa `event` con `marketSpecificationText` / `marketSpecificationJson`

---

# Step 9 – Categorie e fonti: vincolo e copertura

**Stato:** [ ] Da eseguire

## Cosa è già stato fatto (step precedenti)
- **Step 1–8:** Pipeline completa; Market Spec generato e mostrato nella "i". Resta da allineare categorie e fonti al documento.

## Obiettivo di questo step
Vincolare le **categorie** agli assi del doc: Politics, Sports, Tech, Crypto, Economy, Culture (e/o intrattenimento). Mappare e filtrare fonti/eventi per categoria in modo coerente. Verificare che le **fonti** (RSS, discovery) coprano le categorie richieste: sport (calcio, basket, tennis, F1, MotoGP), economia, politica, intrattenimento, scienza/tech, crypto/azioni, e che siano prioritarie fonti ufficiali / wire / reputabili.

## Discussione (cosa decidere in chat prima di implementare)
1. **Lista categorie ufficiale:** Definire l'elenco esatto (es. `POLITICS | SPORTS | TECH | CRYPTO | ECONOMY | CULTURE`) e dove è usato: prompt di generazione, validator, filtri discovery, UI. Sostituire o mappare le categorie esistenti a questa lista.
2. **Fonti per categoria:** Per ogni categoria, quali feed/source sono assegnati? Es. Sport: FIGC, UEFA, Gazzetta; Economy: Sole24Ore, Bloomberg; Crypto: CoinDesk, … Verificare `lib/ingestion/config/sources.ts` e discovery registry; aggiungere feed mancanti (F1, MotoGP, intrattenimento) se possibile.
3. **Filtro in pipeline:** Dopo l'ingest, filtrare gli articoli per categoria (tag o dominio) e passare solo quelli rilevanti al path di generazione; oppure assegnare categoria al candidato e filtrare in selezione (max per categoria).

## Implementazione (cosa fare)
- [ ] Introdurre costante o enum `ALLOWED_CATEGORIES` (Politics, Sports, Tech, Crypto, Economy, Culture) e usarla in candidate generator, rulebook validator e UI (dropdown, filtri).
- [ ] Verificare e aggiornare `lib/ingestion/config/sources.ts` (e discovery sources) per coprire F1, MotoGP, intrattenimento, crypto; documentare quale fonte è per quale categoria.
- [ ] Applicare il vincolo: candidati con categoria non in lista vengono scartati o rimappati; eventi creati hanno solo categorie dalla lista.
- [ ] (Opzionale) Filtro "solo fonti ufficiali/wire" per categoria: config per cui in politica si preferiscono fonti governo, in sport federazioni, ecc.

## Cosa faranno gli step successivi
- **Step 10** ridisegna l'ordine degli step della pipeline (wire tutto nel ordine: rule of book → trend → … → Event Type → Title → … → Publish) e assicura che i nuovi blocchi siano chiamati nel posto giusto.

## File coinvolti
- `lib/ingestion/config/sources.ts`
- `lib/event-gen-v2` (categorie in tipi e validator)
- `lib/validator` (se usa categorie)
- Config discovery / foundation (sources per categoria)
- Componenti UI che mostrano categoria (dropdown, filtri)

---

# Step 10 – Ordinamento pipeline e wiring finale

**Stato:** [ ] Da eseguire

## Cosa è già stato fatto (step precedenti)
- **Step 1–9:** CRON→fonti, pre-validazione rule of book, trend gate, policy italiano/europeo, Event Type (N formulazioni), titolo psicologico su tutti i path, Market Spec generato e persistito, visualizzazione nella "i", categorie e fonti allineate.

## Obiettivo di questo step
Ridisegnare l'**ordine** degli step della pipeline in modo che coincida con il flusso target: **notizie** → **rule of book (su notizia)** → **trend signal** → **policy italiano/europeo** → **generazione formulazioni (Event Type)** → **titolo psicologico** → **rulebook validator (su candidato)** → **quality scoring** → **dedup** → **select** → **publish** → **generazione Market Spec per evento**. Verificare che tutti i path (storyline, trend, discovery-backed) rispettino questo ordine e che non ci siano bypass o step duplicati.

## Discussione (cosa decidere in chat prima di implementare)
1. **Unificazione path:** I tre path (storyline, trend, discovery) oggi hanno ordini leggermente diversi. Decidere se si vuole un unico "orchestrator" che riceve "lead" normalizzati e applica sempre: pre-validate → trend gate → audience → event-type (formulations) → psychological title → rulebook validate → score → dedup → select → publish → market spec. Oppure mantenere tre path ma garantire che ognuno chiami gli stessi step nello stesso ordine.
2. **Rulebook validator su candidato:** Resta dopo il titolo psicologico (il titolo finale deve passare il validator). Il Market Spec viene generato dopo il publish (come in Step 7).
3. **Metriche e log:** Esporre in PipelineRun o nella risposta cron i conteggi per ogni stage (notizie in ingresso, dopo pre-validate, dopo trend, dopo audience, dopo event-type, dopo title, dopo rulebook, dopo dedup, selected, created) per debug e monitoraggio.

## Implementazione (cosa fare)
- [ ] Redigere (o aggiornare) un diagramma o commento in `lib/event-gen-v2/run-pipeline.ts` con l'ordine esatto degli step per ogni path.
- [ ] Verificare che in storyline path l'ordine sia: getEligibleStorylines → pre-validate → trend gate → audience → [generazione candidati / event-type] → psychological title → validateCandidates → score → dedup → select → publishSelectedV2 → [generazione market spec per ogni evento creato].
- [ ] Stessa verifica per trend path e discovery-backed path.
- [ ] Aggiungere (opzionale) conteggi per stage in risultato pipeline e in PipelineRun.
- [ ] Aggiornare `docs/PIPELINE_CRON.md` (o doc equivalente) con il nuovo flusso.

## Cosa faranno gli step successivi
- Nessuno: questo è l'ultimo step. Dopo Step 10 la pipeline è allineata al piano. Eventuali estensioni (multi-outcome X/Y, feedback loop) saranno piani separati.

## File coinvolti
- `lib/event-gen-v2/run-pipeline.ts`
- `lib/event-gen-v2/discovery-backed-integration.ts`
- `docs/PIPELINE_CRON.md`
- Eventuale nuovo doc `docs/PIPELINE_EVENTI_FLUSSO.md` con diagramma ordine step
