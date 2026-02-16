# Hard reset e root cause — Prediction market

## 1) ROOT CAUSE (ordinate per probabilità)

1. **Dati legacy nel database**  
   Il DB aveva **50 eventi** (molti con `realWorldEventTime: null`, creati prima o senza il nuovo flusso). La home e il discover mostrano solo eventi “aperti”; se la maggior parte era vecchia o con filtri che li nascondevano, poteva sembrare che “non cambi nulla”. Dopo il reset (0 eventi + 1 seed) il nuovo sistema è l’unico presente.

2. **Cache (Redis / in-memory)**  
   L’endpoint `GET /api/events` usa cache trending (TTL 10 min, chiave `trending:all` o per categoria). Se dopo un deploy o un cambio DB non si invalida la cache, l’API può continuare a restituire la vecchia lista. Lo script di reset ora invalida la cache trending.

3. **Produzione usa un altro DB o non ha fatto reset**  
   In locale abbiamo eseguito lo script sul DB puntato da `DATABASE_URL` (Neon pooler). Se in **produzione** (Vercel) il `DATABASE_URL` punta allo **stesso** DB, dopo il reset vedi 1 evento anche in prod. Se invece la prod usa un **altro** DB (o non hai mai eseguito lo script lì), in prod continuerai a vedere i vecchi eventi finché non fai reset (e seed) su quel DB.

4. **Build / deploy**  
   Su Vercel, branch `main`, commit `6159044...`. Se il deploy non è partito o c’è cache CDN/ISR, l’utente può vedere una versione vecchia. Controlla **Vercel → Deployments** e **Settings → Environment Variables** (NEXTAUTH_URL senza a capo).

---

## 2) PROOF (comandi, DB, curl)

### Git
```
Branch: main
Commit: 6159044e49c27cec7ef8bd0672eba343e7a92742
Message: LMSR ovunque; bot solo su eventi con attività e in proporzione; script remove-bot-activity
```

### Database (prima del reset)
- **Conteggio:** 50 eventi.
- **Esempio riga:** `p_init: 0.5`, `b: 100`, `q_yes: 0`, `q_no: 0`, `realWorldEventTime: null`, `resolutionStatus: "PENDING"`.
- Schema: tabella `events` con campi LMSR (`p_init`, `b`, `q_yes`, `q_no`), `realWorldEventTime`, `resolutionStatus`, `closesAt`. Solo outcome binari (YES/NO).

### Comando di reset eseguito
```
npx tsx scripts/hard-reset-and-seed.ts
```
Output (estratti):
- Deleted: 91 predictions, 82 comments, 90 followers, 58 market_metrics, 4 market_analytics_raw, **50 events**.
- Events count (after delete): **0**.
- Inserted 1 event: id `cmlpqznjz00013stuyade6yuv`, title `[DEBUG] Mercato binario YES/NO — Hard reset seed`, LMSR probability (YES): **50%**.

### Curl (dopo reset, server locale)
```bash
curl -s http://localhost:3000/api/version
# {"commit":"dev","buildTime":"...","env":"local","baseApiUrl":"..."}

curl -s http://localhost:3000/api/health
# {"ok":true,"dbConnected":true,"markets_count":1}

curl -s "http://localhost:3000/api/events?status=open&limit=5"
# events[0].id === "cmlpqznjz00013stuyade6yuv", title "[DEBUG] Mercato binario YES/NO — Hard reset seed", probability 50, q_yes/q_no/b presenti

curl -s "http://localhost:3000/api/events/cmlpqznjz00013stuyade6yuv/price"
# {"eventId":"cmlpqznjz00013stuyade6yuv","probability":50,"q_yes":0,"q_no":0,"b":120}
```

---

## 3) AZIONI ESEGUITE (in Cursor)

- **STEP 0:** Verifica git (branch, commit), estensione endpoint `GET /api/version` con `baseApiUrl` e `env` (local/production).
- **STEP 1:** Verifica schema Prisma (`events` = mercati binari, campi LMSR e time), conteggio e riga di esempio.
- **STEP 2:** Esecuzione **hard reset**: eliminazione in ordine di `predictions`, `comments`, `event_followers`, `market_metrics`, `market_analytics_raw`, `events`. Verifica `events_count === 0`.
- **STEP 3:** Inserimento **1 mercato known-good** (binario YES/NO, LIVE, `p_init=0.5`, `b` da categoria, `q_yes=q_no=0`, `closesAt` e `realWorldEventTime` coerenti). Invalidazione cache trending.
- **STEP 4:** Verifica API: `GET /api/health` (dbConnected, markets_count=1), `GET /api/events`, `GET /api/events/:id/price` (probabilità 50, nessun NaN).
- **STEP 5:** Verifica UI: home e discover usano `GET /api/events` (e feed `/api/feed` per utenti loggati); `EventCard` usa LMSR (`getEventProbability` da `q_yes`, `q_no`, `b`). Aggiunto pannello debug con `?debug=1` (version, health, endpoint).
- **File creati/modificati:**
  - `app/api/version/route.ts`: aggiunti `baseApiUrl` e normalizzazione `env`.
  - `app/api/health/route.ts`: nuovo endpoint con `dbConnected` e `markets_count`.
  - `scripts/hard-reset-and-seed.ts`: script unico per reset + seed + invalidazione cache.
  - `app/page.tsx`: debug panel con version/health quando `?debug=1`.

