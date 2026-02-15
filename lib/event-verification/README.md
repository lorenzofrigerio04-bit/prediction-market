# event-verification (Fase 2)

Modulo per **filtrare i candidati** in base a qualità e risolvibilità: “è una notizia verificabile?” e “l’evento è risolvibile in modo binario (SÌ/NO)?”.

- **Input:** array di candidati dalla Fase 1 (`NewsCandidate[]` da `lib/event-sources`).
- **Output:** array di candidati verificati (`VerifiedCandidate[]`), stesso formato + `verificationScore` (0–1), ordinati per score.
- **Nessuna scrittura in DB.**

## Uso

```ts
import { verifyCandidates } from "@/lib/event-verification";
import { fetchTrendingCandidates } from "@/lib/event-sources";

const candidates = await fetchTrendingCandidates(50);
const verified = verifyCandidates(candidates);
```

## Criteri e configurazione

Vedi **[docs/EVENT_VERIFICATION_CRITERIA.md](../../docs/EVENT_VERIFICATION_CRITERIA.md)** per:

- Checklist risolvibilità (esito binario, fonte ufficiale, scadenza plausibile)
- Whitelist/blacklist domini (env o file)
- Euristiche su titolo (lunghezza, parole chiave da evitare)
- Variabili d’ambiente

## Test

```bash
npm run verify-candidates
```

Esegue `scripts/verify-candidates-example.ts` su 10 notizie di esempio e stampa candidati verificati e scartati.
