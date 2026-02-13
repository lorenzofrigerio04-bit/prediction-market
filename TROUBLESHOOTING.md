# Troubleshooting - Problemi di Registrazione

## Problema: "Si è verificato un errore. Riprova."

Se vedi questo errore durante la registrazione, segui questi passaggi:

### 1. Verifica che il database sia configurato

Assicurati di avere un file `.env` nella root del progetto con:

```env
DATABASE_URL="postgresql://user:password@localhost:5432/prediction_market?schema=public"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key-here"
```

### 2. Genera Prisma Client

```bash
npm run db:generate
```

### 3. Crea le tabelle nel database

```bash
npm run db:push
```

Oppure se preferisci usare le migrazioni:

```bash
npm run db:migrate
```

### 4. Verifica che il server di sviluppo sia in esecuzione

```bash
npm run dev
```

### 5. Controlla i log del server

Apri la console del terminale dove è in esecuzione `npm run dev` e controlla se ci sono errori specifici.

### Errori comuni:

- **"connect ECONNREFUSED"**: Il database non è in esecuzione o la connessione è errata
- **"P2002"**: L'email è già registrata
- **"Table does not exist"**: Le tabelle non sono state create nel database