---

## 4) COSA DEVI FARE TU FUORI DA CURSOR (checklist in italiano)

1. **Variabili d’ambiente**
   - In **locale**: in `.env` o `.env.local` controlla che ci siano `DATABASE_URL`, `NEXTAUTH_URL` (es. `http://localhost:3000`) e, se usi Redis, `REDIS_URL`.  
   - Su **Vercel**: in **Settings → Environment Variables** verifica `DATABASE_URL`, `NEXTAUTH_URL` (URL reale del sito, **senza slash finale** e **senza a capo**), `NEXTAUTH_SECRET`. Se in `NEXTAUTH_URL` c’è un carattere a capo, correggilo e rifai deploy.

2. **Reset e seed in produzione (se vuoi gli stessi dati del locale)**
   - Su **Vercel** copia il valore di `DATABASE_URL` (non incollarlo in chat).
   - In locale, in un terminale (solo per il tempo del comando):
     - Imposta `DATABASE_URL` con l’URL di **produzione** (quello di Vercel).
     - Esegui:  
       `npx tsx scripts/hard-reset-and-seed.ts`  
   - In questo modo cancelli tutti gli eventi (e dati collegati) nel DB di produzione e inserisci il singolo mercato di test. **Attenzione:** è distruttivo; fallo solo se vuoi che in prod ci sia solo quel mercato.

3. **Migrations**
   - Se in produzione non hai mai eseguito le migrazioni Prisma sul DB usato da Vercel, dalla tua macchina con `DATABASE_URL` puntato al DB di prod esegui:  
     `npx prisma migrate deploy`  
     (oppure `npx prisma db push` se usi push invece di migrate).  
   - Lo script di reset presuppone che lo schema sia già aggiornato (campi LMSR, ecc.).

4. **Redeploy su Vercel**
   - Dopo aver modificato le env (es. NEXTAUTH_URL), fai **Redeploy** dell’ultimo deployment da dashboard Vercel, così la build usa le variabili aggiornate.

5. **Verifica versione in produzione**
   - Apri `https://TUO_DOMAIN.vercel.app/api/version`.  
   - Controlla che `env` sia `"production"` e che `commit` corrisponda al commit deployato (su Vercel è impostato da `VERCEL_GIT_COMMIT_SHA`).  
   - Confronta con locale: `http://localhost:3000/api/version` (dovrebbe avere `env: "local"` e spesso `commit: "dev"` se non in build Vercel).

---

## 5) COME VERIFICARE CHE TUTTO SIA A POSTO

### In locale
1. Avvia l’app: `npm run dev`.
2. Apri `http://localhost:3000/api/health`: deve restituire `dbConnected: true` e `markets_count: 1` (dopo il reset eseguito in questa sessione).
3. Apri `http://localhost:3000/api/events?status=open&limit=5`: deve esserci un evento con titolo tipo `[DEBUG] Mercato binario YES/NO — Hard reset seed`.
4. Apri `http://localhost:3000/api/events/<id>/price` (stesso `id` dell’evento): `probability` deve essere 50 (numero, non NaN).
5. In UI: home (e Discover) devono mostrare quell’evento; con `?debug=1` in home vedi commit, env, `markets_count` e endpoint.

### In produzione
1. Apri `https://TUO_DOMAIN.vercel.app/api/health`: stesso controllo (dbConnected, markets_count).
2. Apri `https://TUO_DOMAIN.vercel.app/api/version`: verifica `env: "production"` e commit.
3. Se hai eseguito lo script con `DATABASE_URL` di produzione, `markets_count` sarà 1 e `GET /api/events` mostrerà lo stesso mercato di test; altrimenti vedrai quanti eventi ha ancora il DB di prod (anche 0 se non hai mai fatto seed lì).

---

**Riepilogo:** Il codice nuovo (LMSR, validator, lifecycle) è in uso. Il problema era la **combinazione di molti eventi legacy nel DB e possibile cache**. Reset + seed + invalidazione cache in locale dimostrano il golden path: 1 mercato binario in DB → visibile in API → prezzo LMSR 50% → visibile in UI. Per la produzione ripeti lo script con il `DATABASE_URL` di prod (se vuoi lo stesso stato) e controlla env/deploy come sopra.
