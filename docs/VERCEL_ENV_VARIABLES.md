# Variabili d'ambiente su Vercel

## DB: quando aggiornare DATABASE_URL

In condizioni normali **non toccare** `DATABASE_URL`: è già corretta e va bene per tutto il progetto (LMSR, feed, eventi, ecc.).

**Aggiorna `DATABASE_URL`** quando ad esempio:
- Migri il database Neon in un’altra regione (es. da America a Europa): usa la nuova connection string del progetto di destinazione e fai redeploy. Vedi [MIGRAZIONE_NEON_EU_ITALIA.md](./MIGRAZIONE_NEON_EU_ITALIA.md).
- Crei un nuovo progetto Neon (nuovo ambiente o nuovo account).

---

## Redis: opzionale

**Non è obbligatorio aggiungere Redis.**  
Il codice usa Redis solo se esiste la variabile `REDIS_URL`. Se **non** la imposti:

- La cache (feed, prezzi, trending) usa **memoria locale** (in-memory).
- Il sito funziona normalmente; ogni istanza serverless ha la sua cache.

**Quando ha senso aggiungere Redis:**

- Hai molto traffico e vuoi cache condivisa tra le istanze.
- Vuoi che il feed/trending resti in cache anche tra un deploy e l’altro.

**Come aggiungerla (se vuoi):**

1. Vercel → progetto → **Settings** → **Environment Variables**.
2. **Add New**:
   - **Name:** `REDIS_URL`
   - **Value:** l’URL del tuo Redis (es. da [Upstash](https://upstash.com) o Redis Cloud).
     - Formato: `rediss://default:PASSWORD@HOST:PORT` (con `rediss` per TLS).
   - **Environments:** scegli **Production** (e opzionalmente Preview se ti serve).

Su Upstash (gratis per piccoli volumi): crei un database Redis, copi l’URL e lo incolli come valore di `REDIS_URL`.

---

## Riepilogo: cosa hai già / cosa può mancare

| Variabile           | Hai già? | Note |
|---------------------|----------|------|
| `DATABASE_URL`      | Sì       | Non cambiarla. |
| `NEXTAUTH_URL`      | Sì       | In prod deve essere l’URL del sito (es. `https://tuo-progetto.vercel.app`). |
| `NEXTAUTH_SECRET`   | Sì       | OK. |
| `GOOGLE_CLIENT_ID`  | Sì       | OK. |
| `GOOGLE_CLIENT_SECRET` | Sì    | OK. |
| `OPENAI_API_KEY`    | Sì       | Per generazione eventi. |
| `NEWS_API_KEY`      | Sì       | Per pipeline notizie. |
| `CRON_SECRET`       | Sì       | Per cron (risoluzione, generazione eventi). |
| **`REDIS_URL`**     | No       | **Opzionale.** Senza: cache in-memory. Con: cache Redis. |
| `RESEND_API_KEY`    | Probabile no | Solo se usi invio email (verifica account). |
| `EMAIL_FROM`        | Probabile no | Solo se usi email (es. `nome <onboarding@tuodominio.com>`). |
| `ANALYTICS_PROVIDER` | Probabile no | Solo se usi analytics (es. `posthog`). |
| `POSTHOG_API_KEY`   | Probabile no | Solo con PostHog. |
| `EVENT_GENERATOR_USER_ID` | No  | Opzionale: id utente che “possiede” gli eventi generati; altrimenti si usa il primo admin. |

---

## In sintesi

- **DB:** lascia `DATABASE_URL` com’è.
- **Redis:** non è obbligatorio. Se vuoi aggiungerlo: crea una variabile `REDIS_URL` su Vercel con l’URL del tuo Redis (es. da Upstash).
- **Tutto il resto** che vedi nell’elenco sopra è opzionale (email, analytics, generator user id): aggiungili solo se usi quelle funzionalità.
