# Migrazione Neon: America → Europa (Italia / bassa latenza)

Questa guida ti porta **passo passo** a spostare il database Neon dagli USA all’Europa, così la piattaforma resta identica ma con dati in EU e minore latenza dall’Italia.

---

## Cosa sapere prima

- **Neon non ha un datacenter in Italia.** Le regioni più vicine sono in Europa:
  - **AWS Europe (Frankfurt)** — consigliata per l’Italia (bassa latenza)
  - **AWS Europe (London)** — alternativa valida
- **Non si può “cambiare regione” al progetto attuale.** Serve creare un **nuovo progetto** in Europa e **copiare i dati** dal vecchio.
- **L’applicazione non va modificata.** Cambierai solo la variabile `DATABASE_URL` (in locale e su Vercel) per puntare al nuovo database EU.

---

## Riepilogo passi (in breve)

1. Creare un nuovo progetto Neon in Europa (es. Frankfurt).
2. Eseguire un **dump** del database attuale (America) e un **restore** nel nuovo (Europa).
3. Aggiornare `DATABASE_URL` nel file `.env` in locale e nelle variabili d’ambiente su Vercel.
4. Verificare che tutto funzioni e, se vuoi, eliminare il vecchio progetto.

---

## Passo 1 — Creare il nuovo progetto Neon in Europa

