# Regole di chiusura (closesAt) – Fase 4

Scadenza variabile: **breve termine** (1–7 giorni) per eventi con data nota, **medio termine** (1–4 settimane) per trend.

## Obiettivo

Assegnare `closesAt` in modo coerente:

- **Con data esplicita** (partita, elezione, lancio): `closesAt` = data dell’evento (o 1h prima).
- **Senza data** (trend): default per categoria (Sport 7 giorni, Tech 14 giorni, Politica 7 giorni, ecc.).

## Configurazione

In `lib/event-generation/config.ts`:

- **`DEFAULT_CLOSURE_RULES`** / **`getClosureRules()`**
  - `minHoursFromNow`: ore minime da ora per cui `closesAt` deve essere nel futuro (default **24**).
  - `hoursBeforeEvent`: ore prima dell’evento a cui chiudere il mercato quando si usa una data esplicita (default **1**).
  - `defaultDaysByCategory`: giorni di default per categoria quando non c’è data esplicita:
    - Sport: 7, Politica: 7, Tecnologia: 14, Economia: 14, Cultura: 7, Scienza: 14, Intrattenimento: 7.
  - `shortTermDays`: 7 (usato se l’LLM restituisce `type: "shortTerm"`).
  - `mediumTermDays`: 21 (usato se l’LLM restituisce `type: "mediumTerm"`).

Variabili d’ambiente opzionali:

- `CLOSURE_MIN_HOURS`: sovrascrive `minHoursFromNow`.
- `CLOSURE_HOURS_BEFORE_EVENT`: sovrascrive `hoursBeforeEvent`.

## Priorità di calcolo

La funzione **`computeClosesAt(candidate, generated, category)`** in `lib/event-generation/closes-at.ts` determina `closesAt` in questo ordine:

1. **Data esplicita nel testo**  
   Parsing di titolo/snippet/descrizione (candidato + evento generato). Formati supportati:
   - ISO `YYYY-MM-DD`
   - `DD/MM/YYYY` o `DD-MM-YYYY`
   - Italiano: "il 15 marzo 2025", "15 marzo", "partita del 20 marzo", "elezioni dell'8 settembre"
   - Se la data è nel futuro → `closesAt` = data − `hoursBeforeEvent` (minimo `minHoursFromNow` da ora).

2. **`eventDate` dall’LLM**  
   Se l’LLM restituisce `eventDate` (ISO) e è nel futuro → `closesAt` = `eventDate` − `hoursBeforeEvent`.

3. **`type` dall’LLM**  
   - `shortTerm` → `closesAt` = ora + `shortTermDays` giorni.
   - `mediumTerm` → `closesAt` = ora + `mediumTermDays` giorni.

4. **Default per categoria**  
   `closesAt` = ora + `defaultDaysByCategory[category]`.

In tutti i casi, **`closesAt` è sempre ≥ ora + `minHoursFromNow`** (es. almeno 24 ore da ora).

## Integrazione nella generazione

- **Prompt (Fase 3)**: l’LLM può restituire campi opzionali `eventDate` (ISO) e `type` (`"shortTerm"` | `"mediumTerm"`).
- **Post-LLM**: dopo la generazione, `generate.ts` chiama `computeClosesAt(candidate, rawEvent, category)` e sostituisce `closesAt` con il valore calcolato.
- **Parsing testo**: anche senza hint LLM, il modulo interpreta titolo/descrizione per estrarre date esplicite (`parseExplicitDateFromText`).

## Esempi

| Tipo evento              | Esempio                               | Comportamento                          |
|--------------------------|----------------------------------------|----------------------------------------|
| Con data                 | Partita Juventus–Inter del 20 marzo   | Parsing "20 marzo" → closesAt 20 marzo − 1h |
| Con data                 | Elezioni 8 settembre 2025             | Parsing "8 settembre 2025" → closesAt 8 set − 1h |
| Senza data (trend)       | "Il film X supererà 100M?"            | Default categoria (es. Intrattenimento 7 giorni) |
| LLM restituisce eventDate| Lancio prodotto 10 gennaio            | closesAt = 10 gennaio − 1h            |
| LLM restituisce type     | mediumTerm                             | closesAt = ora + 21 giorni             |

## Deliverable Fase 4

- **Logica**: `computeClosesAt(candidate, generated, category)` in `closes-at.ts`; regole in `config.ts`.
- **Output Fase 3 arricchito**: ogni `GeneratedEvent` restituito da `generateEventsFromCandidates` ha `closesAt` definitivo calcolato con le regole sopra.
- **Documentazione**: questo file (`CLOSURE-RULES.md`).
