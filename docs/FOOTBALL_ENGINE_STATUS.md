# Football Intelligence Engine — Stato del Progetto

## Visione

Trasformare la piattaforma da prediction market generalista a **prediction market calcistico specializzato**. Il nuovo sistema di generazione eventi deve essere un **asset economico autonomo**: dalla creazione alla risoluzione, completamente automatico, con eventi creativi ("effetto wow") che nessun appassionato di calcio si aspetterebbe di trovare su una piattaforma di prediction market.

---

## Architettura: 4 Layer

```
RADAR → BRAIN → FORGE → SENTINEL
  ↑ dati    ↑ AI     ↑ struttura  ↑ risolve (TODO)
```

### Layer 1 — RADAR (Data Collection) ✅ COMPLETO

**File:** `lib/football-engine/radar/`

Aggrega dati da più fonti in parallelo:
- **API-Football** (`radar/clients/api-football.ts`): fixture, infortuni, H2H, classifiche, trasferimenti, live events
- **The Odds API** (`radar/clients/odds-api.ts`): quote bookmaker per calibrare probabilità + line movements
- **Google News RSS + Reddit RSS** (`radar/sources/news-rss.ts`): notizie per ogni fixture + feed italiani generali (Gazzetta, Sky Sport, Corriere dello Sport, Tuttosport) + feed trasferimenti (Fabrizio Romano, calciomercato)
- **Seasonal Intelligence** (`radar/seasonal.ts`): fase del calendario calcistico → orienta il Creative agent
- **Source Tier System** (`radar/source-tiers.ts`): giornalisti e siti classificati Tier 1-3

**Cache stagioni**: evita duplicati API per `fetchCurrentSeason`. Fallback automatico al anno stagione calcolato dal mese (es. Aprile 2026 → stagione 2025).

**Interest Score**: i segnali news/social pesano di più (3pt) rispetto ai segnali strutturati (2pt) per riflettere la narrativa attorno alla partita.

**floatingSignals**: ora popolati con notizie generali italiane (40 segnali max: trasferimenti, esoneri, gossip).

**Output:** `RadarOutput` — lista di `MatchContext` ordinati per interesse + `floatingSignals`.

---

### Layer 2 — BRAIN (Multi-Agent AI) ✅ COMPLETO

**File:** `lib/football-engine/brain/`

4 agenti specializzati in sequenza:

1. **Analyst** (Claude `claude-3-5-sonnet-20241022`): trova pattern, correlazioni e **Event Chains** (catene causali tipo "se X perde → allenatore rischia"). Ora riceve i titoli delle notizie RSS nel contesto.
2. **Creative** (GPT-4o / Claude fallback): genera idee evento creative con **contesto stagionale iniettato automaticamente** (es. "volata finale April 2026: lotta scudetto, semifinali Champions"). Quando l'Analyst segnala una Event Chain, il Creative genera coppie trigger→conseguenza.
3. **Verifier** (Claude): valida fattibilità, fonte di risoluzione, edge cases
4. **Resolver** (GPT-4o-mini): pre-computa strategia di risoluzione — disabilitato di default nelle run admin per velocità

**LLM**: modello configurabile via `ANTHROPIC_MODEL` (default: `claude-3-5-sonnet-20241022`). Fallback automatico OpenAI↔Claude.

**Admin run defaults**: `maxMatches=5`, `skipResolver=true`, `minInterestScore=10` per evitare timeout.

---

### Layer 3 — FORGE (Market Structuring) ✅ COMPLETO

**File:** `lib/football-engine/forge/`

Trasforma idee approvate in `Candidate[]` compatibili con il publisher esistente. Ora include:
- **14 market templates** con edge cases e criteri risoluzione
- **Context-Aware Timing**: parsing avanzato di `closesAtLogic` (es. "48h dopo", "fine stagione", "inizio partita", "N giorni")
- Tutti i market types: BINARY, RANGE, THRESHOLD, TIME_TO_EVENT, MULTIPLE_CHOICE, COUNT_VOLUME, RANKING, SCALAR

---

### Layer 4 — SENTINEL (Monitoring & Resolution) 🔜 TODO FASE 4

Monitoraggio live + risoluzione automatica 3-livelli. Da implementare.

---

## Campionati Coperti

