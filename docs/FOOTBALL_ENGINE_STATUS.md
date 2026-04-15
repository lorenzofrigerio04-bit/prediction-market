# Football Intelligence Engine — Stato del Progetto

## Visione

Trasformare la piattaforma da prediction market generalista a **prediction market calcistico specializzato**. Il nuovo sistema di generazione eventi deve essere un **asset economico autonomo**: dalla creazione alla risoluzione, completamente automatico, con eventi creativi ("effetto wow") che nessun appassionato di calcio si aspetterebbe di trovare su una piattaforma di prediction market.

---

## Architettura: 4 Layer

```
RADAR → BRAIN → FORGE → SENTINEL
  ↑ dati    ↑ AI     ↑ struttura  ↑ risolve
```

### Layer 1 — RADAR (Data Collection)
**File:** `lib/football-engine/radar/`

Aggrega dati da più fonti in parallelo:
- **API-Football** (`lib/football-engine/radar/clients/api-football.ts`): fixture, formazioni probabili, infortuni, squalifiche, eventi live minuto per minuto, H2H, classifiche, trasferimenti, top scorer
- **The Odds API** (`lib/football-engine/radar/clients/odds-api.ts`): quote bookmaker per calibrare probabilità iniziali + rilevazione line movements
- **football-data.org** (già esistente): risoluzione automatica eventi
- **Google News RSS** (già nel `sport-media-agent` esistente): notizie pre-partita

Normalizza tutto in `FootballSignal` unificati, li associa a ogni partita (`MatchContext`), calcola un `interestScore` 0-100.

**Journalist Tier System** (`lib/football-engine/radar/source-tiers.ts`): 40+ fonti classificate in Tier 1 (Fabrizio Romano, David Ornstein) → Tier 2 (Sky Sport, Gazzetta) → Tier 3 (aggregatori, Reddit). Il tier influenza la confidence dei segnali.

**Output:** `RadarOutput` — lista di `MatchContext` ordinati per interesse.

### Layer 2 — BRAIN (Multi-Agent AI)
**File:** `lib/football-engine/brain/`

4 agenti specializzati in sequenza:

1. **Analyst** (Claude Sonnet): trova pattern e correlazioni nei dati RADAR. Es: "Lautaro non segna da 5 partite in casa", "Il Milan prende sempre gol nei primi 15 min"
2. **Creative** (GPT-4o / Claude fallback): genera idee evento creative da pattern + contesto. Produce eventi di 6 categorie: match_core, player_performance, tactical, narrative_drama, off_field, season_long
3. **Verifier** (Claude Sonnet): valida fattibilità, fonte di risoluzione, edge cases, criteri YES/NO. Approva o respinge ogni idea
4. **Resolver** (GPT-4o-mini): pre-computa la strategia di risoluzione esatta (quale API, quale campo, quale logica)

**LLM Abstraction** (`lib/football-engine/brain/llm.ts`): gestisce la scelta del modello e il fallback automatico. Se OpenAI è in quota (429), usa Claude e viceversa.

**Output:** `BrainOutput` — eventi approvati con criteri di risoluzione e strategie.

### Layer 3 — FORGE (Market Structuring)
**File:** `lib/football-engine/forge/`

Trasforma le idee approvate in `Candidate[]` compatibili con il publisher esistente (`lib/event-gen-v2/publisher.ts`). Include:
- **14 template di mercato** con edge cases, criteri di risoluzione, `sportMarketKind` per auto-resolve
- Selezione automatica del `marketType` (BINARY, RANGE, THRESHOLD, TIME_TO_EVENT, MULTIPLE_CHOICE, etc.)
- Calcolo `closesAt` basato su logica della partita
- `sourceStorylineId` per dedup
- `creationMetadata` con `fie_version`, `wow_factor`, `feasibility`, `verification_confidence`

**Output:** `Candidate[]` → va direttamente nel publisher esistente.

### Layer 4 — SENTINEL (TODO)
Monitoring live + risoluzione potenziata. **Non ancora implementato.**

---

## Campionati Coperti

**28 competizioni su 4 tier** — `lib/football-engine/competitions.ts`

| Tier | Competizioni |
|------|-------------|
| 1 (copertura totale) | Serie A, Champions League, Europa League, Conference League, Premier League, La Liga, Bundesliga, Ligue 1 |
| 2 (buona copertura) | Serie B, Coppa Italia, Supercoppa Italiana, Eredivisie, Primeira Liga, Championship, FA Cup, Copa del Rey, DFB Pokal |
| 3 (big match / hype) | Scottish Premiership, Belgian Pro League, Süper Lig, EFL Cup, Nations League, WC Qualifiers, Club World Cup |
| 4 (solo durante torneo) | FIFA World Cup, European Championship, Copa América |

---

## Tipi di Evento Generati

| Categoria | Esempi |
|-----------|--------|
| **match_core** | 1X2, Over/Under, BTTS, Clean Sheet, Halftime State |
| **player_performance** | "Mbappé avrà più di 3 tiri in porta?", "Lautaro segnerà?" |
| **tactical** | "Primo gol nei primi 15 minuti?", "Cartellini totali?" |
| **narrative_drama** | "Ribaltone?", "La squadra in svantaggio recupera?" |
| **off_field** | "Esonero allenatore?", "Trasferimento ufficializzato?" |
| **season_long** | "Il Milan finirà nelle prime 4?", "Chi sarà capocannoniere?" |

---

## Risultato Test (15 aprile 2026)

Partite: Champions League (Bayern-Real Madrid, Arsenal-Sporting CP, Celta-Freiburg)

