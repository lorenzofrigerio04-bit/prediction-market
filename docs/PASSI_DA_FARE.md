# Passi che devi fare tu (Vercel + Google + Email)

Tutto il codice è già pronto. Questi sono **solo i passaggi che richiedono i tuoi account** (Google Cloud, Resend, Vercel). Quando hai finito, puoi mandare in chat cosa hai aggiornato (es. “Ho messo le variabili su Vercel”, “Ho aggiunto l’URI di reindirizzamento”) e, se cambi dominio o database in futuro, scrivimi e ti dico cosa aggiornare.

---

## Riepilogo

| Cosa | Dove | Obbligatorio |
|------|------|--------------|
| Variabili d’ambiente | Vercel → Project → Settings → Environment Variables | Sì (quelle sotto) |
| Google OAuth | Google Cloud Console | Solo se usi “Accedi con Google” |
| Resend (email verifica) | resend.com + variabili su Vercel | Solo se vuoi le email di verifica |

---

## 1. Variabili su Vercel (da fare sempre)

1. Vai su **https://vercel.com** → il tuo progetto **Prediction Market**.
2. **Settings** → **Environment Variables**.
3. Aggiungi queste variabili (per **Production**, e se usi Preview anche **Preview**):

| Nome | Valore | Note |
|------|--------|------|
| `DATABASE_URL` | La tua connection string PostgreSQL (Neon) | Già se ce l’hai, altrimenti crea un DB su Neon e incolla l’URL (con `-pooler` se usi Neon). |
| `NEXTAUTH_URL` | `https://prediction-market-livid.vercel.app` | **Senza slash finale.** Se cambi dominio, aggiorna qui (e in Google, step 2). |
| `NEXTAUTH_SECRET` | Una stringa lunga e casuale | Genera da terminale: `openssl rand -base64 32` e incolla il risultato. |

4. **Redeploy**: dopo aver salvato le variabili, fai **Deployments** → ultimo deploy → **⋯** → **Redeploy** (così le nuove env vengono usate).

- Se usi **Google Login**, aggiungi anche (vedi sotto dove prenderle):
  - `GOOGLE_CLIENT_ID`
  - `GOOGLE_CLIENT_SECRET`
- Se usi le **email di verifica** (Resend), aggiungi anche (vedi sotto):
  - `RESEND_API_KEY`
  - `EMAIL_FROM`

**Importante:** su Vercel non incollare spazi o a capo in fondo al valore (es. niente “Invio” dopo l’URL), altrimenti NextAuth può dare errore.

---

## 2. Google OAuth (solo se usi “Accedi con Google”)

1. Vai su **https://console.cloud.google.com/** e accedi.
2. Crea o seleziona un **progetto** (es. “Prediction Market”).
3. **API e servizi** → **Credenziali** → **+ Crea credenziali** → **ID client OAuth**.
4. Tipo: **Applicazione Web**.
5. In **URI di reindirizzamento autorizzati** aggiungi:
   - `https://prediction-market-livid.vercel.app/api/auth/callback/google`  
   (se il tuo dominio Vercel è diverso, usa quello, sempre senza slash finale prima di `/api`).
6. Clicca **Crea**: ti mostrano **ID client** (tipo `xxx.apps.googleusercontent.com`) e **Segreto client**. Copia il segreto subito (lo vedi una sola volta).
7. In **Vercel** → **Settings** → **Environment Variables** aggiungi:
   - `GOOGLE_CLIENT_ID` = ID client (es. `xxx.apps.googleusercontent.com`)
   - `GOOGLE_CLIENT_SECRET` = Segreto client
8. **Redeploy** del progetto.

Guida dettagliata passo-passo: **docs/GOOGLE_LOGIN_SETUP.md**.

---

## 3. Resend – Email di verifica (solo se vuoi inviare le email)

1. Vai su **https://resend.com** e crea un account.
2. **API Keys** → **Create API Key** → copia la chiave (inizia con `re_`).
3. In **Vercel** → **Settings** → **Environment Variables** aggiungi:
   - `RESEND_API_KEY` = la chiave copiata
   - `EMAIL_FROM` = `Prediction Market <onboarding@resend.dev>`  
     (in produzione puoi usare un tuo dominio verificato su Resend, es. `noreply@tuodominio.com`)
4. **Redeploy**.

Guida: **docs/EMAIL_VERIFICATION.md**.

---

## Cosa mandarmi in chat

Quando hai fatto i passi che ti servono, puoi scrivermi ad esempio:

- “Ho messo su Vercel DATABASE_URL, NEXTAUTH_URL, NEXTAUTH_SECRET e fatto redeploy.”
- “Ho configurato Google e aggiunto GOOGLE_CLIENT_ID e GOOGLE_CLIENT_SECRET su Vercel.”
- “Ho aggiunto RESEND_API_KEY e EMAIL_FROM su Vercel.”

**Non incollare in chat** le chiavi o le password (NEXTAUTH_SECRET, GOOGLE_CLIENT_SECRET, RESEND_API_KEY, DATABASE_URL). Bastano i nomi delle variabili che hai impostato.

Se in futuro **cambi dominio** (es. dominio custom al posto di `prediction-market-livid.vercel.app`): scrivimi il nuovo URL e ti dico cosa aggiornare (NEXTAUTH_URL su Vercel + URI in Google se usi Google).  
Se **cambi database**: scrivimi e ti dico solo dove aggiornare `DATABASE_URL` (sempre su Vercel e in locale).
