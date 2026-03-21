# Criteri di verifica e selezione eventi

Criteri con cui le notizie vengono selezionate dalle fonti, validate dal rulebook e punteggiate in pipeline. Valgono sia per mercati **binari** (Sì/No) sia per **multi-outcome** (Multiple Choice, Range, Time-to-Event, ecc.).

---

## 1. Rulebook: binary vs multi-outcome

- **Mercati binari (BINARY, THRESHOLD):**  
  Richiesti `resolutionCriteriaYes` e `resolutionCriteriaNo`. Opzionale `resolutionCriteriaFull`.

- **Mercati multi-opzione (MULTIPLE_CHOICE, RANGE, TIME_TO_EVENT, COUNT_VOLUME, RANKING):**  
  **Non** si richiedono Yes/No. È sufficiente:
  - `resolutionCriteriaFull` (testo che descrive come si risolve e le opzioni), **oppure**
  - `outcomes` (array di `{ key, label }`).  
  Gli `outcomes` possono essere derivati dal titolo in fase di publish (es. titolo con ` : A | B | C`).

- **Scoring (resolution_score):**  
  Per i tipi multi-opzione, se sono presenti criteri o outcomes, il candidato non viene penalizzato: `resolution_score` è almeno 0.8 (vedi `lib/event-publishing/scoring.ts`).

Implementazione: `lib/event-gen-v2/rulebook-validator/rules.ts` (funzioni `isMultiOptionMarket`, `checkBinaryOutcomes`, `checkResolutionCriteria`).

---

## 2. Qualità del titolo

- **Lunghezza minima:** almeno 20 caratteri (evita titoli placeholder o “no sense”).
- **Forma domanda:** il titolo deve contenere `?` (domanda chiara).
- **Lunghezza minima parole:** almeno 3 parole.

Controlli in rulebook: `checkTitleClarity` in `rules.ts` (codici `TITLE_TOO_SHORT`, `TITLE_NOT_QUESTION`, `TITLE_QUALITY`).

---

## 3. Verificabilità

- **Fonte di risoluzione obbligatoria:** `resolutionSourceUrl` deve essere presente e URL valido (rulebook: `checkResolutionSource`).
- **Allineamento titolo–criteri:** almeno un termine significativo del titolo (numeri, entità) deve comparire nei criteri di risoluzione; evita titoli generici o fuori tema (rulebook: `checkTitleVsCriteria`).
- **Gerarchia fonti:** se presenti fonti secondarie/terziarie, devono essere coerenti con la fonte primaria (rulebook: `checkSourceHierarchy`).

Per notizie non verificabili (solo opinioni, rumor senza fonte ufficiale o reputabile) il candidato può essere scartato in fase di rulebook o di scoring (authority OFFICIAL/REPUTABLE e presenza di criteri migliorano `resolution_score`).

---

## 4. Selezione notizie e scoring

- **Quality gate:** `overall_score >= QUALITY_THRESHOLD` (default 0.75). I componenti includono trend, clarity, psychological, **resolution**, novelty, image.
- **Multi-outcome:** i candidati con `marketType` multi-opzione e criteri/outcomes validi ricevono un `resolution_score` almeno 0.8, così non sono svantaggiati rispetto ai binari.
- **Diversità e dedup:** selezione e dedup per storyline/argomento; viene mantenuto il candidato con score più alto per chiave di dedup.

Parametri: `lib/event-publishing/selection.ts`, `lib/event-publishing/scoring.ts`. Env: `TARGET_OPEN_EVENTS`, `MAX_NEW_PER_RUN`, `QUALITY_THRESHOLD`, pesi `QUALITY_WEIGHT_*`.

---

## 5. Riferimenti

- Tipi di mercato e quando usarli: `docs/MARKET_TYPES.md`.
- Rulebook v2: `lib/event-gen-v2/rulebook-validator/` (types, rules, error-schema).
- Market types e outcome: `lib/market-types/` (`constants.ts`, `outcome-schemas.ts`).
