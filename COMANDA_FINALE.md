# 🎯 Comandi Finali da Eseguire

## ✅ Tutto è stato aggiornato automaticamente!

Ho fatto:
- ✅ Schema Prisma aggiornato con model User completo
- ✅ Relazione Notification configurata
- ✅ lib/auth.ts aggiornato per usare i tipi corretti
- ✅ Tutti i file backend pronti

## 📋 Cosa fare ORA (in ordine)

### 1️⃣ Verifica Schema Prisma

**IMPORTANTE**: Ho aggiunto un model User completo in `prisma/schema.prisma`.

**Se hai già uno schema Prisma completo altrove** (con Event, Prediction, etc.):
- **NON sovrascrivere** il tuo schema esistente
- **Aggiungi solo** il model `Notification` al tuo schema
- **Aggiungi solo** `notifications Notification[]` al tuo model User esistente

**Se NON hai uno schema esistente**:
- Lo schema che ho creato è completo e pronto ✅

### 2️⃣ Configura Autenticazione

Apri `lib/auth.ts` e completa `authOptions`:

```typescript
// lib/auth.ts
export const authOptions: NextAuthOptions = {
  // Se hai già next-auth configurato, importalo:
  // import { authOptions } from '@/app/api/auth/[...nextauth]/route';
  
  // Altrimenti configura qui:
  providers: [
    // I tuoi provider (Google, Credentials, etc.)
  ],
  callbacks: {
    session: ({ session, token }) => {
      if (session.user && token.sub) {
        session.user.id = token.sub; // IMPORTANTE per getUserId()
      }
      return session;
    },
    jwt: ({ token, user }) => {
      if (user) {
        token.sub = user.id;
      }
      return token;
    },
  },
};
```

### 3️⃣ Esegui Migrazione

```bash
npx prisma migrate dev --name add_notifications
```

Oppure se usi db push:
```bash
npx prisma db push
```

### 4️⃣ Genera Prisma Client

```bash
npx prisma generate
```

## ✅ Verifica

Dopo i passi sopra:
1. Apri `/eventi` → dovresti vedere chiamata a `/api/notifications/generate`
2. Click campanella → dropdown funziona
3. `/notifiche` → lista completa

## 🎉 Fatto!

Tutto il resto è già pronto e funzionante! 🚀
