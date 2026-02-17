# Implementazione Sistema Notifiche In-App

## ✅ Componenti Implementati

### Backend

1. **Schema Prisma** (`prisma/schema.prisma`)
   - Model `Notification` con campi: id, userId, type, data (JSON), readAt, createdAt
   - Indici ottimizzati per query frequenti

2. **API Routes** (`app/api/notifications/`)
   - `GET /api/notifications` - Lista paginata notifiche
   - `GET /api/notifications/unread-count` - Contatore non lette
   - `POST /api/notifications/mark-read` - Marca come lette
   - `POST /api/notifications/generate` - Generazione on-demand

3. **Logica Generazione** (`lib/notifications/generator.ts`)
   - `generateClosingSoonNotifications()` - Eventi che chiudono entro 1h
   - `generateResolvedNotifications()` - Eventi risolti
   - `generateRankUpNotifications()` - Salita in classifica
   - `generateStreakRiskNotifications()` - Rischio perdita streak

### Frontend

1. **Componenti**
   - `NotificationBell` - Icona campanella con badge
   - `NotificationDropdown` - Preview ultime 5 notifiche
   - Pagina `/notifiche` - Lista completa paginata

2. **Hooks** (`hooks/useNotifications.ts`)
   - `useNotifications()` - Fetch lista paginata
   - `useUnreadCount()` - Contatore con polling ogni 30s
   - `useMarkAsRead()` - Marca come lette

3. **Integrazione Navbar**
   - Campanella aggiunta in `components/layout/Navbar.tsx`
   - Badge mostra contatore non lette

## 🔧 TODO per Completare Integrazione

### 1. Database Migration

```bash
# Aggiungi il model Notification al tuo schema Prisma esistente
# Vedi prisma/schema.prisma per il modello completo

# Esegui migrazione
npx prisma migrate dev --name add_notifications
# Oppure
npx prisma db push
```

**Importante**: Aggiungi la relazione al model User:
```prisma
model User {
  // ... altri campi
  notifications Notification[]
}
```

### 2. Completare API Routes

Decommenta e completa le query Prisma in:

- `app/api/notifications/route.ts` (linea ~25)
- `app/api/notifications/unread-count/route.ts` (linea ~20)
- `app/api/notifications/mark-read/route.ts` (linea ~20)
- `app/api/notifications/generate/route.ts` (linea ~30)

Sostituisci i mock `userId` con autenticazione reale:

```typescript
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

const session = await getServerSession(authOptions);
if (!session?.user?.id) {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
}
const userId = session.user.id;
```

### 3. Aggiungere Generazione Notifiche in Pagina Eventi

Aggiungi questo codice in `app/eventi/page.tsx`:

```typescript
import { generateNotificationsOnDemand } from "@/lib/notifications/client";

// Nel componente EventiPage, aggiungi questo useEffect:
useEffect(() => {
  if (isAuthenticated) {
    generateNotificationsOnDemand();
  }
}, [isAuthenticated]);
```

### 4. Completare Query Database in generate/route.ts

Nel file `app/api/notifications/generate/route.ts`, completa le query per ottenere:

- Eventi aperti che chiudono entro 1h
- Eventi risolti nelle ultime 24h
- Previsioni utente
- Rank corrente e precedente (per RANK_UP)
- Streak count e hasPredictedToday (per STREAK_RISK)

Esempio struttura:

```typescript
const [events, userPredictions, currentRank, previousRank, user] = await Promise.all([
  prisma.event.findMany({
    where: {
      OR: [
        { status: 'OPEN', closesAt: { lte: new Date(Date.now() + 60 * 60 * 1000) } },
        { status: 'RESOLVED', resolvedAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } },
      ],
    },
  }),
  prisma.prediction.findMany({ where: { userId } }),
  // ... altri fetch
]);
```

## 📋 Tipi di Notifiche

### EVENT_CLOSING_SOON
- **Trigger**: Evento chiude entro 1h E utente non ha votato
- **Data**: `{ eventId, eventTitle, closesAt }`

