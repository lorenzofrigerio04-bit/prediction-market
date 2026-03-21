# Cosa c'è (e non viene usato): tipo di evento e studio del titolo

Risposta a: *"C'è qualcosa che capisce quale tipologia di evento è migliore per una certa notizia (SÌ/NO vs X/Y vs scalare/fasce)? E una sezione dedicata allo studio del titolo? Cosa c'è che non sta venendo usato?"*

---

## 1. Tipologia di evento: "quale tipo è migliore per questa notizia?"

### Risposta breve: **no, non c'è nulla che scelga il tipo migliore**

Il sistema oggi **non** decide in base alla notizia se l'evento debba essere:
- binario (SÌ/NO),
- multi-outcome (X/Y/Z),
- scalare / a fasce (scalar_bracket),
- race, sequence, conditional (tipi "futuri" nel foundation).

Tutti gli eventi generati sono **solo binari** (SÌ/NO). La logica per gli altri tipi **esiste** nel foundation (MDE) ma **non è collegata** alla generazione eventi e non viene usata.

---

### Cosa c'è nel foundation (MDE) e non viene usato

**In `foundation-layer`:**

- **`ContractType`** (enum): `BINARY`, `MULTI_OUTCOME`, `SCALAR_BRACKET`, `RACE`, `SEQUENCE`, `CONDITIONAL`.
- **`DeterministicContractTypeSelector`**: prende un "tipo preferito" e restituisce quella scelta. **Non** valuta la notizia/evento per proporre il tipo migliore: si limita a restituire ciò che gli viene passato.
- **`DeterministicOutcomeGenerator`**: sa costruire esiti per:
  - **BINARY** (yes/no),
  - **MULTI_OUTCOME** (lista di outcome con key/label/definition),
  - **SCALAR_BRACKET** (fasce con min/max).
- **`DeterministicOpportunityAssessor`**: valuta relevance, resolvability, timeliness, novelty, audience. **Non** suggerisce un contract type.

**In `lib/mde-pipeline/run-mde-pipeline.ts`:**

- Si chiama il contract selector con **sempre** il tipo binario:
  - `preferredContractType = ContractType.BINARY` (default),
  - `contract_type_reason: "Single-observation deterministic path."`
- Quindi anche quando usi la pipeline MDE (path discovery-backed), il tipo è **sempre BINARY**. La possibilità di passare `preferredContractType` (es. SCALAR_BRACKET) c'è nei parametri ma non viene usata da cron/admin.

**Nell'app (event-gen-v2, rulebook, DB):**

- I candidati hanno solo `resolutionCriteriaYes` e `resolutionCriteriaNo`.
- Il rulebook ha la regola **MISSING_BINARY_OUTCOMES**: richiede esiti binari YES/NO.
- Lo schema Prisma: `outcome` è commentato come "YES o NO"; non c'è supporto a multi-outcome o fasce nel modello Event.

**Conclusione tipo di evento:**  
Tutta la capacità MDE per **multi_outcome**, **scalar_bracket** (e i tipi "futuri") è **presente nel foundation** ma **non usata** in generazione eventi. Non esiste un componente che "studia la notizia e sceglie il tipo di evento migliore"; il tipo è sempre binario per scelta fissa nel run della pipeline.

---

## 2. Sezione dedicata allo "studio del titolo"

Qui ci sono **due** pezzi rilevanti; uno è usato solo in un path, l'altro solo in un altro, e uno path non ha nessuna "sezione titolo".

### 2.1 MDE: DeterministicTitleGenerator (foundation-layer)

- **Cosa fa:** è una sezione dedicata al titolo. Prende il **market draft pipeline** (evento canonico, contract selection, ecc.) e genera un **TitleSet** con:
  - `canonical_title` (titolo base, con "?" se manca),
  - `display_title` (variante per UI),
  - `subtitle` (es. "Resolves using binary contract and preselected source hierarchy."),
  - `title_generation_status`, `generation_metadata` (incluso `contract_type`).
- **Dove si usa:** solo nel path **discovery-backed** (MDE). In `run-mde-pipeline.ts` viene chiamato `DeterministicTitleGenerator` e il risultato va nel publishable candidate.
- **Dove non si usa:** path **storyline** e path **trend** non passano dalla MDE e quindi **non** usano questo generatore di titoli.

Quindi: **sì, c'è una sezione "titolo" in stile MDE**, ma **solo quando la pipeline è discovery-backed** (`USE_DISCOVERY_BACKED_PIPELINE=true`).

### 2.2 Psychological Title Engine (lib/psychological-title-engine)

- **Cosa fa:** "studio" del titolo in senso diverso: genera **varianti** di titolo a partire da pattern e dal candidato (entity, threshold, date), le **punteggia** (`scoreTitle`), le **verifica** per la risoluzione (`verifyTitleForResolution`) e restituisce il titolo ottimizzato (o null per tenere l'originale).
- **Dove si usa:** solo nel path **trend** (`CANDIDATE_EVENT_GEN=true`), in `lib/candidate-event-generator/algorithm.ts` (dopo aver costruito il candidato da trend + template, si chiama `generatePsychologicalTitle(candidate)` e si usa il risultato se non null).
- **Dove non si usa:** path **storyline** e path **discovery** non chiamano il Psychological Title Engine.

Quindi: **c'è un motore dedicato al titolo** (varianti + scoring + verifica), ma **solo nel path trend**.

### 2.3 Path storyline: niente "studio del titolo"

- Il **candidate-generator** (storyline) costruisce il titolo solo con **template** (`event-templates`): `template.question(ctx)` con contesto (entity, host, categoria, closesAt, ecc.).  
- Non c'è né `DeterministicTitleGenerator` (MDE) né `Psychological Title Engine`. Quindi **nessuna sezione dedicata allo studio del titolo** nel path storyline.

---

## 3. Riepilogo: cosa c'è e cosa non viene usato

| Cosa | Dove sta | Usato? | Note |
|------|-----------|--------|------|
| **Scelta tipo evento (binario vs X/Y vs scalare/fasce)** | Foundation: `ContractType`, `DeterministicContractTypeSelector`, `DeterministicOutcomeGenerator` (multi/scalar) | **No** | Si passa sempre BINARY; selector e outcome generator per multi/scalar non sono usati dalla generazione eventi. |
| **OpportunityAssessor che suggerisca tipo** | Foundation: `DeterministicOpportunityAssessor` | **No** (per il tipo) | Valuta solo opportunity (score, status); non suggerisce contract type. |
| **Sezione titolo MDE** | Foundation: `DeterministicTitleGenerator` | **Solo discovery path** | Usata in `run-mde-pipeline.ts` quando si usa il path discovery-backed. Storyline e trend non la usano. |
| **Psychological Title Engine** | `lib/psychological-title-engine` | **Solo trend path** | Usato in `candidate-event-generator/algorithm.ts`. Storyline e discovery non lo usano. |
| **Studio del titolo nello storyline** | — | **No** | Solo template che compongono la domanda; nessun motore titolo. |

In sintesi:

- **Tipo di evento:** non c'è nulla che "capisca la notizia e scelga il tipo migliore". Tutto è forzato a binario; la capacità multi-outcome/scalar (e futuri) c'è in MDE ma non è usata.
- **Titolo:** ci sono due "sezioni" dedicate (MDE title generator e Psychological Title Engine), ma ciascuna è usata solo in un path (discovery la prima, trend la seconda); lo storyline non ha nessuna sezione dedicata allo studio del titolo.

Fine del report.
