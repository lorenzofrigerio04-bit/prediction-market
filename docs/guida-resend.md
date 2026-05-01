# Guida Resend — passo dopo passo (versione tranquilla)

Resend è il servizio che **spedisce davvero le email** dalla tua app. Tu devi solo: account, una chiave, e (se vuoi messaggi più affidabili) un dominio. Niente panic: se salti il dominio, puoi comunque fare test.

---

## Cosa fare in ordine (checklist mentale)

1. Apri Resend e crei l’account.  
2. Crei una **API Key** e la copi.  
3. La incolli nel file `.env.local` sul computer (non su GitHub).  
4. (Opzionale ma consigliato in produzione) Verifichi **il tuo dominio** così le email arrivano bene e non finiscono nello spam.  
5. Riavvii l’app (`npm run dev` o deploy su Vercel con le variabili impostate).

---

## Passo 1 — Account

1. Vai su **https://resend.com**.  
2. Clicca per registrarti (Google o email va bene).

---

## Passo 2 — API Key (la cosa indispensabile)

1. Dopo il login, nel menu cerca qualcosa come **API Keys** (Chiavi API).  
2. Crea una nuova chiave. Puoi chiamarla ad esempio **prediction-market**.  
3. Ti mostrano una stringa che **inizia con `re_`**. Copiala **una sola volta** (spesso non te la rifanno vedere tutta).

---

## Passo 3 — Mettere la chiave nel progetto

1. Nel tuo progetto, apri (o crea) il file **`.env.local`** nella cartella radice dell’app.  
2. Aggiungi queste righe (sostituisci con la tua chiave):

```env
RESEND_API_KEY=re_la_tua_chiave_qui
EMAIL_FROM="Prediction Market <onboarding@resend.dev>"
```

Significato in due parole:

- **`RESEND_API_KEY`**: la chiave `re_...` copiata da Resend.  
- **`EMAIL_FROM`**: mittente delle email.

Per **solo test**, Resend ti permette di usare quasi sempre un indirizzo tipo **`onboarding@resend.dev`**: è già autorizzato sul loro sistema, così parti subito senza toccare il DNS.

⚠️ In produzione, con volumi più alti e meno spam, è meglio usare il **tuo dominio** (Passo 4).

---

## Passo 4 — Dominio tuo (opzionale all’inizio, consigliato dopo)

Serve perché le email escano tipo **`noreply@tuosito.it`** e siano considerate più affidabili.

### 4.a Aggiungi il dominio in Resend

1. In dashboard Resend, cerca **Domains** (Domini).  
2. **Add domain** → scrivi `tuosito.it` (senza www va bene di solito).  
3. Resend ti dà alcuni record **DNS** da copiare (SPF, DKIM, ecc.).

### 4.b Incolla i record dove gestisci il dominio

Dove hai comprato il dominio (Squarespace, Cloudflare, Aruba, ecc.) vai alla sezione **DNS** e crea esattamente i record che Resend ti indica (tipo, nome/host, valore). Salva.

### 4.c Aspetta il “Verificato”

Il DNS può metterci qualche minuto o qualche ora. Quando nella dashboard il dominio risulta **Verified**, aggiorni `.env.local` (o le variabili su Vercel):

```env
EMAIL_FROM="Prediction Market <noreply@tuosito.it>"
```

(l’email a sinistra deve essere un indirizzo del dominio che hai verificato in Resend; spesso gli admin creano **`noreply@...`** o **`hello@...`**.)

---

## Passo 5 — Sito in produzione (Vercel o altri)

Ovunque fai il deploy:

1. Nelle **environment variables**, aggiungi le stesse:
   - `RESEND_API_KEY`
   - `EMAIL_FROM`

2. **Importante anche per i link nelle mail:** `NEXTAUTH_URL` deve essere l’URL pubblico del sito (es. `https://tuosito.it`), senza `/api` alla fine.

3. Ridistribuisci l’app dopo aver salvato le variabili.

---

## Cron (promemoria scadenza mercati)

Il job che manda il promemoria “mercato in scadenza” è protetto come gli altri cron: in produzione imposta **`CRON_SECRET`** e Vercel invierà l’header `Authorization` automaticamente quando esegue il cron.

Percorso: **`GET /api/cron/event-expiry-reminders`** (schedulato in `vercel.json` ogni 8 ore).

---

## Se qualcosa “non parte” — cause tipiche

| Sintomo | Cosa controllare |
|--------|-------------------|
| Nessuna mail in locale | Hai messo **`RESEND_API_KEY`** nel `.env.local` e riavviato `npm run dev`? Senza chiave in sviluppo l’app **non blocca**, ma può solo fare un warning in console. |
| Errore “domain not verified” | Stai usando un `EMAIL_FROM` con dominio tuo ma il dominio in Resend non è ancora verificato. Soluzione: usa per un attimo **`onboarding@resend.dev`** oppure finisci i record DNS. |
| Link nelle mail sbagliati | **`NEXTAUTH_URL`** (o `NEXT_PUBLIC_SITE_URL`) non coincide con il sito pubblico. |
| Mail finite nello spam | Dominio verificato + contenuto sobrio aiuta; nei test questo è normale più spesso che in produzione. |

---

## Riepilogo variabili (copia-incolla checklist)

```env
RESEND_API_KEY=re_...
EMAIL_FROM="Prediction Market <onboarding@resend.dev>"
NEXTAUTH_URL=http://localhost:3000   # es. locale; in prod https://tuodominio.it
CRON_SECRET=...                      # prod: richiesto per i cron sicuri su Vercel
```

Fine. Se hai fatto solo i passi 1–3 e usi **`onboarding@resend.dev`**, hai già tutto ciò che serve per **vedere le prime mail** e tirare un sospiro di sollievo.
