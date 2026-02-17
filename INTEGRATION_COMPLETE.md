# ✅ Integrazione Notifiche - Completata

## 🎉 Cosa è stato fatto

### 1. ✅ Backend Completo

- **Prisma Client** (`lib/prisma.ts`) - Singleton per connessioni DB
- **Auth Helper** (`lib/auth.ts`) - Helper per autenticazione nelle API routes
- **API Routes Aggiornate**:
  - `GET /api/notifications` - Usa Prisma reale ✅
  - `GET /api/notifications/unread-count` - Usa Prisma reale ✅
  - `POST /api/notifications/mark-read` - Usa Prisma reale ✅
  - `POST /api/notifications/generate` - Usa Prisma reale ✅

### 2. ✅ Schema Prisma

- Model `Notification` creato in `prisma/schema.prisma`
- Script migrazione creato: `scripts/migrate-notifications.sh`

### 3. ⚠️ TODO Finale

#### A. Configurare Autenticazione

Il file `lib/auth.ts` contiene un placeholder per `authOptions`. 

**Se hai già un file di configurazione next-auth**, aggiorna `lib/auth.ts`:

```typescript
// lib/auth.ts
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
// oppure da dove esporti la tua configurazione
export { authOptions };
```

**Se non hai ancora configurato next-auth**, completa la configurazione in `lib/auth.ts` seguendo la documentazione next-auth.

#### B. Eseguire Migrazione Database

```bash
# Opzione 1: Usa lo script
bash scripts/migrate-notifications.sh

# Opzione 2: Manuale
npx prisma migrate dev --name add_notifications

# Opzione 3: Se usi db push
npx prisma db push
```

**Importante**: Prima di eseguire la migrazione, assicurati di aver aggiunto il model `Notification` al tuo schema Prisma esistente e la relazione al model `User`:

```prisma
model User {
  // ... altri campi
  notifications Notification[]
}
```

#### C. Aggiungere Generazione Notifiche in Pagina Eventi

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

## 📋 Checklist Finale

- [x] Schema Prisma creato
- [x] Prisma client configurato
- [x] API routes aggiornate con Prisma
- [x] Auth helper creato
- [x] Script migrazione creato
- [ ] **TODO**: Configurare authOptions in `lib/auth.ts`
- [ ] **TODO**: Eseguire migrazione database
- [ ] **TODO**: Aggiungere generazione notifiche in pagina Eventi
- [ ] **TODO**: Testare end-to-end

## 🔧 File Modificati/Creati

### Nuovi File
- `lib/prisma.ts` - Prisma client singleton
- `lib/auth.ts` - Helper autenticazione (da configurare)
- `scripts/migrate-notifications.sh` - Script migrazione

### File Aggiornati
- `app/api/notifications/route.ts` - Usa Prisma reale
- `app/api/notifications/unread-count/route.ts` - Usa Prisma reale
- `app/api/notifications/mark-read/route.ts` - Usa Prisma reale
- `app/api/notifications/generate/route.ts` - Usa Prisma reale con query complete

## 🚀 Come Testare

1. **Esegui migrazione**:
   ```bash
   bash scripts/migrate-notifications.sh
   ```

2. **Configura autenticazione** in `lib/auth.ts`

3. **Testa API**:
   ```bash
   # Lista notifiche (richiede autenticazione)
   curl http://localhost:3000/api/notifications

   # Contatore non lette
   curl http://localhost:3000/api/notifications/unread-count

   # Genera notifiche
   curl -X POST http://localhost:3000/api/notifications/generate
   ```

4. **Testa Frontend**:
   - Apri Home → verifica chiamata a `/api/notifications/generate`
   - Click su campanella → verifica dropdown
   - Naviga a `/notifiche` → verifica lista

## 📝 Note Importanti

- **Autenticazione**: Il sistema usa `getUserId()` da `lib/auth.ts`. Assicurati che la configurazione next-auth sia corretta.
- **Best-effort**: La generazione notifiche non blocca se fallisce (gestione errori silenziosa).
- **Duplicati**: Il sistema evita notifiche duplicate controllando se esiste già una notifica simile nelle ultime 24h.
- **Performance**: Polling contatore ogni 30s (ottimizzabile con WebSocket se necessario).

## 🆘 Troubleshooting

### Errore: "Cannot find module '@/lib/prisma'"
- Verifica che `lib/prisma.ts` esista
- Verifica che `tsconfig.json` abbia il path alias `@/*`

### Errore: "PrismaClient is not defined"
- Installa Prisma: `npm install @prisma/client`
- Genera client: `npx prisma generate`

### Errore: "Unauthorized" nelle API
- Verifica configurazione `authOptions` in `lib/auth.ts`
- Verifica che la sessione next-auth funzioni correttamente

### Migrazione fallisce
- Verifica che il model `Notification` sia nello schema Prisma
- Verifica che la relazione con `User` sia presente
- Controlla errori nel terminale per dettagli
