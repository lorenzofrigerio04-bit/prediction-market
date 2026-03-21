# Architettura: Titolo AI e Scelta Tipo di Mercato

## Obiettivo

1. **Titolo**: chiaro, esplicativo, stile Polymarket; formato coerente (es. "Succederà X entro Y?", "Chi vincerà X?").
2. **Tipo di mercato**: un blocco decide la forma migliore (binario, scalare, multi-outcome, range) in base alla notizia; il titolo segue il formato più adatto a quel tipo.
3. **Costi e richieste**: nessun picco di chiamate LLM; tetto per run; fallback al titolo rule-based.

## Ordine in pipeline

1. **Prima**: si decide il **market type** (binario, scalare, multi-outcome, range) con un’AI che considera la notizia/claim (e in futuro esempi simili per topic su Polymarket).
2. **Poi**: si genera il **titolo** in base al market type scelto (formato adatto: domanda sì/no, chi vince, numero in range, ecc.).

In implementazione le due decisioni avvengono in **una sola chiamata LLM** per candidato (output: `market_type` + `title`) per contenere costi e latenza.

## Controllo costi e richieste

| Meccanismo | Descrizione |
|------------|-------------|
| **Feature flag** | `USE_AI_TITLE_GENERATION=true` abilita titolo + market type via AI. Se assente o `false`, si usa solo il titolo rule-based (Psychological Title Engine). |
| **Tetto per run** | `OPENAI_MAX_TITLE_CALLS_PER_RUN` (default 20): al massimo N candidati per run ricevono la chiamata AI; gli altri usano il titolo già riscritto (rule-based). |
| **DISABLE_OPENAI** | Se `DISABLE_OPENAI=true`, nessuna chiamata LLM (comportamento esistente). |
| **Un’unica chiamata per candidato** | Un solo prompt restituisce sia `market_type` sia `title`; niente due step separati. |
| **Modello** | `gpt-4o-mini` (o `AI_TITLE_MODEL`) per basso costo. |

Stima: 20 candidati × 1 chiamata = 20 chiamate per run di generazione eventi; con cron tipico (es. ogni 1–2 ore) resti ampiamente sotto “mille richieste al secondo”.

## Tipi di mercato supportati (output AI)

- **BINARY**: sì/no, deadline, “Succederà X entro Y?”
- **SCALAR**: numero/soglia (es. “Quanto varrà X a fine anno?”)
- **MULTI_OUTCOME**: più alternative (es. “Chi vincerà X?”)
- **RANGE**: intervallo (es. “In quale range sarà X?”)

Il backend oggi supporta solo mercati binari; `market_type` viene salvato in `creationMetadata` per uso futuro (UI, scalare/multi-outcome quando implementati).

## Formato titolo per tipo (linee guida prompt)

- **BINARY**: “Succederà X entro Y?”, “Sarà approvato X entro Y?”
- **MULTI_OUTCOME / “chi vince”**: “Chi vincerà X?”, “Quale paese vincerà X?”
- **SCALAR**: “Quanto varrà X a Y?”, “Quale sarà il valore di X entro Y?”
- **RANGE**: “In quale intervallo sarà X a Y?”

Requisiti comuni: massimo ~110 caratteri, italiano, domanda chiara, niente gergo, stile Polymarket (immediatamente comprensibile).

## Flusso in pipeline (discovery-backed)

1. **Lead** → **MDE** → artefatti (titleSet, resolutionSummary, pipeline).
2. **pipelineArtifactsToAppCandidate**: per ogni artefatto si costruisce il `Candidate` con titolo rule-based (`rewriteFreeformTitleForMarket`) e si conserva il titolo grezzo in `rawTitle`.
3. **Enrich (se abilitato)**: `enrichCandidatesWithAITitles(candidates, { maxCalls })`:
   - per i primi `min(maxCalls, candidates.length)` candidati: una chiamata LLM → `market_type` + `title`;
   - titolo del candidato sostituito con quello AI; `marketType` salvato sul candidato;
   - in caso di errore LLM: si lascia il titolo rule-based (fallback).
4. **Validate** → **Score** → **Dedup** → **Select** → **Publish**.
5. In **publish**, `creationMetadata` include `market_type` (e altri campi esistenti) per persistenza su `Event`.

## Fallback

- AI disabilitata (`USE_AI_TITLE_GENERATION` non true, o `DISABLE_OPENAI`): nessuna chiamata; si usa solo il titolo da Psychological Title Engine.
- Errore LLM (timeout, API, parse): per quel candidato si mantiene il titolo già calcolato (rule-based) e non si imposta `marketType` (o si imposta un default opzionale).
- Candidati oltre il tetto: nessuna chiamata per loro; titolo rule-based.

## File principali

- **Config**: `lib/ai-title-engine/config.ts` (env, max calls, model).
- **Tipi**: `lib/ai-title-engine/types.ts` (MarketType, AITitleResult).
- **Generazione**: `lib/ai-title-engine/generate-title-and-market-type.ts` (una chiamata, risposta strutturata JSON).
- **Enrich**: `lib/ai-title-engine/enrich-candidates.ts` (itera candidati, applica AI ai primi N, fallback).
- **Integrazione**: `lib/event-gen-v2/discovery-backed-integration.ts` (dopo costruzione candidati, prima di validate).
- **Candidate**: `rawTitle` e `marketType` opzionali in `lib/event-gen-v2/types.ts`.
- **Publish**: `lib/event-gen-v2/publisher.ts` (inserimento `market_type` in `creationMetadata`).

## Futuro (Polymarket come riferimento)

L’AI che sceglie il market type può essere estesa con:
- esempi per topic/categoria (es. “sport” → spesso MULTI_OUTCOME “Chi vincerà”);
- struttura della notizia (soglia numerica → SCALAR/RANGE, scadenza sì/no → BINARY).

Questo può essere introdotto nel prompt (es. “Per notizie simili su Polymarket si usano spesso mercati binari con formato ‘Succederà X entro Y?’”) senza cambiare l’architettura attuale.
