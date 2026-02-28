# Setup su nuovo Mac (Apple Silicon)

Dopo aver reinstallato il progetto su un nuovo Mac, eventi, login e contatori dipendono da: **database**, **migrazioni**, **seed** e **variabili d’ambiente**. Segui questa checklist.

---

## 1. Variabili d’ambiente (`.env`)

Assicurati di avere un file `.env` nella root del progetto (copia da `.env.example` se non c’è).

**Obbligatorie per far funzionare tutto:**

| Variabile | Uso |
|-----------|-----|
| `DATABASE_URL` | PostgreSQL (es. Neon, Supabase, o Postgres locale). **Senza questa**: niente eventi, niente contatori, niente login. |
| `NEXTAUTH_URL` | In sviluppo: `http://localhost:3000` |
| `NEXTAUTH_SECRET` | Una stringa segreta qualsiasi (es. `openssl rand -base64 32`) |
| `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` | Per login con Google (vedi `docs/GOOGLE_LOGIN_SETUP.md`) |

- Se sul vecchio Mac usavi un **database in cloud** (Neon, ecc.): copia lo stesso `DATABASE_URL` nel nuovo `.env` (stesso DB = stessi eventi e utenti).
- Se usavi un **Postgres solo locale** sul vecchio Mac: sul nuovo Mac quel DB non c’è. Opzioni:
  - Creare un DB cloud (es. Neon) e usare quel `DATABASE_URL`, oppure
  - Installare Postgres in locale sul nuovo Mac e creare un DB, poi fare migrazioni + seed (vedi sotto).

---

## 2. Database: schema e dati

Dopo aver impostato `DATABASE_URL`:

```bash
# Genera il client Prisma
npm run db:generate

# Applica lo schema al database (crea/aggiorna le tabelle)
npm run db:push
# oppure, se usi le migrazioni: npm run db:migrate

# Popola il DB con dati di esempio (admin + 3 eventi)
npm run db:seed
```

- **Eventi non in lista**: di solito il DB è vuoto o non raggiungibile. Controlla `DATABASE_URL` e riesegui `db:push` + `db:seed`.
- **Contatori a zero**: i contatori (utenti ed eventi attivi) vengono da `GET /api/landing-stats`, che legge dal DB. Se il DB è vuoto, restano 0. Dopo il seed dovresti vedere numeri > 0.

---

## 3. Verificare lo stato del database

Dalla root del progetto:

```bash
npx dotenv -e .env -- tsx scripts/check-db-events.ts
```

Oppure, se non hai `dotenv`:

```bash
# Mac/Linux: carica .env e esegue lo script
export $(grep -v '^#' .env | xargs) && npx tsx scripts/check-db-events.ts
```

- Se vedi **Eventi: 0, Utenti: 0** → DB vuoto: esegui `npm run db:seed`.
- Se lo script dà errore di connessione → `DATABASE_URL` sbagliata o DB non raggiungibile (rete, firewall, credenziali).

---

## 4. Login (NextAuth)

- **Stesso DB del vecchio Mac** (es. Neon): le sessioni e gli utenti sono già nel DB; con `NEXTAUTH_SECRET` e `NEXTAUTH_URL=http://localhost:3000` il login dovrebbe funzionare.
- **Nuovo DB vuoto**: dopo il seed avrai un utente admin (credenziali in `prisma/seed.ts`). Per Google: configura `GOOGLE_CLIENT_ID` e `GOOGLE_CLIENT_SECRET` e aggiungi `http://localhost:3000` agli URI di redirect in Google Cloud Console (vedi `docs/GOOGLE_LOGIN_SETUP.md`).
- Se in dev con Google vedi errori tipo “unable to get local issuer certificate”, in `.env` puoi impostare `NEXTAUTH_INSECURE_SSL_DEV=1` (solo sviluppo).

---

## 5. Riepilogo problemi comuni

| Problema | Causa probabile | Cosa fare |
|----------|-----------------|-----------|
| Nessun evento in homepage | DB vuoto o non connesso | Verificare `DATABASE_URL`, `db:push`, `db:seed` |
| Contatori (eventi/utenti) a 0 | Stesso motivo | Stesso sopra; controllare con `check-db-events.ts` |
| Login non funziona | NEXTAUTH_* o Google non configurati | Impostare `NEXTAUTH_URL`, `NEXTAUTH_SECRET`, e (per Google) client ID/secret + redirect URI localhost |
| “Bad CPU type” con Node/npm | Node per architettura sbagliata | Installare Node per ARM64 da nodejs.org e togliere dal PATH eventuali vecchi `node@20` (es. in `.zshrc`) |

---

## 6. Avvio

```bash
npm install
npm run db:generate
npm run db:push
npm run db:seed
npm run dev
# oppure: npm run dev:turbo
```

Poi apri [http://localhost:3000](http://localhost:3000). Se tutto è configurato correttamente, vedrai eventi, contatori aggiornati e login funzionante.