1. Vai su [console.neon.tech](https://console.neon.tech) e accedi.
2. Clicca **“New Project”** (o “Create project”).
3. Imposta:
   - **Name:** ad es. `prediction-market-eu` (o come preferisci).
   - **Region:** scegli **AWS Europe (Frankfurt)** — `aws-eu-central-1` (o London se preferisci).
   - **PostgreSQL version:** stessa del progetto attuale (es. 16), se possibile.
4. Clicca **Create project**.

Il nuovo progetto avrà un database di default (es. `neondb`). Se nel vecchio progetto usi un nome diverso, nel nuovo progetto puoi creare un database con lo **stesso nome** (Dashboard → Databases → Create database). Per molti progetti va bene usare il database di default.

---

## Passo 2 — Prendere le connection string

### Database attuale (America — sorgente)

1. Apri il **progetto attuale** (quello in America) nella Neon Console.
2. Vai su **Dashboard** → **Connection details** (o “Connect”).
3. Copia **due** URL:
   - **Connection string con pooler** (host tipo `...-pooler.xxx.us-east-2.aws.neon.tech`): la usi per l’app (Vercel, `.env`).
   - **Connection string senza pooler** (host tipo `ep-xxx.us-east-2.aws.neon.tech`, **senza** `-pooler`): la userai per `pg_dump`.
4. Se vedi solo l’URL con `-pooler`, nella stessa schermata cerca l’opzione **“Direct connection”** o “Unpooled” e copia quell’URL. Per il dump **deve** essere senza pooler.

### Nuovo database (Europa — destinazione)

1. Apri il **nuovo progetto** (Europa) nella Neon Console.
2. **Connection details** → copia:
   - URL **con pooler** (per l’applicazione).
   - URL **senza pooler** (per `pg_restore`).

Salva queste stringhe in un posto sicuro (non committarle su git). Esempio di formato:

- Sorgente (America): `postgresql://user:password@ep-xxx.us-east-2.aws.neon.tech/neondb?sslmode=require`
- Destinazione (Europa): `postgresql://user:password@ep-yyy.eu-central-1.aws.neon.tech/neondb?sslmode=require`

---

## Passo 3 — Eseguire dump e restore

Sul tuo computer servono `pg_dump` e `pg_restore` (installati con PostgreSQL client). Su macOS: `brew install libpq` e poi usare `pg_dump` / `pg_restore` dal PATH.

### Opzione A — Script automatico (consigliato)

Nel repo c’è uno script che fa dump e restore. Usa le **connection string senza pooler** per entrambi.

```bash
# Dump dal DB America (senza pooler) e restore nel DB Europa (senza pooler)
OLD_DATABASE_URL_UNPOOLED="postgresql://USER:PASSWORD@ep-xxx.us-east-2.aws.neon.tech/neondb?sslmode=require"
NEW_DATABASE_URL_UNPOOLED="postgresql://USER:PASSWORD@ep-yyy.eu-central-1.aws.neon.tech/neondb?sslmode=require"

bash scripts/migrate-neon-to-eu.sh "$OLD_DATABASE_URL_UNPOOLED" "$NEW_DATABASE_URL_UNPOOLED"
```

(Se preferisci: `chmod +x scripts/migrate-neon-to-eu.sh` e poi `./scripts/migrate-neon-to-eu.sh ...`)

Sostituisci le URL con le tue (entrambe **senza** `-pooler` nell’host).

### Opzione B — Comandi manuali

1. **Dump** dal database America (usa URL **senza pooler**):

   ```bash
   pg_dump -Fc -v -d "postgresql://USER:PASSWORD@ep-xxx.us-east-2.aws.neon.tech/neondb?sslmode=require" -f neon-dump-america.bak
   ```

2. **Restore** nel database Europa (usa URL **senza pooler**). Con `-O` evitiamo errori di ownership su Neon:

   ```bash
   pg_restore -v -O -d "postgresql://USER:PASSWORD@ep-yyy.eu-central-1.aws.neon.tech/neondb?sslmode=require" neon-dump-america.bak
   ```

3. Se vedi errori tipo “already exists” per alcune tabelle, di solito si possono ignorare; i dati vengono comunque ripristinati. Se il restore fallisce in modo chiaro, puoi creare prima solo lo schema con Prisma e poi fare un restore solo dati (in quel caso chiedi supporto o segui la doc Neon per “schema-only” + “data only”).

Dopo il restore, il database in Europa ha **stesso schema e stessi dati** di quello in America.

---

## Passo 4 — Aggiornare DATABASE_URL (locale e Vercel)

L’app usa sempre `DATABASE_URL`. Ora deve puntare al **nuovo** progetto in Europa, usando la connection string **con pooler** (per serverless/Vercel).

### In locale

1. Apri il file `.env` (o `.env.local`) nella root del progetto.
2. Sostituisci `DATABASE_URL` con la **nuova** connection string (quella del progetto EU, **con** pooler).
3. Salva. Non committare mai il file `.env`.

Esempio:

```env
# Prima (America)
# DATABASE_URL=postgresql://...@ep-xxx-pooler.us-east-2.aws.neon.tech/neondb?sslmode=require

# Dopo (Europa)
DATABASE_URL=postgresql://...@ep-yyy-pooler.eu-central-1.aws.neon.tech/neondb?sslmode=require
```

### Su Vercel

1. Vercel → tuo progetto → **Settings** → **Environment Variables**.
2. Trova `DATABASE_URL`.
3. Modifica il valore e incolla la **nuova** connection string (progetto EU, **con** pooler).
4. Salva e fai un **redeploy** del progetto (Deployments → ⋮ su ultimo deploy → Redeploy).

Dopo il redeploy, la piattaforma in produzione userà il database in Europa.

---

## Passo 5 — Verificare che tutto funzioni

1. **Locale**
   - Avvia l’app: `npm run dev`.
   - Fai login, controlla eventi, crediti, classifica, ecc.
2. **Produzione (Vercel)**
   - Apri il sito in produzione e ripeti i controlli (login, dati, funzionalità principali).

Se tutto è ok, la migrazione è conclusa.

---

## Passo 6 — (Opzionale) Eliminare il vecchio progetto Neon

Quando sei sicuro che non ti serve più il database in America:

1. Vai nella Neon Console sul **vecchio** progetto (America).
2. **Settings** → **Delete project** (o simile).
3. Conferma. I dati restano solo nel nuovo progetto EU.

---

## Riepilogo modifiche al progetto

- **Codice:** nessuna modifica. Lo schema Prisma e le migrazioni restano uguali.
- **Variabili:**
  - `.env` / `.env.local`: aggiornata solo `DATABASE_URL` con la nuova URL EU (con pooler).
  - Vercel: aggiornata `DATABASE_URL` e redeploy.
- **Database:** stesso schema e stessi dati, ma sul nuovo progetto Neon in Europa (es. Frankfurt).

Se qualcosa non torna (es. errori di connessione o “relation does not exist”), controlla che:
- la URL usata dall’app abbia il **pooler** (`-pooler` nell’host) per Vercel/serverless;
- la URL sia quella del **nuovo** progetto (host in `eu-central-1` o `eu-west-2`, non più `us-east-1` / `us-east-2`).

---

## Riferimenti

- [Neon – Regions](https://neon.tech/docs/introduction/regions)
- [Neon – Migrate from another Neon project](https://neon.tech/docs/import/migrate-from-neon)
- [Neon – pg_dump / pg_restore](https://neon.tech/docs/import/migrate-from-postgres)
