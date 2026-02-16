# Cosa fare per vedere i cambiamenti sul sito pubblico

Hai implementato backend (LMSR, feed, validator, ecc.) ma **il sito pubblico non è cambiato** perché:

1. **Le pagine non usano le nuove API**  
   Home e Discover continuano a chiamare `/api/events` (lista classica). L’endpoint **`/api/feed`** (feed personalizzato) esiste ma **nessuna pagina lo usa**.

2. **Il prezzo sembra uguale**  
   Con LMSR, se nessuno ha ancora scommesso su un evento, il prezzo è 50% Sì / 50% No (come prima). La differenza si vede **dopo** che qualcuno fa previsioni (il prezzo si muove con le scommesse).

3. **Deploy**  
   Se lavori in locale e non fai **deploy** (es. su Vercel), il sito “pubblico” che apri in produzione è ancora la versione vecchia.

---

## Verifica che il deploy sia davvero attivo

Dopo **push** e **deploy** su Vercel, per essere sicuro che il sito pubblico mostri il codice nuovo:

1. **Controlla il Build in fondo alla pagina**  
   In fondo a ogni pagina del sito c’è scritto **"Build xxxxxxx"** (es. `Build a0963b6`). Quel codice è l’hash del commit con cui è stato fatto il deploy.  
   - Dopo un **nuovo deploy**, l’hash deve **cambiare** (es. da `a0963b6` a `f3a2c91`).  
   - Se vedi ancora il **vecchio** hash → il browser sta mostrando una versione in cache o il deploy non è partito.  
   - In **locale** vedi sempre `Build dev`.

2. **Hard refresh per evitare la cache del browser**  
   - **Mac:** `Cmd + Shift + R`  
   - **Windows:** `Ctrl + F5`  
   Oppure apri il sito in una **finestra in incognito**.

3. **Controlla su Vercel che l’ultimo deploy sia "Ready"**  
   Vercel → tuo progetto → **Deployments** → l’ultimo deploy deve essere **Ready** (verde). Se è "Building" o "Error", il sito pubblico non è ancora aggiornato.

4. **Se il progetto non è collegato a Git**  
   Vercel non si aggiorna da solo. In quel caso fai un deploy a mano da terminale:  
   `npx vercel --prod`  
   (vedi sotto “Opzione A” in `DEPLOY_UI_UPDATE.md`.)

Quando vedi il **nuovo** hash "Build …" in fondo alla pagina, il sito pubblico sta servendo l’ultima versione.

---

## Cosa fare (in ordine)

### 1. Fare deploy

- Se usi **Vercel**: fai push su Git e aspetta che il deploy finisca, oppure “Redeploy” dall’area Vercel.
- Controlla che le **variabili d’ambiente** in produzione siano uguali a quelle che usi in locale (database, API key, ecc.).

Senza deploy, le modifiche restano solo sul tuo computer.

---

### 2. ~~Far usare il feed in homepage~~ (fatto)

- **Modifica applicata**: la homepage, quando sei loggato, ora chiama **`/api/feed`** per la sezione “Eventi in tendenza”. Se il feed fallisce, usa come fallback la lista classica `/api/events`.
- Così la home mostra i mercati in ordine **personalizzato** (trending + per te + esplorazione). Dopo il **deploy** lo vedrai in produzione.

---

### 3. Verificare che i nuovi eventi abbiano LMSR

- Gli eventi **nuovi** (creati da admin o dalla pipeline “Genera eventi”) hanno già `b`, `q_yes`, `q_no` (inizialmente 0). Va bene.
- Gli eventi **vecchi** (creati prima delle modifiche) hanno i default (`q_yes=0`, `q_no=0`, `b=100`): il prezzo parte da 50% e si aggiorna quando qualcuno scommette.

Non serve migrare gli eventi vecchi: funzionano già con il fallback (probabilità / LMSR).

---

### 4. Vedere la differenza del prezzo LMSR

- Apri un evento, fai una **previsione** (Sì o No con alcuni crediti).
- Ricarica la pagina: la percentuale Sì/No dovrebbe essere **cambiata** in base alle scommesse (LMSR), non più solo “crediti sì / crediti totali”.

Se dopo una scommessa il prezzo non si aggiorna, controlla che la pagina evento legga i campi `q_yes`, `q_no`, `b` dall’API e usi la funzione di prezzo LMSR (es. `getEventProbability` da `lib/pricing/price-display.ts`).

---

## Riepilogo

| Cosa vuoi vedere | Cosa fare |
|------------------|-----------|
| **Sito aggiornato** | Fare **deploy** (es. Vercel) e controllare variabili d’ambiente. |
| **Feed personalizzato** | Far usare **`/api/feed`** in homepage (e opzionalmente in Discover) per utenti loggati. |
| **Prezzo che si muove** | Fare almeno una previsione su un evento e ricaricare: il prezzo deve aggiornarsi (LMSR). |
| **Nuovi mercati “LMSR”** | Creare eventi da admin o con “Genera eventi”: hanno già `b` e LMSR. |

In sintesi: **deploy** + **homepage che chiama `/api/feed`** sono i due passi che fanno “cambiare” il sito pubblico; il resto (prezzo che si muove, nuovi eventi) lo vedi già con quello che hai implementato.
