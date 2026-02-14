# Verifica email – Configurazione

Il progetto invia email di verifica per **tutti gli account creati con email/password**, così puoi essere sicuro che gli indirizzi raccolti siano validi. Gli account creati con **Google** sono considerati già verificati (Google verifica l’email).

---

## Come funziona

1. **Registrazione (email/password)**  
   Dopo la registrazione viene inviata un’email con un link. L’utente clicca il link entro 24 ore → l’email viene segnata come verificata (`User.emailVerified`).

2. **Login con Google**  
   L’email viene segnata come verificata al primo accesso (Google garantisce che l’indirizzo sia reale).

3. **Banner**  
   Se l’utente è loggato ma non ha ancora verificato l’email, vede un banner in alto con “Verifica il tuo indirizzo email” e il pulsante “Invia di nuovo” per ricevere un nuovo link.

---

## Configurazione invio email (Resend)

Il progetto usa **Resend** (https://resend.com) per inviare le email.

### Step 1: Account Resend

1. Vai su **https://resend.com** e crea un account.
2. Nel **Dashboard** → **API Keys** crea una chiave (es. “Prediction Market”).
3. Copia la chiave (inizia con `re_`).

### Step 2: Variabili d’ambiente

Aggiungi nel tuo `.env.local`:

```env
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxxxxxx
EMAIL_FROM="Prediction Market <onboarding@resend.dev>"
```

- **RESEND_API_KEY**: la chiave copiata da Resend.
- **EMAIL_FROM**: mittente dell’email.  
  - In **test** puoi usare `onboarding@resend.dev` (dominio Resend).  
  - In **produzione** conviene verificare un tuo dominio in Resend e usare ad es. `noreply@tuodominio.com`.

### Step 3: Dominio in produzione (opzionale)

1. In Resend: **Domains** → **Add Domain** → inserisci il tuo dominio.
2. Aggiungi i record DNS che Resend ti indica (SPF, DKIM, ecc.).
3. Quando il dominio è verificato, imposta ad es.:
   ```env
   EMAIL_FROM="Prediction Market <noreply@tuodominio.com>"
   ```

---

## Comportamento in sviluppo

Se **RESEND_API_KEY** non è impostata e `NODE_ENV=development`, l’API di invio non fallisce: in console vedrai un warning e l’email non sarà inviata. Così puoi sviluppare senza configurare subito Resend. In produzione è necessario impostare **RESEND_API_KEY** (e, consigliato, **EMAIL_FROM** con il tuo dominio).

---

## Riepilogo variabili

| Variabile        | Obbligatoria (prod) | Descrizione                          |
|------------------|----------------------|--------------------------------------|
| RESEND_API_KEY   | Sì                   | API key da Resend                    |
| EMAIL_FROM       | Consigliata          | Mittente (es. `App <noreply@domain.com>`) |
| NEXTAUTH_URL     | Sì                   | URL del sito (per i link nelle email)     |
