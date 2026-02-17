# Patch per aggiungere generazione notifiche in pagina Eventi

## 📝 Istruzioni

Aggiungi questo codice al file `app/eventi/page.tsx`:

### 1. Aggiungi import in cima al file

```typescript
import { generateNotificationsOnDemand } from "@/lib/notifications/client";
```

### 2. Aggiungi useEffect dopo gli altri useEffect esistenti

Cerca la sezione dove ci sono già altri `useEffect` (dopo il fetchEvents) e aggiungi:

```typescript
// Genera notifiche on-demand quando utente apre Eventi (best-effort)
useEffect(() => {
  if (isAuthenticated) {
    generateNotificationsOnDemand();
  }
}, [isAuthenticated]);
```

### 📍 Posizione suggerita

Dopo il `useEffect` che gestisce `fetchEvents` (circa linea 110), aggiungi il nuovo `useEffect`.

### ✅ Esempio completo della sezione

```typescript
useEffect(() => {
  async function fetchEvents() {
    // ... codice esistente fetchEvents
  }
  fetchEvents();
}, [showTrendingOnly]);

// Genera notifiche on-demand quando utente apre Eventi (best-effort)
useEffect(() => {
  if (isAuthenticated) {
    generateNotificationsOnDemand();
  }
}, [isAuthenticated]);
```

## 🎯 Verifica

Dopo aver aggiunto il codice:
1. Apri la pagina `/eventi` come utente autenticato
2. Controlla la console del browser Network tab
3. Dovresti vedere una chiamata POST a `/api/notifications/generate`
