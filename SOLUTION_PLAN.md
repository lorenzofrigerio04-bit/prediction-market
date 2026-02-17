# Piano Definitivo per Risolvere Tutti gli Errori e Stabilizzare la Piattaforma

## Obiettivo
Risolvere **TUTTI** gli errori TypeScript in modo sistematico, completo e definitivo per avere una piattaforma stabile, lineare e funzionante senza problemi.

## Approccio Strategico

### Principi Guida
1. **Completare lo schema Prisma** - Aggiungere tutti i modelli e campi necessari per le funzionalità implementate
2. **Allineare codice allo schema** - Correggere tutte le discrepanze tra codice e schema
3. **Calcolare dinamicamente quando possibile** - Evitare campi ridondanti che possono essere calcolati
4. **Verificare incrementale** - Testare dopo ogni categoria di correzione
5. **Documentare le decisioni** - Tracciare cosa è stato aggiunto e perché

---

## FASE 1: Completare Schema Prisma (Fondamenta)

### 1.1 Aggiungere Modelli Mancanti

I seguenti modelli sono **necessari** perché il codice li usa attivamente:

#### EventFollower
```prisma
model EventFollower {
  id        String   @id @default(cuid())
  userId    String
  eventId   String
  createdAt DateTime @default(now())

  user  User  @relation(fields: [userId], references: [id], onDelete: Cascade)
  event Event @relation(fields: [eventId], references: [id], onDelete: Cascade)

  @@unique([userId, eventId])
  @@index([userId])
  @@index([eventId])
}
```

**Relazioni da aggiungere:**
- In `User`: `followedEvents EventFollower[]`
- In `Event`: `followers EventFollower[]`

#### DailySpin
```prisma
model DailySpin {
  id        String   @id @default(cuid())
  userId    String
  date      DateTime @default(now()) // Data del giorno (solo data, non ora)
  multiplier Float   @default(1.0)
  claimed   Boolean  @default(false)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([userId, date])
  @@index([userId])
  @@index([date])
}
```

**Relazioni da aggiungere:**
- In `User`: `dailySpins DailySpin[]`

#### ShopItem
```prisma
model ShopItem {
  id           String   @id @default(cuid())
  name         String
  type         String   // CREDIT_BUNDLE | COSMETIC | TICKET
  priceCredits Int
  description  String?
  active       Boolean  @default(true)
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt

  @@index([active])
}
```

#### UserBadge (Opzionale - può essere rimandato)
```prisma
model UserBadge {
  id        String   @id @default(cuid())
  userId    String
  badgeId   String   // ID del badge (es: "FIRST_PREDICTION", "STREAK_7")
  earnedAt  DateTime @default(now())

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([userId, badgeId])
  @@index([userId])
}
```

**Relazioni da aggiungere:**
- In `User`: `badges UserBadge[]`

### 1.2 Aggiungere Campi Mancanti al Modello User

```prisma
model User {
  // ... campi esistenti ...
  
  // Campi da aggiungere:
  username           String?   @unique // Username opzionale
  lastDailyBonus     DateTime? // Data ultimo bonus giornaliero
  onboardingCompleted Boolean  @default(false) // Flag onboarding
  
  // NOTA: totalSpent NON va aggiunto - si calcola da Transaction
  // NOTA: streak NON va aggiunto - esiste già streakCount
}
```

### 1.3 Verificare Schema Completo

Dopo le modifiche, lo schema deve includere:
- ✅ User (con tutti i campi necessari)
- ✅ Event (già completo)
- ✅ Prediction (già completo)
- ✅ Notification (già completo)
- ✅ Comment (già completo)
- ✅ Reaction (già completo)
- ✅ Transaction (già completo)
- ✅ AuditLog (già completo)
- ✅ EventFollower (NUOVO)
- ✅ DailySpin (NUOVO)
- ✅ ShopItem (NUOVO)
- ✅ UserBadge (NUOVO - opzionale)

---

## FASE 2: Correggere Campi Non Esistenti nel Codice

### 2.1 Sostituzioni Semplici (Find & Replace)

#### `streak` → `streakCount`
**File da correggere:**
- `app/api/leaderboard/route.ts` (righe: 56, 122)
- `app/api/missions/route.ts` (righe: 30, 34, 55)
- `app/api/profile/[userId]/route.ts` (riga: 38)
- `app/api/profile/stats/route.ts` (riga: 122)
- `app/api/wallet/daily-bonus/route.ts` (righe: 32, 84, 91, 106, 110, 133)

**Azione:** Sostituire tutte le occorrenze di `streak` con `streakCount` quando si riferisce al campo User.

#### `status` → `resolutionStatus` (Event)
**File da correggere:**
- `app/api/notifications/generate/route.ts` (righe: 32, 33, 41, 72)