**Tier 1** (alta priorità): Serie A, Champions League, Premier League, La Liga, Bundesliga, Ligue 1, Europa League, Conference League  
**Tier 2** (media priorità): Serie B, FA Cup, Coppa Italia, Eredivisie, Liga NOS, Süper Lig, Primeira Liga  
**Tier 3** (bassa priorità): Nazionale Italiana, Liga MX, MLS, Saudi Pro League, A-League, Brasileirao, Argentine Primera  
**Tier 4** (emergenti): World Cup, Euro, Copa America, Nations League, Coppa del Mondo per Club

---

## File del Sistema

| File | Descrizione |
|------|-------------|
| `lib/football-engine/types.ts` | Tipi condivisi: Competition, FootballSignal, Match, MatchContext, RadarOutput |
| `lib/football-engine/competitions.ts` | 28 campionati con tier, apiFootballId, oddsApiKey |
| `lib/football-engine/radar/index.ts` | Orchestratore RADAR: fixtures + odds + injuries + news |
| `lib/football-engine/radar/clients/api-football.ts` | Client API-Football v3 |
| `lib/football-engine/radar/clients/odds-api.ts` | Client The Odds API v4 |
| `lib/football-engine/radar/sources/news-rss.ts` | Google News RSS + Reddit RSS per fixture e floating |
| `lib/football-engine/radar/seasonal.ts` | Calendario calcistico: fase stagionale → creative hints |
| `lib/football-engine/radar/source-tiers.ts` | Journalist Tier System: 40+ fonti classificate |
| `lib/football-engine/radar/normalizers.ts` | Normalizzatori: API-Football → FootballSignal/Match |
| `lib/football-engine/brain/index.ts` | Orchestratore BRAIN: Analyst → Creative → Verifier → Resolver |
| `lib/football-engine/brain/agents.ts` | Implementazione 4 agenti AI |
| `lib/football-engine/brain/llm.ts` | Astrazione LLM (OpenAI + Anthropic) con fallback automatico |
| `lib/football-engine/brain/prompts.ts` | System prompts: ANALYST, CREATIVE (+ seasonal), VERIFIER, RESOLVER |
| `lib/football-engine/forge/index.ts` | FORGE: BRAIN output → Candidate[] + context-aware timing |
| `lib/football-engine/forge/market-templates.ts` | 14 market templates con resolution criteria |
| `lib/football-engine/index.ts` | Pipeline orchestrator: RADAR → BRAIN → FORGE |
| `app/api/admin/run-football-engine/route.ts` | API route admin per run manuale |
| `app/admin/page.tsx` | Admin Dashboard: dual-panel FIE 2.0 vs Legacy |

---

## Variabili d'Ambiente Necessarie

```bash
# Obbligatorie
API_FOOTBALL_KEY=         # api-sports.io (Pro plan $19/mese per stagione corrente)
ANTHROPIC_API_KEY=        # console.anthropic.com
FOOTBALL_DATA_ORG_API_TOKEN=  # football-data.org (free tier ok)

# Raccomandate
OPENAI_API_KEY=           # OpenAI per Creative Agent (GPT-4o) — con crediti attivi
ODDS_API_KEY=             # the-odds-api.com (500 req/mese free)

# Opzionali (override)
ANTHROPIC_MODEL=claude-3-5-sonnet-20241022  # default — aggiorna con modello più recente
```

---

## Admin Dashboard

URL: `/admin` → tab "Sport 2.0 — Football Intelligence Engine"

**Diagnostici mostrati**: RADAR partite | News segnali | Analyst insight | Creative idee | Verifier ok | FORGE candidati | Durata pipeline

**Comportamento di default**: maxMatches=5, maxTier=2, skipResolver=true → risposta in ~60-90s

---

## TODO Rimanenti

### Priorità Alta
- **SENTINEL (Fase 4)**: risoluzione automatica live monitoring, 3-livelli Oracle
- **Cron dedicato FIE**: job automatico ogni 6-12h che esegue la pipeline completa

### Priorità Media
- **Standings nel contesto BRAIN**: aggiungere classifica aggiornata per ogni partita (il client può già fetcharla)
- **Twitter/Apify**: monitoring giornalisti Tier 1 (Fabrizio Romano, Di Marzio) per trasferimenti in real-time
- **Real-time event spawning**: generazione eventi live durante le partite (mini-pipeline veloce)

### Priorità Bassa
- **OpenAI crediti**: ricaricare per usare GPT-4o come Creative primario (più creativo di Claude in questo ruolo)
- **Event chains avanzate**: UI per mostrare la relazione tra mercati correlati
- **Post-match learning**: feedback loop dai risultati reali per migliorare i prompt

---

*Ultimo aggiornamento: Aprile 2026*
