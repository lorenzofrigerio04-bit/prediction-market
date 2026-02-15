# Criteri di verifica eventi (Fase 2)

Modulo: `lib/event-verification`.  
Input: array di **candidati** dalla Fase 1 (notizie normalizzate).  
Output: array di **candidati verificati** (stesso formato + `verificationScore` 0–1).  
Nessuna scrittura in DB: solo filtri e score.

---

## Checklist risolvibilità

Un evento è adatto al prediction market se:

1. **Esito binario (SÌ/NO)**  
   La domanda deve poter essere risolta in modo binario (es. “Il partito X vince le elezioni?” Sì/No).  
   Non adatti: “Chi vincerà?”, “Quanto aumenterà l’inflazione?”.

2. **Fonte ufficiale per la risoluzione**  
   Deve esistere (o essere plausibile) una fonte ufficiale che a scadenza permetta di stabilire l’esito (es. Ministero, ISTAT, risultato ufficiale gara, sentenza).

3. **Scadenza plausibile**  
   Deve essere possibile definire una data/ora entro cui l’evento si risolve (es. “referendum il 22 ottobre”, “sentenza entro 90 giorni”).

Il modulo applica **euristiche** su titolo, snippet, URL e source per stimare questi tre punti e produrre un `verificationScore`.

---

## Cosa fa il modulo

- **Whitelist/blacklist domini**  
  Configurabili da env (`EVENT_VERIFICATION_DOMAIN_WHITELIST`, `EVENT_VERIFICATION_DOMAIN_BLACKLIST`, comma-separated) o da file JSON (`EVENT_VERIFICATION_DOMAINS_FILE` con chiavi `whitelist` e `blacklist`).  
  Se la whitelist non è vuota, sono ammessi solo i domini in whitelist. I domini in blacklist sono sempre esclusi.

- **Filtro titoli vaghi**  
  Titoli troppo corti o troppo lunghi (soglie configurabili) e titoli che contengono parole/frasi di vaghezza (es. “potrebbe”, “forse”, “si dice”, “rumors”, “?”) vengono scartati.

- **Score di verificabilità (0–1)**  
  Calcolato a partire da: dominio ammesso, titolo non vago, esito binario (euristica), fonte “ufficiale” (euristica su dominio/source), scadenza plausibile (euristica su titolo/snippet).  
  I candidati in output possono essere ordinati per questo score; opzionalmente si scartano quelli sotto una soglia (`EVENT_VERIFICATION_MIN_SCORE`, `EVENT_VERIFICATION_FILTER_BY_SCORE`).

---

## API principale

```ts
import { verifyCandidates } from "@/lib/event-verification";
import type { NewsCandidate } from "@/lib/event-sources";

const candidates: NewsCandidate[] = [ /* da Fase 1 */ ];
const verified = verifyCandidates(candidates);
// verified: VerifiedCandidate[] (stesso formato + verificationScore), ordinati per score
```

Config opzionale come secondo argomento; altrimenti si usa la config da env (vedi sotto).

---

## Variabili d’ambiente (opzionali)

| Variabile | Descrizione |
|-----------|-------------|
| `EVENT_VERIFICATION_DOMAIN_WHITELIST` | Domini ammessi (comma-separated). Vuoto = tutti ammessi (salvo blacklist). |
| `EVENT_VERIFICATION_DOMAIN_BLACKLIST` | Domini sempre esclusi (comma-separated). |
| `EVENT_VERIFICATION_DOMAINS_FILE` | Path a file JSON con `whitelist` e `blacklist` (array di stringhe). |
| `EVENT_VERIFICATION_MIN_TITLE_LENGTH` | Lunghezza minima titolo (default 15). |
| `EVENT_VERIFICATION_MAX_TITLE_LENGTH` | Lunghezza massima titolo (default 200). |
| `EVENT_VERIFICATION_FILTER_BY_SCORE` | `0` o `false` per non filtrare per score (default: filtra). |
| `EVENT_VERIFICATION_MIN_SCORE` | Soglia minima di `verificationScore` per includere (default 0.25). |

---

## Test / esempi

Script con 10 notizie di esempio (reali o simulate) per validare i filtri:

```bash
npx tsx scripts/verify-candidates-example.ts
```

Verifica che vengano scartati: titoli vaghi, domini in blacklist, titoli troppo corti, e che i candidati verificati abbiano score e criteri coerenti.