### EVENT_RESOLVED
- **Trigger**: Evento risolto nelle ultime 24h E utente ha votato
- **Data**: `{ eventId, eventTitle, outcome: 'yes' | 'no' }`

### RANK_UP
- **Trigger**: `currentRank < previousRank` (sale in classifica)
- **Data**: `{ oldRank, newRank, period: 'weekly' }`

### STREAK_RISK
- **Trigger**: Dopo le 18:00 E `hasPredictedToday === false` E `streakCount > 0`
- **Data**: `{ currentStreak, hoursUntilMidnight }`

## 🎨 UI/UX

### Navbar
- Icona campanella sempre visibile
- Badge rosso con numero non lette (max 99+)
- Click apre dropdown con ultime 5

### Dropdown
- Preview ultime 5 notifiche
- Link "Vedi tutte" → `/notifiche`
- Click su notifica → marca come letta + naviga
- Dot blu per notifiche non lette

### Pagina Notifiche
- Lista completa paginata (20 per pagina)
- Pulsante "Segna tutte come lette"
- Paginazione con Previous/Next
- Link a eventi quando applicabile

## 🔄 Flusso Generazione

1. Utente apre **Home** o **Eventi**
2. Frontend chiama `POST /api/notifications/generate`
3. Backend genera notifiche on-demand (best-effort)
4. Notifiche create nel DB (evita duplicati ultime 24h)
5. Badge aggiornato automaticamente (polling ogni 30s)

## 🚀 Testing

### Test Manuali

1. **Badge Contatore**
   - Crea notifiche non lette nel DB
   - Verifica badge mostra numero corretto
   - Marca come letta → badge diminuisce

2. **Dropdown**
   - Click campanella → dropdown si apre
   - Click fuori → dropdown si chiude
   - Click notifica → marca come letta + naviga

3. **Pagina Notifiche**
   - Naviga a `/notifiche`
   - Verifica lista paginata
   - Test "Segna tutte come lette"
   - Test paginazione

4. **Generazione On-Demand**
   - Apri Home come utente autenticato
   - Verifica chiamata a `/api/notifications/generate`
   - Controlla DB per nuove notifiche create

## 📝 Note Tecniche

- **Best-effort**: Generazione non blocca se fallisce
- **Performance**: Polling contatore ogni 30s (ottimizzabile con WebSocket)
- **Duplicati**: Controllo notifiche simili ultime 24h
- **Mobile**: Dropdown responsive, si adatta a schermi piccoli
- **Accessibilità**: ARIA labels e ruoli semantici

## 🔗 File Creati/Modificati

### Nuovi File
- `prisma/schema.prisma` (da aggiungere al tuo schema esistente)
- `lib/notifications/types.ts`
- `lib/notifications/generator.ts`
- `lib/notifications/client.ts`
- `app/api/notifications/route.ts`
- `app/api/notifications/unread-count/route.ts`
- `app/api/notifications/mark-read/route.ts`
- `app/api/notifications/generate/route.ts`
- `hooks/useNotifications.ts`
- `components/notifications/NotificationBell.tsx`
- `components/notifications/NotificationDropdown.tsx`
- `app/notifiche/page.tsx`

### File Modificati
- `components/layout/Navbar.tsx` - Aggiunta campanella
- `app/page.tsx` - Aggiunto useEffect generazione notifiche

### File da Modificare
- `app/eventi/page.tsx` - Aggiungere useEffect generazione notifiche (vedi TODO sopra)

## ✅ Checklist Finale

- [x] Schema Prisma creato
- [x] API routes create (con TODO per integrazione)
- [x] Logica generazione implementata
- [x] Componenti frontend creati
- [x] Navbar aggiornata con campanella
- [x] Pagina notifiche creata
- [x] Integrazione Home completata
- [ ] **TODO**: Eseguire migrazione Prisma
- [ ] **TODO**: Completare query Prisma nelle API routes
- [ ] **TODO**: Aggiungere generazione notifiche in pagina Eventi
- [ ] **TODO**: Testare end-to-end
