# Tipi di mercato (Market Types)

La piattaforma supporta **9 tipi di mercato**. Il tipo determina come si formula la domanda, come si risolve l’evento e come si calcolano i payout. L’**AI Market Type Selector** (nel pipeline di generazione eventi) sceglie il tipo più adatto in base a notizia e categoria.

---

## 1. Binary (Sì/No)

- **ID:** `BINARY`
- **Definizione:** Due soli esiti (YES/NO).
- **Quando usarlo:** Breaking news, decisioni politiche, eventi chiari e verificabili.
- **Esempio:** *L’UE approverà nuove sanzioni contro l’Iran entro il 30 giugno 2026?* YES / NO
- **Risoluzione:** `outcome` = `"YES"` o `"NO"`.
- **Payout:** Implementato: chi ha quote sulla mano vincente riceve 1 credit per share (AMM).

---

## 2. Multiple Choice (Categorico)

- **ID:** `MULTIPLE_CHOICE`
- **Definizione:** Più opzioni, una sola vincente.
- **Quando usarlo:** Sport, elezioni, premi.
- **Esempio:** *Chi vincerà la Champions League 2025-26?* Real Madrid | Manchester City | Inter | Bayern | Altro
- **Dati evento:** `Event.outcomes` = array di `{ key, label }`. `outcome` = chiave dell’opzione vincente.
- **Risoluzione:** `outcome` = key dell’opzione vincente (es. `"real_madrid"`).
- **Payout:** (Da implementare) payout solo per l’opzione vincente; richiede posizioni per outcome (multi-outcome AMM o tabella dedicata).

---

## 3. Scalar (Numerico continuo)

- **ID:** `SCALAR`
- **Definizione:** Il risultato è un numero continuo.
- **Quando usarlo:** Prezzi, inflazione, dati macro.
- **Esempio:** *Prezzo del petrolio Brent il 30 giugno 2026 ($)*
- **Dati evento:** `Event.scalarConfig` = `{ min, max, unit }`. Alla risoluzione si può salvare il valore in `outcome` (es. numero) o in un campo dedicato.
- **Risoluzione:** Valore numerico; regola di payout (es. “closest to” o proporzionale) da definire.
- **Payout:** (Da implementare) tipicamente tramite bucket (come RANGE) o formula su distanza dal valore risolto.

---

## 4. Range (Intervalli)

- **ID:** `RANGE`
- **Definizione:** Il valore cade in un intervallo predefinito.
- **Quando usarlo:** Alternativa più semplice allo scalare, adatta al retail.
- **Esempio:** *Prezzo benzina in Italia a giugno 2026:* &lt; €1.90 | €1.90–2.10 | €2.10–2.40 | €2.40+
- **Dati evento:** `Event.outcomes` = array di intervalli (key + label). `outcome` = key dell’intervallo in cui cade il valore.
- **Risoluzione:** `outcome` = key del bucket vincente.
- **Payout:** Come MULTIPLE_CHOICE (un solo bucket vince).

---

## 5. Threshold (Soglia singola)

- **ID:** `THRESHOLD`
- **Definizione:** Sopra/sotto una soglia (sì/no).
- **Quando usarlo:** Versioni semplici di mercati numerici.
- **Esempio:** *Bitcoin supererà $100.000 nel 2026?* YES / NO
- **Risoluzione:** Come BINARY: `outcome` = `"YES"` o `"NO"`.
- **Payout:** Come BINARY (già supportato).

---

## 6. Ladder (Multi-soglia)

- **ID:** `LADDER`
- **Definizione:** Più soglie indipendenti (serie di binary).
- **Quando usarlo:** Massimo engagement su prezzi, crypto, energia.
- **Esempio:** *BTC entro il 2026: $90k? $100k? $120k? $150k?* → ogni soglia = mercato separato
- **Modellazione:** Non è un singolo evento con N outcome: sono **N eventi** (BINARY o THRESHOLD). Il pipeline/agent può generare N formulazioni, ognuna pubblicata come evento a sé.
- **Risoluzione/Payout:** Come BINARY per ogni evento.

---

## 7. Time-to-Event

