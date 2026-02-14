# Login con Google – Guida step by step

Questa guida ti porta dalla creazione del progetto su Google Cloud fino alle variabili d’ambiente nell’app.

---

## Step 1: Vai alla Google Cloud Console

1. Apri **https://console.cloud.google.com/**
2. Accedi con il tuo account Google (quello che userai come “proprietario” dell’app).

---

## Step 2: Crea un progetto (o scegline uno)

1. In alto a sinistra clicca sul menu a tendina del **progetto** (es. “Il mio progetto”).
2. Clicca **“Nuovo progetto”**.
3. Nome progetto: es. **“Prediction Market”**.
4. Clicca **“Crea”** e attendi qualche secondo.
5. Seleziona questo progetto dal menu progetti (in alto) così lavori sempre su quello giusto.

---

## Step 3: Abilita l’API “Google+ API” / “People API”

1. Nel menu a sinistra: **“API e servizi”** → **“Libreria”**.
2. Cerca **“Google+ API”** oppure **“People API”** (a seconda della console).
3. Clicca sull’API e poi su **“Abilita”**.

In molte console moderne l’accesso a email e profilo per il Login con Google è già incluso quando configuri la “Schermata di consenso OAuth”. Se non trovi “Google+ API”, puoi saltare questo step e andare allo Step 4.

---

## Step 4: Configura la schermata di consenso OAuth

1. Menu **“API e servizi”** → **“Schermata di consenso OAuth”**.
2. Scegli **“Esterno”** (per permettere a qualsiasi account Google di accedere) e clicca **“Crea”**.
3. Compila:
   - **Nome app**: es. “Prediction Market”.
   - **Email di assistenza**: la tua email.
   - **Logo** (opzionale).
   - **Dominio applicazione** (per ora puoi lasciare vuoto; in produzione inserirai il dominio, es. `predictionmarket.it`).
   - **Email del sviluppatore**: la tua email.
4. Clicca **“Salva e continua”**.
5. **Scopes**: clicca **“Aggiungi o rimuovi scope”**. Assicurati di avere almeno:
   - `.../auth/userinfo.email`
   - `.../auth/userinfo.profile`
   - `openid`
   Clicca **“Aggiorna”** e poi **“Salva e continua”**.
6. **Utenti di test** (se l’app è in “Testing”): aggiungi gli indirizzi email che potranno fare login. In produzione, dopo la “Verifica”, non serve.
7. Clicca **“Salva e continua”** e poi **“Torna alla dashboard”**.

---

## Step 5: Crea le credenziali OAuth (Client ID e Secret)

1. Menu **“API e servizi”** → **“Credenziali”**.
2. Clicca **“+ Crea credenziali”** → **“ID client OAuth”**.
3. **Tipo di applicazione**: scegli **“Applicazione Web”**.
4. **Nome**: es. “Prediction Market Web”.
5. **Origini JavaScript autorizzate**:
   - In sviluppo: `http://localhost:3000`
   - In produzione: `https://tuodominio.com` (senza slash finale)
6. **URI di reindirizzamento autorizzati**:
   - In sviluppo: `http://localhost:3000/api/auth/callback/google`
   - In produzione: `https://tuodominio.com/api/auth/callback/google`
7. Clicca **“Crea”**.
8. Si apre un popup con **ID client** (es. `xxx.apps.googleusercontent.com`) e **Segreto client**.  
   **Copia subito il Segreto client** (lo vedi una sola volta, poi è nascosto). Se lo perdi, dovrai generarne uno nuovo dalla stessa pagina.

---

## Step 6: Inserisci le variabili nell’app

Nel progetto Prediction Market:

1. Crea o modifica il file **`.env.local`** nella root del progetto.
2. Aggiungi (sostituisci con i valori veri):

```env
# Google OAuth (dallo Step 5)
GOOGLE_CLIENT_ID=il_tuo_client_id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=il_tuo_segreto_client

# NextAuth (obbligatorio per login)
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=una_stringa_casuale_lunga
```

- **NEXTAUTH_URL**: in sviluppo `http://localhost:3000`; in produzione l’URL reale (es. `https://tuodominio.com`).
- **NEXTAUTH_SECRET**: genera una stringa casuale (es. `openssl rand -base64 32` nel terminale).

3. Riavvia il server di sviluppo (`npm run dev`). Il bottone “Accedi con Google” userà queste variabili.

---

## Step 7: Verifica che funzioni

1. Vai su **http://localhost:3000/auth/login**.
2. Clicca **“Accedi con Google”**.
3. Dovresti vedere la schermata di consenso Google e, dopo il consenso, tornare all’app loggato.

Se vedi errori tipo “redirect_uri_mismatch”, controlla che l’URI in **Step 5** (Origini e URI di reindirizzamento) sia **identico** a quello che usa l’app (stesso schema, host e path, incluso `/api/auth/callback/google`).

---

## Produzione (deploy)

- In **Google Cloud Console** → Credenziali → il tuo “ID client OAuth”:
  - Aggiungi nelle **Origini autorizzate**: `https://tuodominio.com`
  - Aggiungi negli **URI di reindirizzamento**: `https://tuodominio.com/api/auth/callback/google`
- Nel deploy (es. Vercel) imposta:
  - `NEXTAUTH_URL=https://tuodominio.com`
  - `GOOGLE_CLIENT_ID` e `GOOGLE_CLIENT_SECRET` (stessi valori o un secondo client solo per produzione, se preferisci).

---

## Riepilogo variabili

| Variabile               | Dove la trovi                          |
|-------------------------|----------------------------------------|
| `GOOGLE_CLIENT_ID`      | Credenziali → ID client OAuth → “ID client” |
| `GOOGLE_CLIENT_SECRET`  | Credenziali → ID client OAuth → “Segreto client” |
| `NEXTAUTH_URL`          | Tuo sito (localhost in dev, dominio in prod) |
| `NEXTAUTH_SECRET`       | Generata da te (es. `openssl rand -base64 32`) |
