# Mappatura Completa Modelli Prisma

## Obiettivo
Mappatura completa dei modelli Prisma utilizzati nel codice vs modelli definiti nello schema Prisma, con identificazione dei modelli mancanti.

---

## Modelli Definiti nello Schema Prisma

Dal file `prisma/schema.prisma`, i seguenti modelli sono **definiti**:

1. ✅ **User** - Utenti del sistema
2. ✅ **Notification** - Notifiche per gli utenti
3. ✅ **AuditLog** - Log delle azioni amministrative
4. ✅ **Event** - Eventi di previsione
5. ✅ **Comment** - Commenti sugli eventi
6. ✅ **Reaction** - Reazioni ai commenti (thumbs_up, fire, heart)
7. ✅ **Prediction** - Previsioni degli utenti
8. ✅ **Transaction** - Transazioni di crediti

**Totale modelli nello schema: 8**

---

## Modelli Utilizzati nel Codice

Analisi completa di tutti i file TypeScript/TSX che utilizzano Prisma client:

### Modelli Esistenti nello Schema (✅)

| Modello | File che lo utilizzano | Note |
|---------|----------------------|------|
| **user** | 50+ file | Utilizzato ampiamente in API routes, lib, scripts |
| **event** | 30+ file | Utilizzato per gestione eventi |
| **comment** | 15+ file | Utilizzato per commenti |
| **reaction** | 5+ file | Utilizzato in `app/api/comments/[id]/reactions/route.ts` |
| **prediction** | 20+ file | Utilizzato per previsioni |
| **transaction** | 10+ file | Utilizzato per transazioni crediti |
| **notification** | 8+ file | Utilizzato per notifiche |
| **auditLog** | 5+ file | Utilizzato per audit trail |

### Modelli Mancanti nello Schema (❌)

| Modello | File che lo utilizzano | Stato | Azione Richiesta |
|---------|----------------------|------|-----------------|
| **badge** | `lib/badges.ts`, `prisma/seed.ts` | ❌ MANCANTE | Aggiungere modello o rimuovere codice |
| **userBadge** | `lib/badges.ts`, `app/api/profile/stats/route.ts` | ❌ MANCANTE | Aggiungere modello o rimuovere codice |
| **verificationToken** | `app/auth/verify-email/page.tsx` (3 occorrenze) | ❌ MANCANTE | Aggiungere modello (necessario per NextAuth) |
| **eventFollower** | `app/api/events/[id]/follow/route.ts`, `app/api/events/[id]/route.ts`, `app/api/profile/stats/route.ts`, `lib/simulated-activity/followers.ts`, `scripts/remove-bot-activity.ts`, `scripts/hard-reset-and-seed.ts` | ❌ MANCANTE | Aggiungere modello (funzionalità "Segui evento") |
| **commentReaction** | `lib/simulated-activity/reactions.ts`, `scripts/remove-bot-activity.ts` | ❌ MANCANTE | **SOSTITUIRE** con `reaction` (esiste già) |

### Modelli Aggiuntivi Trovati nel Codice (Non menzionati nel piano)

| Modello | File che lo utilizzano | Stato | Note |
|---------|----------------------|------|------|
| **dailySpin** | Trovato nel codice | ❓ | Verificare se necessario |
| **marketAnalyticsRaw** | Trovato nel codice | ❓ | Verificare se necessario |
| **marketMetrics** | Trovato nel codice | ❓ | Verificare se necessario |
| **mission** | Trovato nel codice | ❓ | Verificare se necessario |
| **shopItem** | Trovato nel codice | ❓ | Verificare se necessario |
| **userMission** | Trovato nel codice | ❓ | Verificare se necessario |
| **userProfile** | Trovato nel codice | ❓ | Verificare se necessario |

---

## Dettaglio Modelli Mancanti

### 1. ❌ `badge` (Mancante)

**File che lo utilizzano:**
- `lib/badges.ts` - Funzioni per gestione badge
- `prisma/seed.ts` - Seed dei badge di default

**Uso nel codice:**
```typescript
// lib/badges.ts
const allBadges = await prisma.badge.findMany();

// prisma/seed.ts
const existingBadges = await prisma.badge.count();
await prisma.badge.create({ ... });
```

**Raccomandazione:** 
- **A)** Aggiungere modello `Badge` allo schema Prisma (raccomandato se la funzionalità badge è necessaria)
- **B)** Rimuovere completamente il codice relativo ai badge

---

### 2. ❌ `userBadge` (Mancante)

**File che lo utilizzano:**
- `lib/badges.ts` - Assegnazione badge agli utenti
- `app/api/profile/stats/route.ts` - Statistiche profilo utente

**Uso nel codice:**
```typescript
// lib/badges.ts
await prisma.userBadge.findMany({ where: { userId } });
await prisma.userBadge.create({ data: { userId, badgeId, ... } });

// app/api/profile/stats/route.ts
const badges = await prisma.userBadge.findMany({
  where: { userId },
  include: { badge: { ... } }
});
```

**Raccomandazione:**
- **A)** Aggiungere modello `UserBadge` allo schema Prisma (necessario se `badge` viene aggiunto)
- **B)** Rimuovere codice se i badge non sono necessari

---

### 3. ❌ `verificationToken` (Mancante)

**File che lo utilizzano:**
- `app/auth/verify-email/page.tsx` - Verifica email utente (3 occorrenze)

**Uso nel codice:**
```typescript
// app/auth/verify-email/page.tsx
const verification = await prisma.verificationToken.findUnique({
  where: { token: token.trim() }
});
await prisma.verificationToken.deleteMany({ where: { token: token.trim() } });
```

