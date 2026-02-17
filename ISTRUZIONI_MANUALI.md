# 📝 Istruzioni Manuali - Configurazione File Segreti

Dato che non puoi aprire direttamente `lib/auth.ts` e il model `User`, ecco come configurarli:

## 🔧 PASSO 1: Configurare `lib/auth.ts`

### Opzione A: Se hai già next-auth configurato

Trova dove hai configurato next-auth (probabilmente in `app/api/auth/[...nextauth]/route.ts` o simile) e modifica `lib/auth.ts` così:

```typescript
// lib/auth.ts
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
export { authOptions };

// ... resto del file rimane uguale
```

### Opzione B: Se devi configurare next-auth

Modifica `lib/auth.ts` con questa struttura base:

```typescript
// lib/auth.ts
import { getServerSession } from 'next-auth';
import type { NextAuthOptions } from 'next-auth';
import { PrismaAdapter } from '@next-auth/prisma-adapter';
import { prisma } from '@/lib/prisma';

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    // Aggiungi i tuoi provider qui (Google, Credentials, etc.)
    // Esempio:
    // GoogleProvider({
    //   clientId: process.env.GOOGLE_CLIENT_ID!,
    //   clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    // }),
  ],
  callbacks: {
    session: ({ session, token }) => {
      if (session.user && token.sub) {
        (session.user as any).id = token.sub; // IMPORTANTE: userId nella session
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
  // ... altre configurazioni
};

// ... resto del file (getCurrentUser, getUserId) rimane uguale
```

**IMPORTANTE**: Assicurati che nel callback `session` venga aggiunto `userId` alla session, altrimenti `getUserId()` non funzionerà.

---

## 🔧 PASSO 2: Aggiungere relazione al model User

Nel tuo schema Prisma (probabilmente in `prisma/schema.prisma` o in un altro file schema), trova il model `User` e aggiungi questa riga:

```prisma
model User {
  // ... tutti i tuoi campi esistenti (id, email, name, etc.)
  
  // AGGIUNGI QUESTA RIGA:
  notifications Notification[]
  
  // ... altri campi/relazioni esistenti
}
```

### Come trovare il model User:

1. **Cerca nel terminale**:
   ```bash
   grep -r "model User" prisma/
   ```

2. **Oppure cerca file schema**:
   ```bash
   find . -name "*.prisma" -type f ! -path "*/node_modules/*"
   ```

3. **Se hai più file schema**, aggiungi la relazione in quello principale che contiene il model User.

---

## ✅ PASSO 3: Eseguire Migrazione

Dopo aver aggiunto la relazione al model User:

```bash
npx prisma migrate dev --name add_notifications
```

Oppure:
```bash
npx prisma db push
```

---

## 🎯 Verifica Rapida

Dopo aver fatto i 3 passi:

1. **Testa autenticazione**: Le API routes devono riconoscere l'utente
2. **Testa notifiche**: Apri `/eventi` → dovresti vedere chiamata a `/api/notifications/generate`
3. **Testa badge**: Click sulla campanella → dropdown funziona

---

## 🆘 Se non trovi il model User

Se non riesci a trovare il model User nello schema Prisma, potrebbe essere che:

1. **Usi un altro nome** (es. `Account`, `Member`, etc.) → Cerca nel terminale:
   ```bash
   grep -r "model.*{" prisma/ | grep -i user
   ```

2. **Lo schema è in un altro formato** → Verifica se hai file `.sql` o altri formati

3. **Devi crearlo** → Aggiungi il model User nello schema Prisma con la relazione

---

## 📋 Checklist Finale

- [ ] `lib/auth.ts` configurato con authOptions reale
- [ ] Model User ha relazione `notifications Notification[]`
- [ ] Migrazione eseguita con successo
- [ ] Test autenticazione funziona
- [ ] Test notifiche funziona

---

## 💡 Suggerimento

Se hai problemi a trovare i file, puoi usare questi comandi nel terminale:

```bash
# Trova tutti i file auth
find . -name "*auth*" -type f ! -path "*/node_modules/*"

# Trova tutti gli schema Prisma
find . -name "*.prisma" -type f ! -path "*/node_modules/*"

# Cerca model User
grep -r "model User" . --include="*.prisma" --exclude-dir=node_modules
```
