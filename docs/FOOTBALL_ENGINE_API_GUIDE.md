# Football Intelligence Engine — Guida API

## Stato attuale delle API

### Hai già (funzionanti)

| API | Chiave | Stato | Cosa fa oggi |
|-----|--------|-------|-------------|
| **football-data.org** | `FOOTBALL_DATA_ORG_API_TOKEN` | Attiva, integrata | Fixture + risultati + auto-resolve. Copre: Serie A, Champions League, Europa League, Premier League, La Liga |
| **OpenAI** | `OPENAI_API_KEY` | Attiva, integrata | Genera titoli e narrative per gli eventi sport |
| **NewsAPI** | `NEWSAPI_API_KEY` | Attiva, integrata | News generiche per la pipeline discovery |
| **YouTube** | `YOUTUBE_API_KEY` | Attiva | Usata nella pipeline discovery |
| **Google News RSS** | Nessuna chiave | Attiva, integrata | Il `sport-media-agent` già scrapa Google News RSS per contesto partite |

### Hai ma NON funzionanti / non integrate

| API | Chiave | Problema |
|-----|--------|---------|
| **The Odds API** | `ODDS_API_KEY` | La chiave nel `.env` (`d043c43e8cff4d8de3eecf2b1350383b`) è identica a `NEWSAPI_API_KEY` — quasi certamente è sbagliata. Nessun codice la utilizza. |
| **TheSportsDB** | `THESPORTSDB_API_KEY=123` | Valore placeholder. TheSportsDB free usa key `3` per testing. Nessuna integrazione nel codice. |
| **API-Sports** | `API_SPORTS_KEY` | Vuota. Nessuna integrazione (il file `api-sports.ts` non esiste più). |

---

## API da ottenere (in ordine di priorità)

### 1. API-Football (RapidAPI) — PRIORITÀ MASSIMA

**Perché è fondamentale:** football-data.org ti dà solo fixture e risultati finali. API-Football ti dà TUTTO: statistiche giocatore per partita, formazioni probabili, infortuni, squalifiche, trasferimenti, eventi live minuto per minuto (gol, cartellini, sostituzioni, VAR), head-to-head, top scorers, standings dettagliate. È il cuore del RADAR.

**Piani e prezzi (RapidAPI):**

| Piano | Prezzo | Richieste/giorno | Per noi |
|-------|--------|------------------|---------|
| Free | $0 | 100/giorno | Per sviluppo/test |
| Basic | $9.99/mese | 7.500/giorno | **Consigliato per partire** |
| Pro | $49.99/mese | 75.000/giorno | Quando scali |

**Copertura:** 1000+ campionati mondiali, ma noi filtriamo solo quelli che ci interessano.

**Come ottenere la chiave:**