**Raccomandazione:**
- **A)** **Aggiungere modello `VerificationToken` allo schema Prisma** (necessario per NextAuth email verification)
- Schema suggerito:
  ```prisma
  model VerificationToken {
    identifier String
    token      String   @unique
    expires    DateTime
    @@unique([identifier, token])
  }
  ```

---

### 4. ❌ `eventFollower` (Mancante)

**File che lo utilizzano:**
- `app/api/events/[id]/follow/route.ts` - API follow/unfollow evento
- `app/api/events/[id]/route.ts` - Dettagli evento
- `app/api/profile/stats/route.ts` - Statistiche profilo
- `lib/simulated-activity/followers.ts` - Simulazione attività
- `scripts/remove-bot-activity.ts` - Script pulizia
- `scripts/hard-reset-and-seed.ts` - Script reset

**Uso nel codice:**
```typescript
// app/api/events/[id]/follow/route.ts
const follow = await prisma.eventFollower.findUnique({
  where: { userId_eventId: { userId, eventId } }
});
await prisma.eventFollower.create({ data: { userId, eventId } });
await prisma.eventFollower.delete({ where: { userId_eventId: { ... } } });

// app/api/profile/stats/route.ts
prisma.eventFollower.count({ where: { userId } });
prisma.eventFollower.findMany({ where: { userId }, include: { event: { ... } } });
```

**Raccomandazione:**
- **A)** **Aggiungere modello `EventFollower` allo schema Prisma** (funzionalità "Segui evento" già implementata)
- Schema suggerito:
  ```prisma
  model EventFollower {
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
- Aggiungere relazione `followers EventFollower[]` al modello `Event`
- Aggiungere relazione `eventFollows EventFollower[]` al modello `User`

---

### 5. ❌ `commentReaction` (Mancante - DA SOSTITUIRE)

**File che lo utilizzano:**
- `lib/simulated-activity/reactions.ts` - Simulazione reazioni
- `scripts/remove-bot-activity.ts` - Script pulizia

**Uso nel codice:**
```typescript
// lib/simulated-activity/reactions.ts
const existingReaction = await prisma.commentReaction.findFirst({
  where: { userId, commentId, type }
});
const reaction = await prisma.commentReaction.create({
  data: { userId, commentId, type }
});

// scripts/remove-bot-activity.ts
const deletedReactions = await prisma.commentReaction.deleteMany({ ... });
```

**Raccomandazione:**
- **C)** **SOSTITUIRE** `prisma.commentReaction` con `prisma.reaction` (il modello `Reaction` esiste già nello schema)
- Il modello `Reaction` nello schema ha già i campi necessari: `id`, `commentId`, `userId`, `type`, `createdAt`
- **Azione:** Refactoring dei file per usare `reaction` invece di `commentReaction`

---

## Riepilogo Azioni Richieste

### Priorità Alta (Bloccanti per Build)

1. ✅ **`reaction`** - Esiste nello schema, ma codice usa anche `commentReaction`
   - **Azione:** Sostituire `commentReaction` con `reaction` in:
     - `lib/simulated-activity/reactions.ts`
     - `scripts/remove-bot-activity.ts`

2. ❌ **`verificationToken`** - Necessario per NextAuth
   - **Azione:** Aggiungere modello allo schema Prisma
   - **File:** `app/auth/verify-email/page.tsx`

3. ❌ **`eventFollower`** - Funzionalità già implementata
   - **Azione:** Aggiungere modello allo schema Prisma
   - **File multipli:** API routes, lib, scripts

### Priorità Media

4. ❌ **`badge`** e **`userBadge`** - Funzionalità badge implementata
   - **Azione:** Decidere se aggiungere modelli o rimuovere codice
   - **File:** `lib/badges.ts`, `app/api/profile/stats/route.ts`, `prisma/seed.ts`

### Priorità Bassa (Verifica Necessità)

5. ❓ **Modelli aggiuntivi** (`dailySpin`, `marketAnalyticsRaw`, `marketMetrics`, `mission`, `shopItem`, `userMission`, `userProfile`)
   - **Azione:** Verificare se sono necessari o se il codice può essere rimosso

---

## File da Modificare per Correzione Errori

### Per `commentReaction` → `reaction`:
1. `lib/simulated-activity/reactions.ts`
2. `scripts/remove-bot-activity.ts`

### Per aggiunta modelli mancanti:
1. `prisma/schema.prisma` - Aggiungere modelli:
   - `VerificationToken`
   - `EventFollower`
   - `Badge` (opzionale)
   - `UserBadge` (opzionale)

### File che richiedono aggiornamento relazioni:
1. `prisma/schema.prisma` - Aggiungere relazioni:
   - `User.eventFollows EventFollower[]`
   - `Event.followers EventFollower[]`
   - `User.badges UserBadge[]` (se badge aggiunto)
   - `Badge.userBadges UserBadge[]` (se badge aggiunto)

---

## Note Finali

- **Totale modelli nello schema:** 8
- **Totale modelli utilizzati nel codice:** 21
- **Modelli mancanti critici:** 5 (`badge`, `userBadge`, `verificationToken`, `eventFollower`, `commentReaction`)
- **Modelli da sostituire:** 1 (`commentReaction` → `reaction`)

Questa mappatura fornisce una visione completa per risolvere gli errori di build TypeScript causati da modelli Prisma referenziati ma non definiti nello schema.