**Azione:** Sostituire `status` con `resolutionStatus` nelle query Event.

#### `read` → `readAt` (Notification)
**File da correggere:**
- `app/api/notifications/[id]/read/route.ts` (riga: 49)

**Azione:** Invece di `read: true`, usare `readAt: new Date()`.

#### `predictions` → `Prediction` (case-sensitive in _count)
**File da correggere:**
- `app/api/events/closing-soon/route.ts` (riga: 62)
- `app/api/events/route.ts` (riga: 127)
- `app/api/events/trending-now/route.ts` (riga: 58)

**Azione:** Sostituire `_count.predictions` con `_count.Prediction`.

### 2.2 Rimozioni di Campi Non Necessari

#### `yesPredictions` (Event)
**File:** `app/api/events/resolve/[eventId]/route.ts` (riga: 68)

**Azione:** Rimuovere assegnazione - calcolare dinamicamente se necessario.

#### `resolvedAt` (Prediction)
**File:** `app/api/events/resolve/[eventId]/route.ts` (righe: 92, 115)

**Azione:** Usare `resolved: true` invece di `resolvedAt`.

#### `totalCredits` (Event)
**File:** `app/api/events/trending-now/route.ts` (riga: 73)

**Azione:** Calcolare dinamicamente da Prediction.amount.

### 2.3 Aggiungere Campi alle Query Select

#### `title` (Event)
**File da correggere:**
- `app/api/feed/route.ts` (riga: 100)
- `app/api/notifications/generate/route.ts` (riga: 84)
- `app/api/predictions/route.ts` (riga: 85)

**Azione:** Assicurarsi che `title` sia incluso nel `select` delle query Event.

### 2.4 Correggere Tipi TypeScript Personalizzati

#### `userId_eventId` (Prediction unique key)
**File:** `app/api/events/[id]/route.ts` (riga: 68)

**Azione:** Usare sintassi corretta:
```typescript
// Invece di:
where: { userId_eventId: { userId, eventId } }

// Usare:
where: { 
  eventId_userId: {
    eventId: params.id,
    userId: session.user.id
  }
}
```

#### `q_yes`, `q_no` (CachedPrice)
**File:**
- `app/api/events/[id]/price/route.ts` (riga: 49)
- `app/api/events/[id]/route.ts` (riga: 52)

**Azione:** Aggiungere `q_yes` e `q_no` agli oggetti passati O aggiornare tipo `CachedPrice` per renderli opzionali.

#### `totalPredictions`, `correctPredictions`
**File:**
- `app/api/events/resolve/[eventId]/route.ts` (righe: 142, 145, 146)
- `app/api/leaderboard/route.ts` (righe: 87, 88, 104, 105, 132)

**Azione:** Calcolare dinamicamente da aggregazioni Prisma invece di usare campi inesistenti.

#### `accuracy` (LeaderboardUser)
**File:** `app/api/leaderboard/route.ts` (righe: 142, 149)

**Azione:** Aggiungere campo `accuracy` al tipo TypeScript `LeaderboardUser` O calcolare dinamicamente.

### 2.5 Variabili Non Definite

#### `errors` (variabile)
**File:** `app/api/cron/auto-resolve/route.ts` (righe: 95, 120, 137)

**Azione:** Dichiarare variabile `errors` o correggere nome variabile.

#### `costBasis` (funzione)
**File:** `app/api/admin/events/[id]/resolve/resolve-lmsr.test.ts` (riga: 16)

**Azione:** Importare o definire funzione `costBasis`.

---

## FASE 3: Correggere Errori di Sintassi e Argomenti

### 3.1 Argomenti Funzione Errati

**File:** `app/api/admin/events/[id]/resolve/resolve-lmsr.test.ts` (righe: 26, 37, 49, 58)

**Azione:** Verificare signature funzione e correggere numero argomenti.

### 3.2 Conversioni di Tipo

**File:** `app/api/notifications/generate/route.ts` (riga: 96)

**Azione:** Correggere query Prisma - `data` è String, non oggetto con `path`. Usare JSON parsing se necessario.

---

## FASE 4: Calcoli Dinamici (Evitare Campi Ridondanti)

### 4.1 `totalSpent` (User)
**NON aggiungere allo schema** - Calcolare dinamicamente:
```typescript
const totalSpent = await prisma.transaction.aggregate({
  where: { userId, amount: { lt: 0 } },
  _sum: { amount: true }
});
const totalSpentValue = Math.abs(totalSpent._sum.amount || 0);
```

**File già corretto:** `app/api/profile/stats/route.ts` (righe: 68-77) ✅

