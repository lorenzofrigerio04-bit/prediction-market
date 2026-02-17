# ⚡ Quick Fix - Soluzione Rapida

## 🎯 Problema
Non puoi aprire `lib/auth.ts` e il model `User` perché sono in percorsi segreti.

## ✅ Soluzione Rapida

### 1. Per `lib/auth.ts`:

**Apri il terminale** e esegui:

```bash
# Vedi il contenuto del file
cat lib/auth.ts

# Oppure modificalo direttamente
nano lib/auth.ts
# oppure
code lib/auth.ts
```

**Poi sostituisci** la sezione `authOptions` con la tua configurazione next-auth esistente.

### 2. Per il model User:

**Trova lo schema Prisma**:

```bash
# Cerca tutti gli schema Prisma
find . -name "*.prisma" -type f ! -path "*/node_modules/*"

# Cerca il model User
grep -r "model User" . --include="*.prisma" --exclude-dir=node_modules
```

**Apri il file trovato** e aggiungi `notifications Notification[]` al model User.

### 3. Esegui migrazione:

```bash
npx prisma migrate dev --name add_notifications
```

---

## 🔍 Se i comandi non funzionano

**Usa il tuo editor** per cercare:
- `authOptions` nel progetto
- `model User` nel progetto
- File `.prisma` nel progetto

Poi modifica manualmente i file trovati seguendo le istruzioni in `ISTRUZIONI_MANUALI.md`.