| Fase | Risultato |
|------|-----------|
| RADAR | 107 partite trovate |
| Analyst | 6 insight |
| Creative | 12 idee |
| Verifier | 7 approvate, 5 respinte |
| FORGE | 7 candidati strutturati |

Esempi eventi generati:
- "Il Bayern Monaco vincerà contro il Real Madrid?" (BINARY)
- "Quanti gol totali in Bayern-Real Madrid?" (RANGE: 0-1/2/3/4+)
- "Quante delle 3 favorite europee vinceranno stasera?" (MULTIPLE_CHOICE — wow_factor alto)
- "Ci saranno più di 12 cartellini nelle 3 partite europee?" (THRESHOLD)

---

## File Creati / Modificati

### Nuovi
```
lib/football-engine/
├── index.ts                          — Orchestratore principale pipeline
├── types.ts                          — Tipi condivisi (FootballSignal, Match, MatchContext, etc.)
├── competitions.ts                   — Registry 28 campionati su 4 tier
├── radar/
│   ├── index.ts                      — RADAR aggregator
│   ├── normalizers.ts                — Normalizzatori dati grezzi → FootballSignal
│   ├── source-tiers.ts               — Journalist Tier System
│   └── clients/
│       ├── api-football.ts           — Client API-Football (15 endpoint)
│       └── odds-api.ts               — Client The Odds API
├── brain/
│   ├── index.ts                      — Orchestratore 4 agenti
│   ├── agents.ts                     — Analyst, Creative, Verifier, Resolver
│   ├── llm.ts                        — Astrazione LLM (OpenAI + Anthropic + fallback)
│   └── prompts.ts                    — System prompt specializzati
└── forge/
    ├── index.ts                      — Strutturazione mercati → Candidate[]
    └── market-templates.ts           — 14 template con edge cases e criteri risoluzione

app/api/admin/run-football-engine/route.ts  — Endpoint admin
scripts/test-football-engine.ts             — Script test
docs/FOOTBALL_ENGINE_API_GUIDE.md           — Guida API keys
```

### Modificati
- `app/admin/page.tsx` — Aggiunto doppio pannello UI (Sport 2.0 + Legacy) con tab
- `.env` — Aggiunti `API_FOOTBALL_KEY` e `ANTHROPIC_API_KEY`
- `.env.example` — Aggiornato con nuove variabili

---

## Variabili d'Ambiente (tutte configurate in `.env`)

| Variabile | Stato | Note |
|-----------|-------|------|
| `FOOTBALL_DATA_ORG_API_TOKEN` | ✅ Attiva | football-data.org, fixture + risultati |
| `API_FOOTBALL_KEY` | ✅ Attiva (Pro) | api-sports.io, dati ricchi, $19/mese |
| `ODDS_API_KEY` | ✅ Attiva | The Odds API, quote bookmaker |
| `OPENAI_API_KEY` | ⚠️ Quota esaurita | Ricarica per usare GPT-4o nel Creative agent |
| `ANTHROPIC_API_KEY` | ✅ Attiva | Claude Sonnet, Analyst + Verifier + fallback Creative |

---

## Cosa Resta da Fare

### SENTINEL (Fase 4) — Alta Priorità
- Auto-resolve potenziato: più template sportivi (cartellini, tiri, formazioni)
- Live monitoring durante la partita (API-Football live endpoint)
- Resolution Oracle a 3 livelli (primaria → secondaria → terziaria)
- Post-match learning: feedback loop su performance eventi

### Miglioramenti BRAIN
- Aggiungere dati di infortuni e formazioni probabili nel contesto dell'Analyst
- Event Chains: mercati collegati in cascata (es. "Il Milan perde?" → "Pioli esonerato?")
- Real-time event spawning: genera eventi live durante le partite

### Miglioramenti RADAR
- Aggiungere news RSS italiane (Gazzetta, Sky Sport) come segnali floating
- Twitter/Apify per monitoring giornalisti Tier 1 (Fabrizio Romano, Di Marzio)
- Standings retrieval per ogni partita (arricchisce il contesto BRAIN)

### Infrastruttura
- Cron job dedicato per il Football Intelligence Engine
- Ricarica crediti OpenAI (il fallback su Claude funziona ma GPT-4o è più creativo)

---

## Come Attivare dalla Dashboard Admin

1. Vai su `/admin`
2. Nella sezione "Generazione eventi" clicca il tab **"Sport 2.0 — Football Intelligence Engine"** (default)
3. Spunta "Dry Run" per anteprima senza pubblicare
4. Clicca "Genera eventi Sport 2.0"
5. La diagnostica mostra: partite RADAR, insight Analyst, idee Creative, approvate Verifier

### Via API (cron/automazione)
```bash
curl -X POST /api/admin/run-football-engine \
  -H "Content-Type: application/json" \
  -d '{"dryRun": false, "maxTier": 2, "maxMatches": 15}'
```

---

## Decisioni Architetturali Prese

- **Claude per Analyst/Verifier, GPT-4o per Creative**: Claude ragiona meglio su dati strutturati, GPT-4o è più creativo
- **Fallback automatico**: se un LLM è in quota, l'altro prende il controllo senza interrompere la pipeline
- **Compatibilità totale con il publisher esistente**: il FORGE produce `Candidate[]` identici a quelli della pipeline legacy, così routing/scoring/dedup/publish non cambiano
- **Non si tocca nulla di esistente**: la pipeline legacy continua a funzionare in parallelo
- **28 campionati su 4 tier**: permette di scalare da Serie A (Tier 1, copertura massima) fino ai Mondiali (Tier 4, solo durante il torneo)
- **API-Football piano Pro ($19/mese)**: necessario per la stagione corrente (2025/26). Il piano Free ha solo stagioni 2022-2024
