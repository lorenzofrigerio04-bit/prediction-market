# Note Migrazione - Sistema Notifiche In-App

## 📋 Schema Database

### Prisma Schema
Aggiungi il model `Notification` al tuo schema Prisma esistente:

```prisma
model Notification {
  id        String   @id @default(cuid())
  userId    String
  type      String   // EVENT_CLOSING_SOON | EVENT_RESOLVED | RANK_UP | STREAK_RISK
  data      Json     // Dati aggiuntivi (es: { eventId, eventTitle, oldRank, newRank, etc })
  readAt    DateTime?
  createdAt DateTime @default(now())

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId])
  @@index([userId, readAt])
  @@index([createdAt])
}
```

### Migrazione Database

```bash
# Genera e applica la migrazione
npx prisma migrate dev --name add_notifications

# Oppure se usi db push
npx prisma db push
```

**Importante**: Assicurati di aggiungere la relazione `notifications Notification[]` al model `User` esistente.

## 🔧 Integrazione Backend

### 1. Aggiorna le API Routes

Le API routes sono già create ma contengono TODO per l'integrazione con Prisma. Decommenta e completa:

- `app/api/notifications/route.ts` - Lista paginata
- `app/api/notifications/unread-count/route.ts` - Contatore non lette
- `app/api/notifications/mark-read/route.ts` - Marca come lette
- `app/api/notifications/generate/route.ts` - Generazione on-demand

### 2. Autenticazione

Sostituisci i mock `userId` con la sessione reale:

```typescript
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

const session = await getServerSession(authOptions);
if (!session?.user?.id) {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
}
const userId = session.user.id;
```

### 3. Query Database

Completa le query Prisma in `app/api/notifications/generate/route.ts`:

```typescript
const [events, userPredictions, currentRank, previousRank, user] = await Promise.all([
  prisma.event.findMany({
    where: {
      OR: [
        { status: 'OPEN', closesAt: { lte: new Date(Date.now() + 60 * 60 * 1000) } },
        { status: 'RESOLVED', resolvedAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } },
      ],
    },
    select: { id: true, title: true, closesAt: true, resolved: true, resolvedAt: true },
  }),
  prisma.prediction.findMany({
    where: { userId },
    select: { eventId: true, createdAt: true },
  }),
  // Fetch rank corrente dalla leaderboard
  // Fetch rank precedente (salva in cache o calcola)
  // Fetch user per streakCount
]);
```

## 🎨 Frontend

### Componenti Creati

1. **NotificationBell** (`components/notifications/NotificationBell.tsx`)
   - Icona campanella con badge contatore
   - Integrato in Navbar

2. **NotificationDropdown** (`components/notifications/NotificationDropdown.tsx`)
   - Preview ultime 5 notifiche
   - Apertura/chiusura dropdown

3. **Pagina Notifiche** (`app/notifiche/page.tsx`)
   - Lista paginata completa
   - Mark as read individuale/totale

### Hooks

- `hooks/useNotifications.ts` - Fetch lista paginata
- `hooks/useUnreadCount.ts` - Contatore non lette (polling ogni 30s)
- `hooks/useMarkAsRead.ts` - Marca come lette

## 🔄 Generazione On-Demand

Le notifiche vengono generate quando l'utente apre:
- **Home** (`app/page.tsx`) - useEffect aggiunto
- **Eventi** (`app/eventi/page.tsx`) - TODO: aggiungere useEffect

Aggiungi questo useEffect nella pagina Eventi:

```typescript
import { generateNotificationsOnDemand } from "@/lib/notifications/client";

// Nel componente EventiPage
useEffect(() => {
  if (isAuthenticated) {
    generateNotificationsOnDemand();
  }
}, [isAuthenticated]);
```

## 📝 Tipi di Notifiche

### EVENT_CLOSING_SOON
- **Quando**: Evento chiude entro 1h e utente non ha votato
- **Data**: `{ eventId, eventTitle, closesAt }`

### EVENT_RESOLVED
- **Quando**: Evento risolto nelle ultime 24h e utente ha votato
- **Data**: `{ eventId, eventTitle, outcome: 'yes' | 'no' }`

### RANK_UP
- **Quando**: Utente sale in classifica (confronto rank precedente vs corrente)
- **Data**: `{ oldRank, newRank, period: 'weekly' | 'monthly' | 'all-time' }`

### STREAK_RISK
- **Quando**: Dopo le 18:00, utente non ha predetto oggi e ha streak attiva
- **Data**: `{ currentStreak, hoursUntilMidnight }`

## ✅ Checklist Integrazione

- [ ] Eseguire migrazione Prisma
- [ ] Aggiungere relazione `notifications` al model User
- [ ] Decommentare e completare query Prisma nelle API routes
- [ ] Integrare autenticazione reale (sostituire mock userId)
- [ ] Aggiungere useEffect generazione notifiche in pagina Eventi
- [ ] Testare generazione notifiche
- [ ] Testare dropdown e pagina notifiche
- [ ] Verificare mark as read funziona correttamente

## 🚀 Testing

1. **Test Generazione Notifiche**:
   - Apri Home come utente autenticato
   - Verifica che notifiche vengano create nel DB

2. **Test Badge Contatore**:
   - Crea notifiche non lette
   - Verifica badge mostra numero corretto

3. **Test Dropdown**:
   - Click su campanella
   - Verifica ultime 5 notifiche mostrate
   - Click su notifica → marca come letta

4. **Test Pagina Notifiche**:
   - Naviga a `/notifiche`
   - Verifica lista paginata
   - Test "Segna tutte come lette"

## 📌 Note Importanti

- **Best-effort**: La generazione notifiche non blocca se fallisce
- **Evita duplicati**: Il generatore controlla se notifica simile esiste già (ultime 24h)
- **Performance**: Polling contatore ogni 30s, puoi ottimizzare con WebSocket se necessario
- **Mobile**: Dropdown responsive, si adatta a schermi piccoli
