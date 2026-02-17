# Implementazione FOMO (Fear Of Missing Out)

## Riepilogo

Sono state aggiunte funzionalità FOMO al progetto Next.js/React di Prediction Market per aumentare l'engagement e creare urgenza sugli eventi.

## File Modificati/Creati

### Nuovi File

1. **`lib/fomo/event-stats.ts`**
   - Funzione `getEventStats(eventId)` per calcolare statistiche FOMO per un singolo evento
   - Funzione `getEventsWithStats(eventIds[])` per calcolo batch più efficiente
   - Calcola: countdown, participantsCount, votesVelocity, pointsMultiplier

2. **`app/api/events/closing-soon/route.ts`**
   - Nuova API route per eventi in scadenza (< 6h)
   - Restituisce eventi ordinati per `closesAt` ascendente

3. **`app/api/events/trending-now/route.ts`**
   - Nuova API route per eventi trending
   - Restituisce eventi ordinati per `votesVelocity` discendente

4. **`types/event.ts`**
   - Tipi TypeScript condivisi per eventi con statistiche FOMO

### File Modificati

1. **`app/api/events/route.ts`**
   - Aggiunto calcolo statistiche FOMO per tutti gli eventi restituiti
   - Ogni evento ora include campo `fomo` con le statistiche

2. **`app/page.tsx`** (Homepage)
   - Aggiunta sezione "In scadenza" che mostra eventi con `closesAt < now+6h`
   - Aggiunta sezione "In tendenza" che mostra eventi ordinati per `votesVelocity desc`
   - Entrambe le sezioni fetchano dati dalle nuove API routes

3. **`components/EventCard.tsx`**
   - Aggiunto countdown live che si aggiorna ogni secondo
   - Mostra `participantsCount` invece di `_count.predictions` quando disponibile
   - Mostra `votesVelocity` nella stat "Trend" quando disponibile
   - Mostra badge `pointsMultiplier` quando evento è in scadenza (< 6h) e multiplier > 1.0

4. **`app/discover/page.tsx`**
   - Aggiornato tipo `DiscoverEvent` per includere campo opzionale `fomo`

## Logica Implementata

### Countdown Live
- Calcolato come `closesAt - now` in millisecondi
- Si aggiorna ogni secondo nel componente EventCard
- Formattato come "Xg Yh", "X ore rimaste", "X min" o "Presto"

### ParticipantsCount
- Numero di utenti unici che hanno fatto previsioni (GROUP BY userId)
- Fallback: se non ci sono previsioni, usa `totalVotes` (event._count.predictions)

### VotesVelocity
- Calcolato come: numero voti negli ultimi 120 minuti / 2 (voti per ora)
- Fallback: se non ci sono voti recenti, usa `totalVotes / max(hoursSinceCreated, 1)`
- Arrotondato a 2 decimali

### PointsMultiplier
- 1.0 base
- 1.1 se scadenza < 24h
- 1.2 se scadenza < 6h
- 1.3 se scadenza < 2h
- Mostrato solo se evento è in scadenza (< 6h) e multiplier > 1.0

### ClosingSoon
- Eventi con `expiresAt < now+6h` e `resolved = false`
- Ordinati per `closesAt` ascendente (più vicini alla scadenza prima)

### TrendingNow
- Eventi aperti ordinati per `votesVelocity` discendente
- Se `votesVelocity` è uguale, ordina per `totalCredits` discendente

## Tipi TypeScript

```typescript
interface EventFomoStats {
  countdownMs: number;
  participantsCount: number;
  votesVelocity: number;
  pointsMultiplier: number;
  isClosingSoon: boolean;
}

interface EventWithFomo {
  // ... campi Event standard
  fomo: EventFomoStats;
}
```

## Checklist Test Manuale

### 1. Verifica API Routes

#### `/api/events`
- [ ] Aprire `/api/events?status=open&limit=5` nel browser o con curl
- [ ] Verificare che ogni evento abbia campo `fomo` con:
  - `countdownMs`: numero positivo se evento aperto
  - `participantsCount`: numero >= 0
  - `votesVelocity`: numero >= 0
  - `pointsMultiplier`: 1.0, 1.1, 1.2 o 1.3
  - `isClosingSoon`: true se < 6h, false altrimenti

#### `/api/events/closing-soon`
- [ ] Aprire `/api/events/closing-soon?limit=10`
- [ ] Verificare che tutti gli eventi abbiano `closesAt` entro 6 ore da ora
- [ ] Verificare che siano ordinati per `closesAt` ascendente (più vicini prima)
- [ ] Verificare che tutti abbiano `fomo.isClosingSoon = true`

