# Storyline Engine - BLOCCO 3

Sistema di filtro rigoroso che valuta i cluster di segnali (storyline) e permette solo quelli di qualità sufficiente di procedere alla generazione eventi.

## Architettura

```
lib/storyline-engine/
├── types.ts          # Tipi TypeScript
├── config.ts         # Configurazione con default e env vars
├── momentum.ts       # Calcolo momentum (0-100)
├── novelty.ts        # Calcolo novelty (0-100)
├── authority.ts      # Verifica authority risolvibile
├── filter.ts         # Filtro principale
├── index.ts          # Entry point principale
└── __tests__/        # Test unitari
    ├── momentum.test.ts
    ├── novelty.test.ts
    └── authority.test.ts
```

## Configurazione

Variabili d'ambiente (con default):
- `STORYLINE_MIN_SIGNALS=3` - Minimo segnali per storyline valida
- `STORYLINE_MAX_AGE_HOURS=72` - Età massima in ore
- `STORYLINE_MIN_MOMENTUM=15` - Momentum minimo (0-100)
- `STORYLINE_MIN_NOVELTY=20` - Novelty minima (0-100)
- `STORYLINE_DEBUG=true` - Abilita logging debug

## Utilizzo

```typescript
import { getEligibleStorylines } from '@/lib/storyline-engine';
import { prisma } from '@/lib/prisma';

const eligible = await getEligibleStorylines({
  prisma,
  now: new Date(),
  lookbackHours: 168, // 7 giorni
});

// eligible contiene solo storyline che passano tutti i filtri
```

## Metriche

### Momentum (0-100)
Calcolo basato su bucket temporali:
- `n6h`: segnali nelle ultime 6 ore
- `n24h`: segnali nelle ultime 24 ore
- `n72h`: segnali nelle ultime 72 ore
- Formula: `raw = (2 * n6h) + (1 * n24h) + (0.5 * n72h)`
- Normalizzazione: `momentum = min(100, round(raw * 10))`

### Novelty (0-100)
Combinazione di ageScore e uniqScore:
- **ageScore** (70%): `clamp(100 - (ageHours * 5), 0, 100)`
- **uniqScore** (30%): Jaccard similarity con altre storyline
- Formula: `novelty = round(0.7 * ageScore + 0.3 * uniqScore)`

### Authority
Verifica authority risolvibile:
- **OFFICIAL**: `sourceType` in `{RSS_OFFICIAL, CALENDAR_SPORT, CALENDAR_EARNINGS}` AND `host ∈ officialHosts`
- **REPUTABLE**: `host ∈ reputableHosts`
- Se nessuna authority trovata → storyline NON ELIGIBLE (regola brutale)

## Filtri Applicati

Una storyline è eligible se passa TUTTI questi controlli (in ordine):
1. `signalsCount >= MIN_SIGNALS`
2. `ageHours <= MAX_AGE_HOURS`
3. `momentum >= MIN_MOMENTUM`
4. `novelty >= MIN_NOVELTY`
5. `authority !== null` (regola brutale)

## Test

Eseguire i test:
```bash
npm run test -- lib/storyline-engine
```

Tutti i test passano ✅ (17 test, 3 file)

## Performance

- Novelty calculation ottimizzata:
  - Se ≤ 200 cluster → confronto completo pairwise
  - Se > 200 cluster → confronto solo con top 20 per overlap token

## Note

- Tutti i calcoli sono deterministici (no LLM)
- Tokenizzazione per novelty usa stessa logica di Jaccard clustering esistente
- Estrazione host normalizza (rimuove www, lowercase)
- La regola brutale sull'autorità garantisce qualità alta