- **ID:** `TIME_TO_EVENT`
- **Definizione:** Quando accadrà qualcosa (bucket temporali).
- **Quando usarlo:** Eventi attesi ma incerti (politica, tech, conflitti).
- **Esempio:** *Quando finirà il conflitto Iran-Israele?* entro giugno 2026 | entro dicembre 2026 | 2027 | dopo il 2027
- **Dati evento:** `Event.outcomes` = array di periodi. `outcome` = key del periodo vincente.
- **Risoluzione:** `outcome` = key del bucket temporale verificato.
- **Payout:** Come MULTIPLE_CHOICE.

---

## 8. Count / Volume

- **ID:** `COUNT_VOLUME`
- **Definizione:** Numero di eventi (o volume) entro una data.
- **Quando usarlo:** Metriche cumulative (sport, economia).
- **Esempio:** *Quanti gol farà Lautaro in Serie A 2025-26?* 0–15 | 16–20 | 21–25 | 25+
- **Dati evento:** `Event.outcomes` = array di range numerici. `outcome` = key del range in cui cade il conteggio.
- **Risoluzione:** `outcome` = key del bucket.
- **Payout:** Come MULTIPLE_CHOICE.

---

## 9. Ranking / Position

- **ID:** `RANKING`
- **Definizione:** Posizione finale in classifica.
- **Quando usarlo:** Campionati, classifiche aziendali.
- **Esempio:** *Posizione finale Ferrari nel mondiale F1 2026:* 1° | 2° | 3° | 4°+
- **Dati evento:** `Event.outcomes` = posizioni. `outcome` = key della posizione verificata.
- **Risoluzione:** `outcome` = key della posizione.
- **Payout:** Come MULTIPLE_CHOICE.

---

## Schema DB (Event)

- **marketType:** `String`, default `"BINARY"`. Uno dei 9 ID sopra.
- **outcomes:** `Json?`. Per MULTIPLE_CHOICE, RANGE, TIME_TO_EVENT, COUNT_VOLUME, RANKING: `[{ "key": "id", "label": "Etichetta" }]`.
- **scalarConfig:** `Json?`. Per SCALAR: `{ "min": number, "max": number, "unit": string }`.
- **outcome:** `String?`. Alla risoluzione: per BINARY/THRESHOLD `"YES"`|`"NO"`; per gli altri tipi a singola opzione vincente = key dell’opzione vincente.

---

## AI Market Type Selector

Nel pipeline (es. **AI Title Engine**), una chiamata LLM riceve notizia e categoria e restituisce:

- **market_type:** uno dei 9 tipi
- **title:** titolo della domanda (soggetto + azione + scadenza)

Il prompt descrive ogni tipo e quando usarlo, in modo che l’agente scelga la forma migliore per la notizia (es. “chi vincerà” → MULTIPLE_CHOICE, “supererà X?” → THRESHOLD/BINARY, “quanto costerà” → SCALAR/RANGE).

Riferimento implementativo: `lib/market-types`, `lib/ai-title-engine/prompts.ts`, `lib/ai-title-engine/generate-title-and-market-type.ts`.

---

## Stato implementazione

| Tipo            | Schema | AI Selector | Risoluzione API | Payout AMM   |
|-----------------|--------|-------------|-----------------|--------------|
| BINARY          | ✅     | ✅          | ✅ YES/NO       | ✅           |
| THRESHOLD       | ✅     | ✅          | ✅ YES/NO       | ✅           |
| LADDER          | ✅     | ✅          | N eventi       | ✅ (per evento) |
| MULTIPLE_CHOICE | ✅     | ✅          | outcome = key   | 🔲 da fare   |
| RANGE           | ✅     | ✅          | outcome = key   | 🔲 da fare   |
| TIME_TO_EVENT   | ✅     | ✅          | outcome = key   | 🔲 da fare   |
| COUNT_VOLUME    | ✅     | ✅          | outcome = key   | 🔲 da fare   |
| RANKING         | ✅     | ✅          | outcome = key   | 🔲 da fare   |
| SCALAR          | ✅     | ✅          | valore numerico | 🔲 da fare   |

Per i tipi multi-opzione (MULTIPLE_CHOICE, RANGE, ecc.) il passo successivo è estendere Position/Trade (o introdurre una struttura per quote per outcome) e la logica di payout in `lib/amm/resolve.ts`.

---

## Criteri di selezione e verifica

Criteri con cui le notizie sono selezionate e validate (titolo, verificabilità, binary vs multi-outcome): vedi [EVENT_VERIFICATION_CRITERIA.md](./EVENT_VERIFICATION_CRITERIA.md).