#### `/api/events/trending-now`
- [ ] Aprire `/api/events/trending-now?limit=10`
- [ ] Verificare che tutti gli eventi siano aperti (`resolved = false`)
- [ ] Verificare che siano ordinati per `votesVelocity` discendente
- [ ] Se ci sono eventi con stesso `votesVelocity`, verificare ordinamento per `totalCredits` desc

### 2. Verifica Homepage

#### Sezione "In scadenza"
- [ ] Accedere alla homepage loggato
- [ ] Verificare presenza sezione "In scadenza" (se ci sono eventi < 6h)
- [ ] Verificare che gli eventi mostrati chiudano entro 6 ore
- [ ] Verificare che il countdown si aggiorni ogni secondo
- [ ] Verificare presenza badge `pointsMultiplier` (×1.2 o ×1.3) se evento < 6h

#### Sezione "In tendenza"
- [ ] Verificare presenza sezione "In tendenza"
- [ ] Verificare che gli eventi siano ordinati per velocità voti (più voti/ora prima)
- [ ] Verificare che nella stat "Trend" sia mostrato `votesVelocity` invece di "—"
- [ ] Verificare che nella stat "Previsioni" sia mostrato `participantsCount` invece di `_count.predictions`

### 3. Verifica EventCard

#### Countdown Live
- [ ] Aprire homepage o discover page
- [ ] Verificare che il countdown si aggiorni ogni secondo
- [ ] Verificare formato: "Xg Yh", "X ore rimaste", "X min", "Presto" o "Chiuso"
- [ ] Verificare che il colore cambi quando evento è urgente (< 24h)

#### ParticipantsCount
- [ ] Verificare che nella stat "Previsioni" sia mostrato numero partecipanti unici
- [ ] Se evento ha previsioni ma `fomo` non disponibile, verificare fallback a `_count.predictions`

#### VotesVelocity
- [ ] Verificare che nella stat "Trend" sia mostrato `votesVelocity` con formato "X.X Voti/h"
- [ ] Se `fomo` non disponibile, verificare fallback a "—"

#### PointsMultiplier Badge
- [ ] Verificare presenza badge `×1.2` o `×1.3` accanto al countdown per eventi < 6h
- [ ] Verificare che badge non appaia per eventi > 6h anche se multiplier > 1.0
- [ ] Verificare che badge non appaia per eventi chiusi

### 4. Verifica Fallback

#### VotesVelocity Fallback
- [ ] Creare evento nuovo (senza voti recenti)
- [ ] Verificare che `votesVelocity` sia calcolato come `totalVotes / hoursSinceCreated`
- [ ] Verificare che non sia 0 se ci sono previsioni totali

#### ParticipantsCount Fallback
- [ ] Creare evento senza previsioni
- [ ] Verificare che `participantsCount` sia 0 invece di errore
- [ ] Se ci sono previsioni ma GROUP BY non funziona, verificare fallback a `_count.predictions`

### 5. Verifica Performance

#### Calcolo Batch
- [ ] Verificare che `/api/events` con molti eventi non sia lento
- [ ] Verificare che `getEventsWithStats` usi query batch invece di N+1
- [ ] Verificare che cache funzioni per richieste trending (se applicabile)

### 6. Verifica Edge Cases

#### Eventi Chiusi
- [ ] Verificare che eventi chiusi non appaiano in `closing-soon` o `trending-now`
- [ ] Verificare che `countdownMs` sia negativo per eventi chiusi
- [ ] Verificare che badge `pointsMultiplier` non appaia per eventi chiusi

#### Eventi Senza Previsioni
- [ ] Verificare che eventi senza previsioni abbiano `participantsCount = 0`
- [ ] Verificare che eventi senza previsioni abbiano `votesVelocity = 0` (o fallback)

#### Eventi Molto Vecchi
- [ ] Verificare che eventi creati molto tempo fa abbiano `votesVelocity` calcolato correttamente
- [ ] Verificare che `hoursSinceCreated` non sia 0 nel fallback

## Note Implementative

1. **Performance**: `getEventsWithStats` usa query batch per evitare N+1 queries
2. **Fallback**: Tutti i calcoli hanno fallback per gestire dati mancanti
3. **Type Safety**: Tutti i tipi TypeScript sono aggiornati per includere `fomo` opzionale
4. **Backward Compatibility**: I campi FOMO sono opzionali, quindi il codice esistente continua a funzionare

## Prossimi Passi (Opzionali)

- [ ] Aggiungere cache per statistiche FOMO (es. Redis con TTL 5 minuti)
- [ ] Aggiungere indicatore visivo più prominente per eventi in scadenza
- [ ] Aggiungere notifiche push per eventi in scadenza seguiti
- [ ] Aggiungere grafico trend votesVelocity nel tempo
- [ ] Ottimizzare query per eventi con molti partecipanti
