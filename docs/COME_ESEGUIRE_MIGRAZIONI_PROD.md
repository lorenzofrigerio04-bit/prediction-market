# Come eseguire le migrazioni sul database di produzione

## Opzione 1: Usare l'URL da Vercel (consigliato)

1. **Vai su Vercel** → il tuo progetto → **Settings** → **Environment Variables**
2. Trova la variabile **`DATABASE_URL`**
3. Clicca sull'icona **👁️ (occhio)** per vedere il valore (è nascosto per sicurezza)
4. **Copia l'URL completo** (inizia con `postgresql://` o `postgres://`)

5. **Nel terminale**, esegui:
   ```bash
   DATABASE_URL="<incolla_qui_l_url_copiato>" npx prisma migrate deploy
   ```
   
   Esempio:
   ```bash
   DATABASE_URL="postgresql://user:password@host:5432/dbname?sslmode=require" npx prisma migrate deploy
   ```

---

## Opzione 2: Usare `prisma db push` (più semplice)

Se non hai migrazioni Prisma ma solo `schema.prisma`:

```bash
DATABASE_URL="<url_da_vercel>" npx prisma db push
```

**Nota**: `db push` sincronizza lo schema direttamente senza creare file di migrazione. Va bene per sviluppo, ma in produzione è meglio usare `migrate deploy` se hai già migrazioni.

---

## Verifica che le tabelle esistano

Dopo aver eseguito la migrazione, verifica:

```bash
DATABASE_URL="<url_da_vercel>" npx prisma studio
```

Oppure controlla che esistano:
- `market_metrics` (tabella `MarketMetrics`)
- `user_profiles` (tabella `UserProfile`)

---

## Sicurezza: non committare l'URL

⚠️ **NON** incollare mai l'URL del database in file committati o in chat pubbliche. L'URL contiene credenziali sensibili.

---

## Troubleshooting

**Errore "connection refused" o "timeout"**:
- Verifica che l'URL sia corretto (copia/incolla esatto da Vercel)
- Controlla che il database accetti connessioni esterne

**Errore "relation already exists"**:
- Le tabelle esistono già → la migrazione è già stata applicata.

**Errore "migration not found"**:
- Se usi `migrate deploy` ma non hai file di migrazione in `prisma/migrations/`, usa invece `prisma db push`.
