# Fase 3 + Sicurezza – Check finale

Checklist semplice per verificare che la Fase 3 sia completa e che tutto sia configurato in modo sicuro.

---

## Fase 3 – Da fare (stato)

| # | Cosa | Stato |
|---|-----|--------|
| 1 | Provider OpenAI/Anthropic + dipendenze (openai, zod, @anthropic-ai/sdk) | ✅ Fatto |
| 2 | Variabili env: OPENAI_API_KEY, ANTHROPIC_API_KEY, GENERATION_PROVIDER | ✅ Documentate in .env.example |
| 3 | Prompt system (titolo SÌ/NO, categorie ammesse, risolvibilità, output JSON) | ✅ lib/event-generation/prompts.ts |
| 4 | Prompt user (titolo/snippet/URL, resolutionSourceUrl, resolutionNotes) | ✅ buildUserPrompt() |
| 5 | Schema TypeScript (GeneratedEvent) + validazione Zod | ✅ types.ts + schema.ts |
| 6 | Parsing e validazione output LLM prima dell’uso | ✅ parseGeneratedEvents(), validateGeneratedEvent() |
| 7 | Gestione errori e retry (risposta non JSON valida) | ✅ maxRetries in llm-openai.ts / llm-anthropic.ts |
| 8 | Cap per categoria (max 2–3 per categoria) + priorità per score | ✅ applyCategoryCaps() in generate.ts |
| 9 | Funzione generateEventsFromCandidates(verifiedCandidates, options?) | ✅ Esportata da lib/event-generation/index.ts |
| 10 | Script testabile (Fase 1+2 → stampa eventi) | ✅ npm run generate-events |

**Conclusione Fase 3:** tutto il “da farsi” della Fase 3 è completato. Non resta nulla di obbligatorio.

---

## Sicurezza – Check

### 1. Segreti e chiavi API

| Controllo | Stato |
|-----------|--------|
| Nessuna chiave API (OpenAI, Anthropic, News, ecc.) nel codice | ✅ Solo process.env in config.ts |
| .env e .env*.local in .gitignore | ✅ Non vengono mai committati |
| .env.example senza valori reali (solo placeholder) | ✅ OPENAI_API_KEY="" ecc. |

**Cosa fare tu:**  
- In locale: chiavi solo in `.env.local` (mai fare commit).  
- Su Vercel: aggiungi le variabili in **Settings → Environment Variables** (es. OPENAI_API_KEY per produzione). Non mettere mai GENERATION_INSECURE_SSL su Vercel.

---

### 2. SSL / certificati

| Controllo | Stato |
|-----------|--------|
| Workaround SSL (rejectUnauthorized: false) usato solo in sviluppo | ✅ Solo se NODE_ENV !== "production" **e** GENERATION_INSECURE_SSL=1 |
| In produzione (Vercel) il workaround non si attiva mai | ✅ Codice in generate.ts ignora GENERATION_INSECURE_SSL se NODE_ENV === "production" |

**In sintesi:** anche se qualcuno impostasse GENERATION_INSECURE_SSL=1 su Vercel, il codice non la userebbe in produzione. Resti sicuro.

---

### 3. API e accesso admin

| Controllo | Stato |
|-----------|--------|
| POST /api/admin/events (crea evento) protetto da admin | ✅ requireAdmin() prima di creare |
| GET /api/admin/events protetto da admin | ✅ requireAdmin() |
| Script generate-events non espone nulla sul web | ✅ Esegue solo in locale, non è un’API pubblica |

La generazione eventi con LLM avviene solo quando **tu** lanci `npm run generate-events` in locale. Il sito pubblico non esegue quel comando; eventuali API che in futuro useranno generateEventsFromCandidates dovranno essere protette (admin o cron secret).

---

### 4. Riepilogo “dove” sono i rischi

| Dove | Rischio | Mitigazione |
|------|--------|-------------|
| Repository GitHub | Chiavi nei file | .env / .env*.local in .gitignore; mai committare file con chiavi |
| Vercel (produzione) | SSL disabilitato | GENERATION_INSECURE_SSL ignorata se NODE_ENV=production |
| Locale (tuo Mac) | .env.local in chiaro | Solo tu hai accesso; non condividere il file |
| Chat / log | Chiave incollata in passato | Opzionale: rigenera chiave OpenAI e aggiorna .env.local + Vercel |

---

## Check finale – 3 passi

1. **Repo:** nessun file `.env` o `.env.local` tra i file tracciati da git.  
   Comando: `git status` → non devono comparire .env o .env.local.

2. **Vercel:** in **Settings → Environment Variables** hai almeno OPENAI_API_KEY (se usi OpenAI in prod). **Non** hai GENERATION_INSECURE_SSL.

3. **Locale:** in `.env.local` hai OPENAI_API_KEY (e, se serve per errore SSL, GENERATION_INSECURE_SSL=1). Non pushare mai .env.local.

---

## Conclusione

- **Fase 3:** completa; nessun “da farsi” obbligatorio rimasto.  
- **Sicurezza:** segreti solo da env; SSL workaround solo in sviluppo; admin API protette.  
- **Stato:** puoi considerare la Fase 3 e la configurazione di sicurezza **ok** se i 3 passi sopra sono rispettati.