1. Vai su https://rapidapi.com/api-sports/api/api-football
2. Crea un account RapidAPI (o accedi se ce l'hai già)
3. Clicca **"Subscribe to Test"** sul piano Free (per iniziare)
4. Vai su **"Apps"** (in alto a destra) → **"default-application"** → **"Security"**
5. Copia la **`X-RapidAPI-Key`** (è una stringa tipo `a1b2c3d4e5f6...`)
6. Quando sei pronto per produzione, upgrada al piano **Basic ($9.99/mese)**

**Cosa metterai nel `.env`:**
```
API_FOOTBALL_KEY=la-tua-chiave-rapidapi
```

---

### 2. The Odds API — PRIORITÀ ALTA

**Perché è fondamentale:** Le quote dei bookmaker sono il miglior segnale per calibrare le probabilità iniziali dei mercati. Se il mercato prezza "vittoria Napoli" al 65%, il nostro AMM dovrebbe partire con probabilità simili, non al 50/50. Inoltre, i movimenti di quota (line movements) sono segnali per generare eventi: "Le quote per la vittoria del Milan sono crollate nelle ultime 24h — cosa è successo?"

**Piani e prezzi:**

| Piano | Prezzo | Richieste/mese | Per noi |
|-------|--------|---------------|---------|
| Free | $0 | 500/mese | Per sviluppo |
| Starter | $20/mese | 10.000/mese | **Consigliato** |

**Come ottenere la chiave:**

1. Vai su https://the-odds-api.com/
2. Clicca **"Get API Key"**
3. Registrati con email
4. Riceverai la API key via email
5. Vai su https://the-odds-api.com/account/ per verificarla

**Cosa metterai nel `.env`:**
```
ODDS_API_KEY=la-tua-vera-chiave-odds-api
```
**NOTA:** La chiave attuale nel tuo `.env` è uguale a quella di NewsAPI — è quasi sicuramente sbagliata. Devi ottenere quella vera.

---

### 3. Twitter/X API — PRIORITÀ MEDIA (può aspettare Fase 2)

**Perché è utile:** Monitoring in tempo reale di giornalisti sportivi (Fabrizio Romano, Di Marzio, ecc.), account ufficiali dei club, giocatori. Fondamentale per gli eventi "wow" (trasferimenti, esoneri, gossip). 

**Problema:** Dopo l'acquisizione di Elon Musk, l'API è diventata costosa.

**Piani e prezzi:**

| Piano | Prezzo | Tweets letti/mese | Per noi |
|-------|--------|-------------------|---------|
| Free | $0 | Solo scrittura (inutile) | No |
| Basic | $100/mese | 10.000 tweet letti | Minimo per monitoring |
| Pro | $5.000/mese | 1M tweet letti | Overkill |

**Alternativa molto più economica — Apify Twitter Scraper:**

| Piano | Prezzo | Per noi |
|-------|--------|---------|
| Free | $0 | 1.000 scraping/mese |
| Starter | $49/mese | 100.000 scraping/mese — **molto più conveniente di Twitter API** |

**Come ottenere (Apify — consigliato):**

1. Vai su https://apify.com/
2. Crea account
3. Cerca "Twitter Scraper" nel marketplace
4. Il piano Free ti dà abbastanza per testare
5. Vai su **Settings** → **Integrations** → copia la **API token**

**Cosa metterai nel `.env`:**
```
APIFY_API_TOKEN=la-tua-chiave-apify
```

**Oppure, se preferisci Twitter diretto:**

1. Vai su https://developer.twitter.com/
2. Crea un progetto/app
3. Sottoscrivi al piano Basic ($100/mese)
4. Copia Bearer Token

```
TWITTER_BEARER_TOKEN=il-tuo-bearer-token
```

**Il mio consiglio:** Parti SENZA Twitter/X. Nella Fase 1 usiamo Google News RSS + NewsAPI che già funzionano. Aggiungiamo Twitter nella Fase 2 quando il sistema base è solido.

---

### 4. Transfermarkt API (via RapidAPI) — PRIORITÀ BASSA

**Perché è utile:** Valori di mercato dei giocatori, storico trasferimenti, contratti in scadenza. Utile per eventi tipo "Il trasferimento di X verrà annunciato?" o "Il valore di mercato di Y supererà i 100M?"

**Prezzo:** $0 (free su RapidAPI, stessa chiave di API-Football se usi RapidAPI)

**Come ottenere:**
1. Con la stessa chiave RapidAPI di API-Football
2. Sottoscrivi a https://rapidapi.com/transfermarkt/api/transfermarkt-api (free)

**Cosa metterai nel `.env`:**
```
# Usa la stessa API_FOOTBALL_KEY (RapidAPI)
```

---

## Riepilogo: cosa fare adesso

### Step 1 — API-Football (5 minuti)
1. Vai su https://rapidapi.com/api-sports/api/api-football
2. Registrati / accedi
3. Sottoscrivi al piano Free
4. Copia la `X-RapidAPI-Key`
5. Torna qui e dimmela, la metto nel `.env`

### Step 2 — The Odds API (3 minuti)
1. Vai su https://the-odds-api.com/
2. Registrati
3. Copia la API key dalla email/dashboard
4. Torna qui e dimmela

### Step 3 — Fatto! (per ora)
Con queste due + football-data.org + Google News RSS + NewsAPI che hai già, abbiamo abbastanza dati per costruire tutto il Layer RADAR della Fase 1.

Twitter/Apify e Transfermarkt li aggiungiamo nella Fase 2.

---

## Campionati da coprire

### Tier 1 — Massima copertura (tutti gli eventi, tutti i tipi di mercato)
- **Serie A** (Italia) — `SA` su football-data.org, `135` su API-Football
- **Champions League** — `CL` / `2`
- **Europa League** — `EL` / `3`
- **Conference League** — non su football-data.org free / `848`
- **Premier League** (Inghilterra) — `PL` / `39`
- **La Liga** (Spagna) — `PD` / `140`
- **Bundesliga** (Germania) — `BL1` / `78`
- **Ligue 1** (Francia) — `FL1` / `61`

### Tier 2 — Buona copertura (eventi match principali + narrativi se c'è interesse)
- **Serie B** (Italia) — `SB` / `136`
- **Coppa Italia** — `CIT` / `137`
- **Supercoppa Italiana** — `SCT` / `547`
- **Eredivisie** (Olanda) — `DED` / `88`
- **Primeira Liga** (Portogallo) — `PPL` / `94`
- **Championship** (Inghilterra 2a div) — `ELC` / `40`
- **FA Cup** — `FAC` / `45`
- **Copa del Rey** — / `143`
- **DFB Pokal** — `DFB` / `529`

### Tier 3 — Solo partite di cartello / quando c'è hype
- **Scottish Premiership** — / `179`
- **Belgian Pro League** — / `144`
- **Super Lig** (Turchia) — / `203`
- **Coppa di Lega inglese (EFL Cup)** — / `48`
- **Mondiale per Club** — / `15`
- **Nations League** — / `5`
- **Qualificazioni Europei/Mondiali** — / `960`, `34`

### Tier 4 — Solo durante il torneo
- **Europei** (Euro 2028 etc.)
- **Mondiali** (2026!)
- **Copa America**

### Nota su football-data.org free tier
Il piano gratuito copre solo 12 competizioni. Per i Tier 2-3-4 useremo API-Football (che copre 1000+ leghe). football-data.org resta la fonte primaria per risoluzione automatica dei Tier 1.

---

## Variabili `.env` finali (quando avrai tutto)

```env
# --- FOOTBALL INTELLIGENCE ENGINE ---

# Fonte primaria: fixture + risoluzione automatica (hai già)
FOOTBALL_DATA_ORG_API_TOKEN=9b111156097a4a558cb7ca0047cf5a34

# Fonte ricca: statistiche, formazioni, infortuni, live events (DA OTTENERE)
API_FOOTBALL_KEY=

# Quote bookmaker per calibrazione probabilità (DA OTTENERE - chiave vera)
ODDS_API_KEY=

# Social monitoring (Fase 2)
# APIFY_API_TOKEN=
# TWITTER_BEARER_TOKEN=
```
