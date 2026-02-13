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
- **Login non funziona in produzione**: controlla `NEXTAUTH_URL` (deve essere l’URL pubblico senza trailing slash) e `NEXTAUTH_SECRET`.  
- **Google OAuth “redirect_uri_mismatch”**: aggiungi in Google Cloud Console l’URI esatto: `https://TUO_DOMAIN.vercel.app/api/auth/callback/google`.  
- **Errori DB in produzione**: verifica che su Neon la connection string sia corretta e che le tabelle esistano (`prisma db push` + `db:seed` eseguiti come in 1.2).
