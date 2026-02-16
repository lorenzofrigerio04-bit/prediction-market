# Analisi: perché il feed non si vedeva dopo push/deploy

## Cosa succedeva

1. **Homepage (loggato)** chiama `GET /api/feed?limit=8`.
2. **Feed API**:
   - Verifica sessione → se OK, chiama `generateFeedCandidates()`.
   - `generateFeedCandidates` usa:
     - `getMetricsLast6h(prisma)` → **query su tabella `MarketMetrics`**
     - `loadUserProfile(prisma, userId)` → **query su tabella `UserProfile`**
   - Se una di queste tabelle **non esiste** in produzione (migrazioni non eseguite sul DB di prod), Prisma lancia eccezione.
   - L’eccezione non era gestita → **risposta 500** dal feed.

3. **Homepage**:
   - Con **500** il `fetch` va in `.catch()` e faceva fallback a `/api/events` → vedevi la **stessa lista di prima** (eventi recenti).
   - Con **401** (es. sessione non riconosciuta) la risposta non è “ok”, quindi `data` era `null` e `items` vuoti → lista vuota (caso peggiore).

Quindi: **il feed andava in errore (500) in produzione**, la home usava il fallback e **visivamente nulla cambiava**.

---

## Cause tecniche

1. **Tabelle mancanti in produzione**  
   Se su Vercel non hai mai eseguito le migrazioni Prisma sul database di produzione, le tabelle `MarketMetrics` e `UserProfile` non esistono.  
   `prisma.marketMetrics.findMany(...)` e `prisma.userProfile.findUnique(...)` lanciano errore → 500.

2. **Nessun fallback lato server**  
   Se la generazione candidati falliva, il feed rispondeva 500 invece di restituire comunque una lista (es. eventi recenti).

3. **Client: solo fallback su errore di rete**  
   Se il feed rispondeva 200 con `items: []` o 401, il client non faceva fallback a `/api/events` in modo robusto (solo su catch), quindi in alcuni casi potevi vedere lista vuota.

---

## Fix applicati

### 1. `lib/personalization/candidate-generation.ts`

- **`getMetricsLast6h`**: wrappata in `try/catch`. In caso di errore (es. tabella assente) restituisce una `Map` vuota invece di lanciare.
- **`loadUserProfile`**: wrappata in `try/catch`. In caso di errore restituisce `null` (si usa profilo neutro).

Così la generazione candidati non va in crash per tabelle mancanti.

### 2. `app/api/feed/route.ts`

- **Fallback lato server**: se `generateFeedCandidates` lancia o restituisce 0 candidati, il feed non risponde più 500 ma chiama `getRecentEventsAsFeed(limit)` e risponde **200 con quella lista** (stessa forma delle “items” del feed).
- La risposta del feed ha sempre la stessa struttura; il client riceve sempre una lista (personalizzata o “recenti”).

Risultato: anche senza `MarketMetrics`/`UserProfile` il feed risponde 200 e la home mostra eventi.

### 3. `app/page.tsx`

- Se il feed risponde **non ok** (401, 500, ecc.) oppure **ok ma `items` vuoti**, la home fa **sempre** fallback a `GET /api/events?sort=recent&status=open&limit=8` e mostra quella lista.
- Evita di restare con “nessun evento” quando il feed è vuoto o in errore.

---

## Cosa fare adesso

1. **Eseguire le migrazioni in produzione** (se non l’hai già fatto):
   ```bash
   DATABASE_URL="il_tuo_url_di_produzione" npx prisma migrate deploy
   ```
   oppure, se usi solo `db push`:
   ```bash
   DATABASE_URL="il_tuo_url_di_produzione" npx prisma db push
   ```
   Così le tabelle `MarketMetrics` e `UserProfile` esistono e il feed può usare metriche e profilo per la personalizzazione.

2. **Push e nuovo deploy**  
   Dopo il push, Vercel fa il deploy. Dopo 1–2 minuti apri il sito in produzione, fai un refresh (meglio hard refresh: Ctrl+F5 / Cmd+Shift+R).

3. **Verifica**  
   Con utente loggato, in homepage dovresti vedere la sezione “Eventi in tendenza” popolata:
   - con **personalizzazione** se le migrazioni sono state applicate e ci sono dati;
   - con **lista “recenti”** se le tabelle mancano ancora o non c’è ancora attività (in entrambi i casi niente più 500 e nessuna schermata vuota senza fallback).

---

## Riepilogo

| Prima | Dopo |
|-------|------|
| Feed in errore (500) per tabelle mancanti | Feed non va in errore: usa metriche/profilo se ci sono, altrimenti risponde con eventi recenti |
| Client: fallback solo su errore di rete | Client: fallback anche su risposta non ok o `items` vuoti |
| Visivamente “nulla è cambiato” | La home mostra sempre eventi (da feed o da `/api/events`) |

Le modifiche sono state applicate nel codice; dopo push, deploy e (opzionale) migrazioni in produzione il comportamento sarà quello descritto sopra.