### 4.2 `totalPredictions`, `correctPredictions`
Calcolare dinamicamente:
```typescript
const totalPredictions = await prisma.prediction.count({
  where: { userId, resolved: true }
});
const correctPredictions = await prisma.prediction.count({
  where: { userId, resolved: true, won: true }
});
```

---

## FASE 5: Ordine di Esecuzione (Checklist)

### Step 1: Modificare Schema Prisma
- [ ] Aggiungere modello `EventFollower`
- [ ] Aggiungere modello `DailySpin`
- [ ] Aggiungere modello `ShopItem`
- [ ] Aggiungere modello `UserBadge` (opzionale)
- [ ] Aggiungere campi a `User`: `username`, `lastDailyBonus`, `onboardingCompleted`
- [ ] Aggiungere relazioni necessarie (`followedEvents`, `dailySpins`, `badges`, `followers`)

### Step 2: Rigenerare Prisma Client
```bash
npx prisma generate
npx prisma validate
```

### Step 3: Eseguire Migration
```bash
npx prisma db push
# OPPURE per produzione:
npx prisma migrate dev --name add_missing_models
```

### Step 4: Correggere Codice (per categoria)

#### 4a. Sostituzioni Find & Replace
- [ ] `streak` → `streakCount` (5 file)
- [ ] `status` → `resolutionStatus` (1 file)
- [ ] `read` → `readAt` (1 file)
- [ ] `predictions` → `Prediction` (3 file)

#### 4b. Rimozioni Campi
- [ ] Rimuovere `yesPredictions` (1 file)
- [ ] Sostituire `resolvedAt` con `resolved` (1 file)
- [ ] Rimuovere `totalCredits` o calcolare dinamicamente (1 file)

#### 4c. Aggiungere Select Fields
- [ ] Aggiungere `title` alle query Event (3 file)

#### 4d. Correggere Tipi TypeScript
- [ ] Correggere `userId_eventId` → `eventId_userId` (1 file)
- [ ] Aggiungere `q_yes`, `q_no` a CachedPrice (2 file)
- [ ] Calcolare `totalPredictions`, `correctPredictions` dinamicamente (2 file)
- [ ] Aggiungere `accuracy` a LeaderboardUser o calcolare (1 file)

#### 4e. Variabili Non Definite
- [ ] Dichiarare `errors` (1 file)
- [ ] Importare/definire `costBasis` (1 file)

#### 4f. Errori Sintassi
- [ ] Correggere argomenti funzione (1 file)
- [ ] Correggere conversioni tipo (1 file)

### Step 5: Verifica Incrementale
Dopo ogni categoria:
```bash
npm run build
# Contare errori rimanenti
```

### Step 6: Verifica Finale
```bash
npx tsc --noEmit
npm run build
```

---

## FASE 6: Testing e Validazione

### 6.1 Test Funzionali
- [ ] Testare endpoint `/api/events/[id]/follow`
- [ ] Testare endpoint `/api/wallet/daily-bonus`
- [ ] Testare endpoint `/api/shop/purchase`
- [ ] Testare endpoint `/api/profile/stats`
- [ ] Testare endpoint `/api/leaderboard`

### 6.2 Test Build
- [ ] Build TypeScript senza errori
- [ ] Build Next.js senza errori
- [ ] Deploy su Vercel (test)

---

## Risultato Atteso

Al termine del piano:

✅ **Schema Prisma completo** - Tutti i modelli e campi necessari presenti
✅ **Codice allineato** - Nessuna discrepanza tra codice e schema
✅ **Build senza errori** - TypeScript e Next.js compilano correttamente
✅ **Piattaforma stabile** - Tutte le funzionalità funzionano correttamente
✅ **Codice pulito** - Nessun campo ridondante, calcoli dinamici dove appropriato
✅ **Deploy funzionante** - Vercel deploy senza problemi

---

## Note Importanti

1. **NON saltare passaggi** - Seguire l'ordine sistematico
2. **Verificare dopo ogni categoria** - Non accumulare errori
3. **Testare funzionalità** - Assicurarsi che tutto funzioni dopo le modifiche
4. **Backup database** - Prima di eseguire migration, fare backup
5. **Documentare decisioni** - Tracciare perché alcuni campi sono stati aggiunti/rimossi

---

## Tempo Stimato

- Fase 1 (Schema): ~30 minuti
- Fase 2 (Correzioni codice): ~2-3 ore
- Fase 3 (Sintassi): ~30 minuti
- Fase 4 (Testing): ~1 ora

**Totale: ~4-5 ore di lavoro sistematico**

---

## Prossimi Passi

1. Iniziare con Fase 1 (Schema Prisma)
2. Rigenerare Prisma client
3. Procedere con correzioni codice per categoria
4. Verificare incrementale
5. Test finale e deploy
