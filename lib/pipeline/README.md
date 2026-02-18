# Event Generation Pipeline V2

Pipeline pulita per la generazione di eventi senza logica di fallback.

## Caratteristiche

- ✅ **Validazione rigorosa**: Ogni evento viene validato prima della creazione
- ✅ **Nessun fallback**: Gli errori vengono gestiti chiaramente senza usare dati alternativi
- ✅ **Transazioni atomiche**: Supporto per transazioni Prisma per garantire atomicità
- ✅ **Logging dettagliato**: Log chiari per debugging e audit
- ✅ **Type-safe**: Completamente tipizzato con TypeScript
- ✅ **Gestione errori chiara**: Risultati dettagliati per ogni evento

## Struttura

```
lib/pipeline/
├── types.ts          # Tipi TypeScript
├── validation.ts     # Funzioni di validazione
├── runPipelineV2.ts # Funzione principale pipeline
└── README.md         # Questa documentazione
```

## Utilizzo

### Esempio base

```typescript
import { runPipelineV2 } from "@/lib/pipeline/runPipelineV2";
import type { EventInput } from "@/lib/pipeline/types";

const events: EventInput[] = [
  {
    title: "Bitcoin supererà $100k entro fine anno?",
    description: "Il prezzo di Bitcoin continuerà a salire...",
    category: "Economia",
    closesAt: new Date("2024-12-31T23:59:59Z"),
    createdById: "user-id-here",
    b: 1000,
    realWorldEventTime: new Date("2025-01-01T00:00:00Z"),
  },
];

const result = await runPipelineV2(events);

if (result.allSuccessful) {
  console.log("Tutti gli eventi creati con successo!");
} else {
  console.error(`${result.failed} eventi falliti`);
  result.results.forEach((r) => {
    if (!r.success) {
      console.error(`- ${r.input.title}:`, r.errors || r.error);
    }
  });
}
```

### Opzioni avanzate

```typescript
const result = await runPipelineV2(events, {
  useTransaction: true,  // Usa transazione (default: true)
  stopOnError: false,    // Continua anche se un evento fallisce (default: false)
  logger: (msg, ...args) => {
    // Logger personalizzato
    console.log(`[CUSTOM] ${msg}`, ...args);
  },
});
```

## Validazione

La pipeline valida ogni evento controllando:

1. **Campi obbligatori**: `title`, `category`, `closesAt`, `createdById`, `b`
2. **Vincoli sui campi**:
   - Title: 3-500 caratteri
   - Description: max 5000 caratteri
   - `b`: tra 1 e 100000
3. **Coerenza temporale**:
   - `closesAt` deve essere almeno 24h nel futuro
   - `closesAt` non può essere più di 730 giorni nel futuro
   - Se `realWorldEventTime` è fornito, viene validata la coerenza temporale usando `lib/markets/time-coherence`
4. **Regole business**:
   - `resolutionTimeExpected` >= `realWorldEventTime` (se entrambi forniti)
   - `realWorldEventTime` non può essere nel passato

## Risultati

La funzione restituisce un `PipelineResult` con:

- `total`: Numero totale di eventi processati
- `successful`: Numero di eventi creati con successo
- `failed`: Numero di eventi falliti
- `results`: Array dettagliato con risultato per ogni evento
- `allSuccessful`: `true` se tutti gli eventi sono stati creati con successo

Ogni risultato include:
- `success`: Se l'evento è stato creato
- `eventId`: ID dell'evento creato (se successo)
- `errors`: Errori di validazione (se fallito)
- `error`: Messaggio di errore (se fallito)
- `input`: Dati di input originali

## Transazioni

Per default, la pipeline usa una transazione Prisma per garantire atomicità:
- Se tutti gli eventi sono validi e vengono creati con successo, la transazione viene committata
- Se un evento fallisce e `stopOnError` è `true`, la transazione viene fatta rollback
- Se `useTransaction` è `false`, gli eventi vengono creati sequenzialmente senza transazione

## Note importanti

- **Nessun fallback**: La pipeline non usa dati alternativi se la validazione fallisce
- **Validazione rigorosa**: Ogni evento deve passare tutti i controlli prima della creazione
- **Atomicità**: Con `useTransaction: true`, tutti gli eventi vengono creati o nessuno
- **Logging**: Usa il logger fornito (o `console.log` di default) per tracciare il processo

## Esempi di errore

### Validazione fallita

```typescript
const result = await runPipelineV2([
  {
    title: "", // Titolo vuoto
    category: "Tech",
    closesAt: new Date(),
    createdById: "user-id",
    b: 1000,
  },
]);

// result.results[0].errors = ["Title is required and must be a non-empty string"]
```

### Coerenza temporale fallita

```typescript
const result = await runPipelineV2([
  {
    title: "Evento test",
    category: "Sport",
    closesAt: new Date("2024-12-31T23:00:00Z"),
    realWorldEventTime: new Date("2024-12-31T23:30:00Z"), // Solo 30min dopo closesAt
    createdById: "user-id",
    b: 1000,
  },
]);

// result.results[0].errors = ["Time coherence validation failed: closesAt must be at least 1h before realWorldEventTime"]
```
