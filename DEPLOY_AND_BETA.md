# Step 15: Deploy su Vercel e Beta Test (20–50 utenti)

Guida per mettere online il prediction market su Vercel e condurre un beta test con 20–50 utenti.

---

## Parte 1: Preparazione

### 1.1 Database PostgreSQL (obbligatorio per Vercel)

Il progetto usa **PostgreSQL** in produzione (Vercel non supporta SQLite su serverless).

**Opzione consigliata: Neon (gratuito)**  
1. Vai su [neon.tech](https://neon.tech) e crea un account.  
2. Crea un nuovo progetto (es. `prediction-market`).  
3. Copia la **connection string** (es. `postgresql://user:pass@ep-xxx.region.aws.neon.tech/neondb?sslmode=require`).  
4. Tienila a portata di mano per il passo 2.2.

**Sviluppo locale:**  
- Usa lo stesso database Neon (creane uno “dev” se preferisci), oppure  
- Docker: `docker run -d -p 5432:5432 -e POSTGRES_PASSWORD=postgres postgres:16`  
  e imposta `DATABASE_URL=postgresql://postgres:postgres@localhost:5432/prediction_market`.

### 1.2 Creare le tabelle sul database di produzione

**Una sola volta**, dalla tua macchina (con `DATABASE_URL` puntato al DB di produzione, es. Neon):

```bash
export DATABASE_URL="postgresql://..."   # la URL del progetto Neon
npx prisma db push
npm run db:seed
```

Così crei schema e dati iniziali (badge, missioni, admin) sul DB usato da Vercel.

---

## Parte 2: Deploy su Vercel

### 2.1 Collegare il progetto a Vercel

1. Vai su [vercel.com](https://vercel.com) e accedi (GitHub/GitLab/Bitbucket).  
2. **Import Project**: collega il repository del prediction market.  
3. Framework: **Next.js** (rilevato automaticamente).  
4. **Root Directory**: lascia vuoto se il codice è nella root del repo.

### 2.2 Variabili d’ambiente su Vercel

In **Project → Settings → Environment Variables** imposta (per **Production**, e se vuoi anche Preview):

| Variabile | Descrizione | Esempio |
|-----------|-------------|---------|
| `DATABASE_URL` | Connection string PostgreSQL (Neon) | `postgresql://user:pass@ep-xxx.neon.tech/neondb?sslmode=require` |
| `NEXTAUTH_URL` | URL pubblico dell’app | `https://tuo-progetto.vercel.app` |
| `NEXTAUTH_SECRET` | Segreto per sessioni (genera una stringa lunga e casuale) | es. `openssl rand -base64 32` |
| `GOOGLE_CLIENT_ID` | (Opzionale) Client ID Google OAuth | da Google Cloud Console |
| `GOOGLE_CLIENT_SECRET` | (Opzionale) Client secret Google OAuth | da Google Cloud Console |
| `CRON_SECRET` | (Consigliato) Segreto per il cron che risolve gli eventi chiusi; se impostato, Vercel lo invia come `Authorization: Bearer <CRON_SECRET>` | es. `openssl rand -base64 32` |

**Importante:**  
- Dopo il primo deploy, **aggiorna** `NEXTAUTH_URL` con l’URL reale (es. `https://prediction-market-xxx.vercel.app`).  
- Se usi Google OAuth, in Google Cloud Console aggiungi come **Authorized redirect URI**:  
  `https://TUO_DOMAIN.vercel.app/api/auth/callback/google`.

### 2.3 Build e deploy

- **Build Command** (se non usi `vercel.json`):  
  `prisma generate && next build`  
- **Output**: Next.js (default).  
- Clicca **Deploy**.  
- Al termine avrai un URL tipo: `https://prediction-market-xxx.vercel.app`.

### 2.4 Verifiche post-deploy

- Apri l’URL e controlla che la home si carichi.  
- Prova **Registrazione** e **Login** (email/password e, se configurato, Google).  
- Controlla che eventi, previsioni e wallet funzionino (usa il DB che hai fatto il seed al passo 1.2).

### 2.5 Fase 5: Cron per risolvere eventi chiusi (opzionale ma consigliato)

Per processare **automaticamente** gli eventi la cui data di chiusura (`closesAt`) è passata:

1. **Variabile d’ambiente**  
   In **Settings → Environment Variables** aggiungi `CRON_SECRET` (es. genera con `openssl rand -base64 32`). In questo modo solo le richieste con header `Authorization: Bearer <CRON_SECRET>` possono attivare la risoluzione.

2. **Configurazione nel progetto**  
   Il file `vercel.json` contiene già la sezione **crons** che chiama una volta al giorno (mezzanotte UTC) l’URL:
   - `https://<TUO_DOMINIO>/api/cron/resolve-events`  
   con metodo **GET**. Quando `CRON_SECRET` è impostato, Vercel può inviarlo nell’header `Authorization: Bearer <CRON_SECRET>` (verifica nella documentazione Vercel per il tuo piano).

3. **Vercel Dashboard (se disponibile per il piano)**  
   Vai in **Settings → Cron Jobs**: dovresti vedere il job definito in `vercel.json`. Se puoi configurare header custom, imposta `Authorization: Bearer <valore_di_CRON_SECRET>` così solo il cron ufficiale e il tuo segreto possono attivare l’endpoint.

4. **Risultato**  
   Gli eventi chiusi vengono risolti in automatico (outcome da maggioranza di crediti, payout e statistiche aggiornati) senza esporre endpoint pericolosi. In produzione, se `CRON_SECRET` non è impostato, l’endpoint risponde 503.

**Frequenza:** lo schedule in `vercel.json` è `0 0 * * *` (ogni giorno a mezzanotte UTC). Per eseguire ogni 6 ore puoi usare `0 */6 * * *`.

---

## Parte 3: Beta test con 20–50 utenti

### 3.1 Obiettivi del beta

- Verificare che **registrazione, login, previsioni, wallet, notifiche** funzionino in produzione.  
- Raccogliere feedback su usabilità e bug.  
- Stimare carico e performance con 20–50 utenti reali.

### 3.2 Come reclutare i beta tester

- **Invito diretto**: email o messaggio a 20–50 persone (amici, colleghi, community).  
- **Link unico**: condividi l’URL Vercel (es. `https://tuo-app.vercel.app`) e, se vuoi, un breve form (Google Form/Typeform) per raccogliere email e consenso.  
- **Messaggio tipo**:  
  *“Stiamo testando una piattaforma di prediction market. Vorremmo il tuo feedback dopo aver provato registrazione, login e qualche previsione. Link: [URL]. Tempo stimato: 10–15 minuti.”*

### 3.3 Cosa far testare (checklist per i tester)

Puoi inviare una mini-checklist (email o nella landing):

1. Registrazione (email + password).  
2. Login e logout.  
3. Visualizzare la lista eventi e aprire un evento.  
4. Fare almeno una previsione (SÌ/NO) con crediti.  
5. Controllare il wallet (saldo, transazioni).  
6. (Opzionale) Accedi con Google, se attivo.  
7. Segnalare eventuali errori o comportamenti strani (con browser e dispositivo usati).

### 3.4 Raccogliere feedback

- **Form**: Google Form / Typeform con domande tipo:  
  - “Qualcosa non ha funzionato? Descrivi.”  
  - “Quanto è stato facile trovare dove fare una previsione? (1–5).”  
  - “Suggerimenti per migliorare.”  
- **Canale dedicato**: canale Slack/Discord o email (es. `beta@tuodominio.com`) per bug e commenti.  
- **Analytics**: su Vercel puoi abilitare **Vercel Analytics** (se attivo nel progetto) per vedere visite e performance.

### 3.5 Monitoraggio durante il beta

- **Vercel Dashboard**: controlla **Deployments** e **Logs** per errori 500 o build fallite.  
- **Neon Dashboard**: controlla connessioni e utilizzo del DB.  
- **NextAuth**: in caso di problemi login, verifica che `NEXTAUTH_URL` e callback OAuth siano corretti.

### 3.6 Dopo il beta

- Raccogli i feedback in un foglio (es. “Bug”, “UX”, “Feature richieste”).  
- Correggi i bug critici e, se possibile, un paio di miglioramenti UX veloci.  
- Valuta un secondo giro di test (stessi o nuovi utenti) prima di aprire a un pubblico più largo.

---

## Riepilogo comandi utili

```bash
# Genera client Prisma (in build Vercel è incluso)
npx prisma generate

# Crea/aggiorna tabelle sul DB (solo prima volta o dopo cambio schema)
DATABASE_URL="postgresql://..." npx prisma db push

# Seed badge, missioni, admin (solo prima volta)
DATABASE_URL="postgresql://..." npm run db:seed

# Deploy da CLI (opzionale)
npx vercel
```

---

## Troubleshooting

- **Build fallisce con errore Prisma**: verifica che in Vercel sia impostata `DATABASE_URL` e che il **Build Command** sia `prisma generate && next build`.  
- **Login non funziona in produzione**: vedi sotto **Risolvere i problemi di login (step by step)**.  
- **Google OAuth “redirect_uri_mismatch”**: vedi sotto **Configurare il login con Google (step by step)**.  
- **Errori DB in produzione**: verifica che su Neon la connection string sia corretta e che le tabelle esistano (`prisma db push` + `db:seed` eseguiti come in 1.2).

---

## Risolvere i problemi di login (step by step)

Se in produzione (Vercel) il login con email/password non funziona (redirect che non avviene, “Credenziali non valide” pur con dati giusti, o pagina bianca):

### Step 1: Variabili d’ambiente su Vercel

1. Vai su **Vercel** → tuo progetto → **Settings** → **Environment Variables**.  
2. Controlla che esistano e siano corretti:
   - **`NEXTAUTH_URL`**: deve essere **esattamente** l’URL della tua app, **senza** slash finale.  
     - Esempio: `https://prediction-market-xxx.vercel.app`  
     - **Non** usare `http://` in produzione.  
   - **`NEXTAUTH_SECRET`**: deve essere una stringa lunga e casuale.  
     - Per generarla: `openssl rand -base64 32` nel terminale, poi incolla il valore.  
3. Se hai modificato le variabili, fai un **Redeploy** (Deployments → ⋮ → Redeploy).

### Step 2: Database e utenti

1. Assicurati che il **database di produzione** (es. Neon) sia stato inizializzato:
   ```bash
   export DATABASE_URL="postgresql://..."   # connection string Neon
   npx prisma db push
   npm run db:seed
   ```
2. L’utente con cui fai login deve esistere in quel database (registrato dalla stessa app in produzione, o creato dal seed).  
3. Controlla su **Neon** (Dashboard → Tables) che la tabella `users` esista e che la connection string in Vercel sia la stessa (incluso `?sslmode=require`).

### Step 3: Diagnostica e log

1. Apri **`https://TUO_DOMAIN.vercel.app/api/auth-status`** (stesso dominio dell’app): vedi se le variabili sono impostate e se l’URL corrisponde a `NEXTAUTH_URL`.  
2. In Vercel vai in **Deployments** → ultimo deploy → **Functions** (o **Logs**).  
3. Prova di nuovo il login e controlla se compaiono errori 500 o messaggi relativi a NextAuth/Prisma. Se vedi errori di connessione al database, torna allo Step 2.

Se dopo questi passi il login funziona in locale ma non su Vercel, è quasi sempre **NEXTAUTH_URL** o **NEXTAUTH_SECRET** mancanti/errati, o **DATABASE_URL** che non punta al DB usato in produzione.

---

## Configurare il login con Google (step by step)

Per abilitare “Accedi con Google” in produzione:

### Step 1: Creare le credenziali Google

1. Vai su [Google Cloud Console](https://console.cloud.google.com/apis/credentials).  
2. Seleziona un progetto (o creane uno nuovo, es. “Prediction Market”).  
3. In **Credenziali** → **Crea credenziali** → **ID client OAuth**.  
4. Tipo di applicazione: **Applicazione Web**.  
5. Nome: ad es. “Prediction Market Web”.  
6. In **URI di reindirizzamento autorizzati** aggiungi **entrambi**:
   - Per sviluppo: `http://localhost:3000/api/auth/callback/google`
   - Per produzione: `https://TUO_DOMAIN.vercel.app/api/auth/callback/google`  
     (sostituisci `TUO_DOMAIN.vercel.app` con l’URL reale, es. `prediction-market-xxx.vercel.app`).  
7. Clicca **Crea**.  
8. Copia **ID client** e **Segreto client**.

### Step 2: Variabili su Vercel

1. Vercel → progetto → **Settings** → **Environment Variables**.  
2. Aggiungi (per **Production** e, se vuoi, **Preview**):
   - **`GOOGLE_CLIENT_ID`**: incolla l’ID client.  
   - **`GOOGLE_CLIENT_SECRET`**: incolla il segreto client.  
3. Salva e fai un **Redeploy**.

### Step 3: Verifica

1. Apri l’app in produzione.  
2. Vai alla pagina di login (o registrazione).  
3. Clicca **Accedi con Google** (o **Registrati con Google**).  
4. Dovresti essere reindirizzato a Google, poi di nuovo all’app dopo il consenso.

**Se compare “redirect_uri_mismatch”**:  
- Controlla che in Google Cloud Console l’URI di reindirizzamento sia **identico** a quello usato dall’app (nessuno spazio, stesso schema `https://`, stesso dominio e path `/api/auth/callback/google`).

---

## Fase 6: Post-deploy (sicurezza e buone pratiche)

Dopo il primo deploy e durante i beta test, applica queste pratiche per sicurezza e manutenzione.

### 6.1 HTTPS

**Vercel fornisce HTTPS di default** per tutti i domini (`.vercel.app` e domini personalizzati). Non serve alcuna configurazione aggiuntiva: il traffico è già cifrato.

### 6.2 Cookie e sessione

In **`lib/auth.ts`** in produzione sono già configurati:

- Nome cookie: `__Secure-next-auth.session-token` (prefisso `__Secure-` richiesto su HTTPS)
- `httpOnly: true` (non accessibile da JavaScript, riduce rischio XSS)
- `sameSite: "lax"` (protezione CSRF)
- `secure: true` (solo su HTTPS)

Nessuna modifica necessaria; la configurazione è adeguata per produzione.

### 6.3 Account admin

L'utente admin creato dal seed (**`admin@predictionmarket.it`**) va usato **solo per la gestione** della piattaforma (dashboard admin, moderazione, ecc.).

- **Cambia subito la password** se hai usato una password temporanea durante il setup.
- Non usare questo account per navigazione ordinaria o test come utente finale.
- Per cambiare password: accedi come admin → (se hai una pagina profilo/impostazioni) oppure aggiorna l'hash nel DB con uno nuovo generato da `bcrypt` (es. script one-off o da Prisma Studio).

### 6.4 Dominio personalizzato (opzionale)

Se vuoi usare un dominio tuo (es. `app.tuodominio.com`):

1. **Vercel** → progetto → **Settings** → **Domains**
2. Aggiungi il dominio e segui le istruzioni DNS (record CNAME o A come indicato da Vercel)
3. Dopo la verifica del dominio:
   - In **Vercel → Settings → Environment Variables** aggiorna **`NEXTAUTH_URL`** con il nuovo URL (es. `https://app.tuodominio.com`, senza slash finale)
   - Se usi **Google OAuth**: in [Google Cloud Console](https://console.cloud.google.com/apis/credentials) → le tue credenziali OAuth → **URI di reindirizzamento autorizzati** → aggiungi `https://app.tuodominio.com/api/auth/callback/google`
4. Riesegui un deploy (o attendi che Vercel rilevi il nuovo dominio) e verifica login e callback.

### 6.5 Backup del database

Su **Neon**:

- **Dashboard Neon**: puoi usare **branch** (copie del database) e le funzionalità di backup dal pannello. Controlla la documentazione Neon per il tuo piano (backup automatici, point-in-time recovery, ecc.).
- **Pianifica backup periodici** se i dati sono importanti: configura da dashboard o con script che eseguono dump (es. `pg_dump`) e li salvano in uno storage sicuro (S3, altro cloud). Per beta con pochi utenti spesso bastano i branch/snapshot Neon; per produzione con dati critici valuta backup automatici e retention.

### 6.6 Monitoraggio durante i beta test

- **Vercel Dashboard**: **Deployments** (stato build, errori), **Logs** (errori runtime, 500), **Analytics** (se abilitato) per traffico e performance. Controlla periodicamente durante il beta.
- **Neon Dashboard**: **connessioni attive**, **utilizzo risorse**, query lente o errori. Utile per capire il carico e intervenire prima che diventi un collo di bottiglia.
- In caso di errori di login o OAuth, usa la sezione **Risolvere i problemi di login** e **Configurare il login con Google** in questo documento; tieni sempre allineati `NEXTAUTH_URL`, redirect URI e variabili d'ambiente.
