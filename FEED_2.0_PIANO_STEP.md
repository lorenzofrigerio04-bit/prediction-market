# Feed 2.0 – Piano di esecuzione per step (chat separate)

Questo documento definisce **step in ordine sequenziale**. Ogni step si esegue in una chat dedicata: prima si **discute** il topic, poi si **implementa**. All'inizio di ogni chat puoi dire: *"Esegui Step N del piano Feed 2.0"* e incollare la sezione dello step. Cursor avrà il contesto su cosa è già stato fatto e cosa verrà dopo.

**Ordine di esecuzione:** Step 1 → 2 → 3 → 4 → 5 → 6 → 7 → 8 → 9 → 10 → 11 (solo in questo ordine).

---

# Step 1 – Modello dati Post e dove salvare like/commenti

**Stato:** [ ] Da eseguire

## Cosa è già stato fatto (step precedenti)
- Nessuno: è il primo step. La codebase attuale ha `Event`, `Comment`, `User`, `EventFollower`; non esiste ancora il concetto di "post nel feed".

## Obiettivo di questo step
Introdurre nel database l'entità **Post**: ogni post nel feed è un "blocco" collegato a un evento e a un utente, con tipo (slide o immagine AI) e testo opzionale. Decidere dove salvare like e commenti (sul post vs sull'evento).

## Discussione (cosa decidere in chat prima di implementare)
1. **Campi del modello Post:** `id`, `userId`, `eventId`, `content` (testo opzionale), `type` (enum: `SLIDE` | `AI_IMAGE`), `aiImageUrl` (opzionale), `source` (enum: `CREATED_BY_ME` | `REPOST` | `BOT`), `createdAt`. Servono altri campi (es. `updatedAt`, `hidden`)?
2. **Like e commenti:** I like e i commenti sotto un post nel feed devono essere **sul post** (nuove tabelle `PostLike`, `PostComment`) oppure si **riusano** i commenti sull'evento (stessa tabella `Comment` con `eventId`) e sotto il post si mostrano solo i commenti di quell'evento? La scelta influenza notifiche ("qualcuno ha commentato il tuo post") e statistiche.
3. **Relazioni Prisma:** Post → User, Post → Event. Se like/commenti sono sul post: Post → PostLike[], Post → PostComment[] (e User, Comment come oggi per PostComment).

## Implementazione (cosa fare)
- [ ] Aggiungere in `prisma/schema.prisma` il modello `Post` con i campi concordati.
- [ ] Se si scelgono like/commenti sul post: aggiungere `PostLike` e `PostComment` (o equivalente) e relazioni su `User` e `Post`.
- [ ] Eseguire `npx prisma migrate dev` con un nome tipo `add_post_model`.
- [ ] Verificare che `npx prisma generate` funzioni e che non ci siano riferimenti a `Post` in altri file ancora (non servono in questo step).

## Cosa faranno gli step successivi
- **Step 2** userà il modello `Post` per costruire l'API `GET /api/feed/posts` che restituisce la lista di post.
- **Step 6** (pubblicazione utenti) e **Step 10** (bot) creeranno record in `Post` tramite `POST /api/posts` e logica bot.
- **Step 7** implementerà like/commenti sui post usando le tabelle scelte qui (PostLike / PostComment o riuso Comment).

## File coinvolti
- `prisma/schema.prisma`

---

# Step 2 – API del feed (lista post paginata)

**Stato:** [ ] Da eseguire

## Cosa è già stato fatto (step precedenti)
- **Step 1:** Esiste il modello `Post` (e eventualmente `PostLike`, `PostComment`). Migrazione applicata.

## Obiettivo di questo step
Creare l'endpoint **GET** che restituisce la lista di post per il feed: paginazione (limit/offset o cursor), ordinamento per data, e tutti i campi necessari alla UI (post + user + event + conteggi like/commenti).

## Discussione (cosa decidere in chat prima di implementare)
1. **Path dell'API:** `GET /api/feed/posts` oppure `GET /api/feed`? Query params: `limit` (default es. 10), `offset` (default 0) oppure `cursor` per paginazione cursor-based?
2. **Campi in risposta:** Per ogni post: id, type, content, aiImageUrl, createdAt, source; user (id, name, image); event (id, title, category, closesAt, probability, …); conteggi (likeCount, commentCount). Servono altri campi (es. `isLikedByCurrentUser`)?
3. **Filtri opzionali (ora o in seguito):** Solo eventi seguiti dall'utente (`?followedOnly=true`), solo categoria (`?category=...`). Si possono lasciare per dopo se si vuole minimizzare lo scope.

## Implementazione (cosa fare)
- [ ] Creare la route (es. `app/api/feed/posts/route.ts`) con `GET` che legge `limit` e `offset` dalla query.
- [ ] Query Prisma: `findMany` su `Post` con `orderBy: { createdAt: 'desc' }`, `include` di `user` (select id, name, image), `event` (campi necessari alla card), e conteggi (es. `_count` su PostLike e PostComment se esistono, altrimenti adattare).
- [ ] Restituire JSON: `{ posts: [...], hasMore: boolean }` (o `nextOffset`). Gestire lista vuota.
- [ ] (Opzionale) Se l'utente è loggato, includere per ogni post se è stato messo like dall'utente corrente (`isLikedByCurrentUser`).

## Cosa faranno gli step successivi
- **Step 3** farà sì che la pagina feed chiami questa API e mostri i post.
- **Step 4** userà i campi `post.type`, `post.event`, `post.aiImageUrl` ecc. per renderizzare le due tipologie di card.

## File coinvolti
- `app/api/feed/posts/route.ts` (nuovo)

---

# Step 3 – Pagina feed unica (sostituire tab Consigliati/Seguiti)

**Stato:** [ ] Da eseguire

## Cosa è già stato fatto (step precedenti)
- **Step 1:** Modello `Post` (e eventuali PostLike/PostComment) in Prisma.
- **Step 2:** API `GET /api/feed/posts` funzionante e restituisce lista di post con user ed event.

## Obiettivo di questo step
Avere **una sola pagina a scroll verticale** per il feed eventi: niente più tab "Per te" / "Seguiti" separati. La pagina chiama l'API del feed e mostra un elenco di "blocchi" (ogni blocco sarà una card slide o card immagine, implementata nello Step 4). Per ora si può mostrare un placeholder per ogni post (es. rettangolo con titolo evento e tipo) per verificare scroll e caricamento.

## Discussione (cosa decidere in chat prima di implementare)
1. **Route:** Il feed 2.0 deve vivere su `/discover` (sostituendo l'attuale contenuto con tab) oppure su una nuova route (es. `/feed`)? Se resta `/discover`, cosa succede al link "Eventi" nella nav?
2. **Cosa togliere:** Tab "Per te" / "Seguiti" su `app/discover/page.tsx`; il componente `ConsigliatiFeed` full-screen e `EventiPrevistiTab` come contenuto principale. La pagina `app/discover/consigliati/page.tsx` (lista a griglia): eliminarla e reindirizzare a `/discover`, oppure mantenerla come "solo eventi in griglia" secondaria?
3. **Link "passa alla visione generale" / "visione verticale":** Aggiornarli per puntare al nuovo feed unico (o rimuoverli se non servono più).

## Implementazione (cosa fare)
- [ ] Modificare `app/discover/page.tsx`: rimuovere la logica a tab (Per te / Seguiti) e il rendering condizionale di `ConsigliatiFeed` vs `EventiPrevistiTab`. Sostituire con un unico contenitore a scroll che:
  - All'mount chiama `GET /api/feed/posts?limit=10&offset=0`.
  - Mostra loading / errore / lista vuota.
  - Per ogni post nell'array, per ora renderizza un blocco placeholder (es. `<div>` con `post.event.title` e `post.type`) in modo che si veda lo scroll e l'ordine.
- [ ] Decidere e applicare: eliminazione o redirect di `app/discover/consigliati/page.tsx`; aggiornamento link in `app/page.tsx`, `SideDrawer`, e strip "passa alla visione…" se presenti.
- [ ] (Opzionale) Preparare un'area per infinite scroll: sentinel in fondo alla lista e caricamento `offset = posts.length` quando il sentinel entra in viewport (l'implementazione piena può essere raffinata nello Step 4).

## Cosa faranno gli step successivi
- **Step 4** sostituirà il placeholder di ogni post con le due card vere: `FeedCardSlide` e `FeedCardAIImage`, in base a `post.type`.

## File coinvolti
- `app/discover/page.tsx`
- `app/discover/consigliati/page.tsx` (eliminazione o redirect)
- `app/page.tsx` (link a discover/feed)
- `components/SideDrawer.tsx` (link se presenti)
- `app/globals.css` (eventuali classi da tenere per il nuovo layout)

---

# Step 4 – Due tipi di card nel feed (slide e card con immagine)

**Stato:** [ ] Da eseguire

## Cosa è già stato fatto (step precedenti)
- **Step 1:** Modello `Post` con `type` (SLIDE | AI_IMAGE), `aiImageUrl`, relazione con Event e User.
- **Step 2:** API feed che restituisce post con event e user.
- **Step 3:** Pagina feed unica che chiama l'API e mostra una lista di post (placeholder).

## Obiettivo di questo step
Implementare le **due varianti di card** nel feed: (1) **slide** – stesso aspetto della slide attuale "consigliati" ma con like/commenti/condividi/segui **sotto** la slide; (2) **card con immagine AI** – immagine in alto (o placeholder se `aiImageUrl` null), poi titolo evento, eventuale commento, link "Vai all'evento", poi barra azioni sotto. Il contenitore feed per ogni post sceglie quale card mostrare in base a `post.type`.

## Discussione (cosa decidere in chat prima di implementare)
1. **Riuso layout slide:** Il layout di `ConsigliatiSlide` in `components/discover/ConsigliatiFeed.tsx` va estratto in un componente riutilizzabile (es. `FeedCardSlide`) che riceve `post` + `event` e non gestisce più le azioni sulla slide ma solo la parte visiva; le azioni stanno in un blocco sotto. Confermare che le azioni sotto siano le stesse per entrambe le card (like, commenti, ripubblica, segui, condividi).
2. **Altezza card:** La slide può restare "quasi" full-viewport; la card immagine può essere una card alta ma non obbligatoriamente full-viewport, per variare il ritmo.
3. **Placeholder per AI_IMAGE senza immagine:** Se `aiImageUrl` è null (generazione non ancora fatta o fallita), mostrare un'immagine placeholder (grigio, icona, o immagine categoria evento) nella card immagine.

## Implementazione (cosa fare)
- [ ] Creare `components/feed/FeedCardSlide.tsx`: riceve `post` e `event` (e eventualmente `likeCount`, `commentCount`, `isLiked`); renderizza il layout della slide (sfondo, titolo, categoria, barra Sì/No) riusando stili/logica da `ConsigliatiSlide`; sotto la slide renderizza la barra azioni (icone like, commenti, ripubblica, segui, condividi). I pulsanti possono essere solo UI per ora (nessuna chiamata API nello Step 4 se preferisci, oppure già collegate alle API che verranno nello Step 7).
- [ ] Creare `components/feed/FeedCardAIImage.tsx`: in alto immagine (`post.aiImageUrl` o placeholder), sotto titolo evento, `post.content` se presente, link "Vai all'evento" a `/events/[eventId]`, stessa barra azioni sotto.
- [ ] Creare `components/feed/FeedPostCard.tsx` (o equivalente): in base a `post.type` renderizza `FeedCardSlide` o `FeedCardAIImage`. Usato dalla pagina feed.
- [ ] In `app/discover/page.tsx` (o dove si renderizza la lista): sostituire il placeholder di ogni post con `<FeedPostCard post={post} />` (o passando i dati nel formato usato dai componenti).
- [ ] Estrarre/duplicare gli stili necessari da `ConsigliatiFeed`/`globals.css` per le nuove card e la barra azioni, in modo che il feed non dipenda più dal vecchio layout full-screen con azioni sulla slide.

## Cosa faranno gli step successivi
- **Step 7** collegherà la barra azioni (like, commenti, ripubblica, segui, condividi) alle API e allo stato (PostLike, PostComment o evento).
- **Step 6** (pubblicazione) e **Step 10** (bot) popoleranno il feed con post; **Step 9** (immagini AI) fornirà `aiImageUrl` per le card tipo AI_IMAGE.

## File coinvolti
- `components/feed/FeedCardSlide.tsx` (nuovo)
- `components/feed/FeedCardAIImage.tsx` (nuovo)
- `components/feed/FeedPostCard.tsx` (nuovo)
- `components/discover/ConsigliatiFeed.tsx` (estrazione logica/JSX per la slide, se utile)
- `app/discover/page.tsx` (uso di FeedPostCard)
- `app/globals.css` (eventuali nuove classi per card feed)

---

# Step 5 – Regole "quando slide vs quando immagine"

**Stato:** [ ] Da eseguire

## Cosa è già stato fatto (step precedenti)
- **Step 1–4:** Post in DB, API feed, pagina unica, due card (slide e card immagine) renderizzate in base a `post.type`.

## Obiettivo di questo step
Definire e implementare la **logica** che, alla creazione di un post, assegna `type = SLIDE` oppure `type = AI_IMAGE`. La regola può dipendere da: presenza di commento dell'utente, "adattabilità" della notizia a un'immagine, o mix. Nessuna UI nuova: solo logica lato server (usata dall'API di creazione post e dai bot).

## Discussione (cosa decidere in chat prima di implementare)
1. **Regola scelta:** (A) Con commento personale → AI_IMAGE, senza → SLIDE. (B) Solo se la notizia è "adattabile" (es. titolo/descrizione adatti a una foto) → AI_IMAGE. (C) Mix: AI_IMAGE solo se c'è commento **e** notizia adatta; altrimenti SLIDE. (D) Percentuale fissa: es. 30% dei post con commento sono AI_IMAGE, resto SLIDE.
2. **Dove vive la regola:** Funzione pura (es. `getPostType(event, content, source)`) in un modulo condiviso (es. `lib/feed/post-type.ts`) chiamata da `POST /api/posts` e da `runSimulatedPosts` (Step 10).
3. **Generazione immagine:** Se type = AI_IMAGE, chi crea il post (API o bot) deve solo salvare il post con `aiImageUrl = null` e mettere in coda la generazione (Step 9). In questo step si implementa solo l'assegnazione di `type`; la coda/trigger per l'immagine si fa nello Step 9.

## Implementazione (cosa fare)
- [ ] Creare modulo (es. `lib/feed/post-type.ts`) con funzione che, dati `event` (o titolo/categoria/descrizione), `content` (commento), `source`, restituisce `'SLIDE' | 'AI_IMAGE'` secondo la regola concordata.
- [ ] Se si usa "adattabilità": implementare uno scorer semplice (es. lista categorie o parole chiave "adatte", o lunghezza titolo) oppure lasciare stub che per ora restituisce sempre SLIDE per "non adatto".
- [ ] Documentare la regola in un commento nel modulo o in un breve doc, così Step 6 e Step 10 sanno quando chiamarla (alla creazione del post).

## Cosa faranno gli step successivi
- **Step 6** (pubblicazione utenti): quando l'utente crea un post, chiamerà questa logica per impostare `post.type` prima di salvare; se type è AI_IMAGE, si potrà mettere in coda la generazione immagine (Step 9).
- **Step 10** (bot): stessa logica per i post creati dai bot.
- **Step 9** implementerà la generazione effettiva dell'immagine e l'aggiornamento di `Post.aiImageUrl`.

## File coinvolti
- `lib/feed/post-type.ts` (nuovo) o equivalente

---

# Step 6 – Pubblicazione e ripubblicazione da utenti reali

**Stato:** [ ] Da eseguire

## Cosa è già stato fatto (step precedenti)
- **Step 1:** Modello Post (e relazioni).
- **Step 2–4:** API feed, pagina unica, due card.
- **Step 5:** Logica che assegna `post.type` (SLIDE vs AI_IMAGE) alla creazione.

## Obiettivo di questo step
Permettere agli **utenti** di: (1) pubblicare un post con evento + eventuale commento, (2) pubblicare il proprio evento nel feed, (3) ripubblicare un evento (con o senza commento). Implementare `POST /api/posts` e i pulsanti/modal in UI.

## Discussione (cosa decidere in chat prima di implementare)
1. **Body API:** `POST /api/posts` con body `{ eventId, content?, source? }`. `source` opzionale: se assente si considera CREATED_BY_ME; per "ripubblica" il frontend può inviare REPOST. Confermare se serve altro (es. flag "pubblico proprio evento").
2. **Flussi UI:** Dove appare "Pubblica nel feed"? (Dettaglio evento `/events/[id]`, dentro le card del feed, nella lista "I tuoi eventi".) "Ripubblica" solo dalla card evento nel feed o anche dalla pagina evento?
3. **Modal commento:** Per "Pubblica con commento" si apre un modal per scrivere il testo prima di inviare; per "Ripubblica" senza commento si invia subito. Confermare comportamento.

## Implementazione (cosa fare)
- [ ] Creare `app/api/posts/route.ts`: metodo POST, verifica sessione, legge `eventId` (obbligatorio), `content` (opzionale), `source` (opzionale). Verifica che l'evento esista. Chiama la logica Step 5 per ottenere `type`; crea record `Post` con userId dalla sessione, eventId, content, type, source, aiImageUrl = null se type = AI_IMAGE. Restituisce il post creato (e, se type = AI_IMAGE, si può già prevedere una chiamata a "coda generazione immagine" che sarà implementata nello Step 9; per ora si può solo loggare o lasciare stub).
- [ ] Aggiungere in UI: pulsante "Pubblica nel feed" (o "Ripubblica") dove concordato (es. pagina evento, card feed). All'click: se con commento, aprire modal con textarea e invio a POST /api/posts; altrimenti invio diretto. Dopo successo: refresh lista feed o redirect al feed con messaggio di conferma.
- [ ] Link "Pubblica nel feed" da "I tuoi eventi" (se presente nella app) che apre modal con scelta evento o passa eventId se già in contesto.

## Cosa faranno gli step successivi
- **Step 7** collegherà like/commenti/segui nella barra sotto le card (anche per i post creati qui).
- **Step 9** completerà la generazione immagine per i post con type AI_IMAGE creati da utenti (e da bot nello Step 10).

## File coinvolti
- `app/api/posts/route.ts` (nuovo)
- `app/events/[id]/page.tsx` (pulsante Pubblica/Ripubblica)
- `components/feed/FeedCardSlide.tsx`, `FeedCardAIImage.tsx` (pulsante Ripubblica)
- Componente modal per commento (nuovo o esistente)

---

# Step 7 – Like, commenti e altre azioni sui post

**Stato:** [ ] Da eseguire

## Cosa è già stato fatto (step precedenti)
- **Step 1:** Modello Post; se si sono scelti like/commenti "sul post", esistono PostLike e PostComment (o equivalente).
- **Step 2:** API feed che può già restituire likeCount, commentCount, isLikedByCurrentUser se implementati.
- **Step 4:** Barra azioni sotto ogni card (like, commenti, ripubblica, segui, condividi) – possibilmente solo UI.
- **Step 6:** Creazione post da utenti.

## Obiettivo di questo step
Rendere **funzionanti** le azioni sotto ogni post: like (toggle), commenti (lista/drawer e invio nuovo commento), ripubblica (già crea post – Step 6), segui evento, condividi. Salvare i dati nelle tabelle scelte nello Step 1 e aggiornare i conteggi in UI (e opzionalmente notifiche per like/commento sul post).

## Discussione (cosa decidere in chat prima di implementare)
1. **Like:** Endpoint `POST /api/posts/[id]/like` (toggle): se l'utente non ha like → crea PostLike; se già like → rimuove. Response con nuovo likeCount e isLiked. Frontend: ottimistic update opzionale.
2. **Commenti:** Se i commenti sono sul post (PostComment): `GET /api/posts/[id]/comments` e `POST /api/posts/[id]/comments`. Se invece si riusano i commenti sull'evento: sotto il post si mostrano i commenti dell'evento (GET già esistente per eventId); "aggiungi commento" può usare l'API commenti evento esistente. In quel caso il "commento sotto il post" è semanticamente "commento sull'evento" e le notifiche restano su evento (o si estendono con "questo commento è stato scritto da qualcuno che ha visto il post" – opzionale).
3. **Segui evento:** Riuso dell'API esistente `POST /api/events/[eventId]/follow` (toggle). La card ha già eventId, quindi il pulsante "Segui" chiama quella API.
4. **Condividi:** Copia link alla pagina evento (o al post, se in futuro ci sarà deep link al post) negli appunti; toast "Link copiato".

## Implementazione (cosa fare)
- [ ] Implementare `POST /api/posts/[id]/like` (e eventuale GET per stato) se like sono sul post; altrimenti chiarire dove si salvano i like (es. su evento) e adattare. Collegare il pulsante like nelle card alla API e aggiornare likeCount / isLiked.
- [ ] Commenti: se PostComment, creare GET e POST per `app/api/posts/[id]/comments/`; se si riusano commenti evento, sotto la card usare l'API commenti per `eventId` e collegare il pulsante "Commenti" (es. apre drawer con CommentsSection per quell'evento). Aggiornare commentCount dopo invio.
- [ ] Collegare "Segui" alla API follow evento esistente; "Condividi" a copy-to-clipboard + feedback.
- [ ] (Opzionale) Notifiche: quando un utente riceve like o commento sul proprio post, creare notifica (tipo POST_LIKE, POST_COMMENT) e mostrarla in NotificationBell. Estendere tipi in Notification e logica in API notifiche. Se si rimanda a Step 11, lasciare solo un TODO.

## Cosa faranno gli step successivi
- **Step 11** completerà notifiche e moderazione.
- **Step 8–10** non dipendono da Step 7 per il flusso dati, ma l'esperienza utente è completa dopo Step 7 (feed leggibile, pubblicabile, con like/commenti).

## File coinvolti
- `app/api/posts/[id]/like/route.ts` (nuovo se like sul post)
- `app/api/posts/[id]/comments/route.ts` (nuovo se commenti sul post)
- `components/feed/FeedCardSlide.tsx`, `FeedCardAIImage.tsx` (collegamento azioni alle API)
- Eventualmente `app/api/notifications/` e componente notifiche

---

# Step 8 – Analisi qualità-prezzo e scelta provider per immagini AI

**Stato:** [ ] Da eseguire

## Cosa è già stato fatto (step precedenti)
- **Step 1–7:** Feed completo: post, due card, pubblicazione, like/commenti. I post con type AI_IMAGE hanno ancora `aiImageUrl` null (nessuna generazione ancora).

## Obiettivo di questo step
Scegliere il **provider** per la generazione delle immagini (foto-descrittive da titolo/notizia): confronto qualità-prezzo e decisione. Output: documento breve con tabella e scelta; nessun codice obbligatorio (al massimo doc in repo).

## Discussione (cosa decidere in chat prima di implementare)
1. **Provider da confrontare:** OpenAI DALL·E 3, Stability AI (Stable Diffusion), Replicate (modelli SD/Midjourney), altri (Google Imagen, etc.). Per ognuno: costo per immagine, qualità visiva, aderenza al prompt, latenza, limiti d'uso.
2. **Criteri:** "Rapporto qualità-prezzo migliore" per uso "notizie/eventi": immagini sobrie, foto-realistiche o illustrative, senza testo nell'immagine.
3. **Output:** Tabella (provider, costo/immagine, qualità 1–5, note) e scelta finale (es. "per MVP usare X").

## Implementazione (cosa fare)
- [ ] Redigere documento (es. `docs/ai-image-providers.md` o sezione in README) con tabella e raccomandazione. Se si vuole, aggiungere note su: dove si invocherà il servizio (API route vs job), formato prompt, dove si salverà l'immagine (Vercel Blob, S3, ecc.) per lo Step 9.

## Cosa faranno gli step successivi
- **Step 9** implementerà la generazione usando il provider scelto qui: chiamata API, salvataggio file, aggiornamento `Post.aiImageUrl` (e eventuale coda/job).

## File coinvolti
- `docs/ai-image-providers.md` (nuovo) o README

---

# Step 9 – Sistema di generazione immagini AI (implementazione)

**Stato:** [ ] Da eseguire

## Cosa è già stato fatto (step precedenti)
- **Step 1:** Post con `aiImageUrl` e `type` AI_IMAGE.
- **Step 5:** Assegnazione type alla creazione; se AI_IMAGE, post creato con aiImageUrl null.
- **Step 6 e 10:** Creazione post (utenti e bot) che possono avere type AI_IMAGE.
- **Step 8:** Provider scelto e documentato (DALL·E, Replicate, ecc.).

## Obiettivo di questo step
Implementare il **flusso** che genera l'immagine a partire da un post con type AI_IMAGE: costruzione prompt da evento (titolo, categoria, descrizione), chiamata al provider, salvataggio dell'immagine su storage, aggiornamento `Post.aiImageUrl`. Preferibile esecuzione in background (job/coda) per non bloccare la creazione del post.

## Discussione (cosa decidere in chat prima di implementare)
1. **Trigger:** Alla creazione del post (in `POST /api/posts` o nel job bot) se type = AI_IMAGE si mette in coda un "lavoro" (postId). Il job può essere: API route chiamata in background (es. `fetch('/api/ai/generate-event-image', { body: { postId } })` senza await), oppure cron che cerca post con type AI_IMAGE e aiImageUrl null e li processa.
2. **Storage:** Dove salvare l'immagine (Vercel Blob, S3, altro) e come ottenere URL pubblico. Variabili d'ambiente per API key provider e storage.
3. **Prompt:** Template del prompt (es. "Immagine foto-realistica che rappresenta questa notizia: [titolo]. Categoria: [categoria]. Stile sobrio, nessun testo nell'immagine."). Eventualmente sanitizzare titolo/descrizione per evitare prompt injection.
4. **Errori:** Se generazione fallisce: lasciare aiImageUrl null e loggare; in UI la card immagine mostra già placeholder (Step 4). Opzionale: retry o stato "generation_failed".

## Implementazione (cosa fare)
- [ ] Creare modulo (es. `lib/ai-image-generation/generate.ts`) che: riceve postId (o eventId + titolo/categoria); costruisce prompt; chiama il provider scelto nello Step 8; riceve immagine (URL o binary); la carica sullo storage scelto; aggiorna `Post` con `aiImageUrl` e opzionalmente un flag "ready".
- [ ] Creare entry point per il job: es. `POST /api/ai/generate-event-image` (body: postId) che chiama il modulo e restituisce esito; oppure script `scripts/generate-post-images.ts` da eseguire via cron. Se si usa API route, da `POST /api/posts` (dopo aver creato il post) invocare in background questa route con il nuovo postId (senza attendere la risposta).
- [ ] Configurare variabili d'ambiente (API key provider, chiavi storage) e documentare in README o .env.example.

## Cosa faranno gli step successivi
- **Step 10** (bot): quando un bot crea un post con type AI_IMAGE, lo stesso meccanismo di coda/job genererà l'immagine. Nessuna modifica aggiuntiva se il job processa tutti i post con aiImageUrl null e type AI_IMAGE.

## File coinvolti
- `lib/ai-image-generation/` (nuovo: generate.ts, types, config)
- `app/api/ai/generate-event-image/route.ts` (nuovo) o script equivalente
- `app/api/posts/route.ts` (chiamata in background dopo creazione post AI_IMAGE)
- `.env.example` o README (variabili)

---

# Step 10 – Bot 2.0: post e commenti credibili

**Stato:** [ ] Da eseguire

## Cosa è già stato fatto (step precedenti)
- **Step 1:** Modello Post; bot già esistenti (User con role BOT) e attività simulata (previsioni, commenti su eventi, reazioni, follow).
- **Step 5:** Regola slide vs AI_IMAGE.
- **Step 6:** API `POST /api/posts` per creare post.
- **Step 7:** Like/commenti sui post.
- **Step 9:** Generazione immagini AI in background per post con type AI_IMAGE.

## Obiettivo di questo step
Estendere i **bot** perché: (1) creino **post** nel feed (slide e con commento/AI_IMAGE), in modo distribuito e credibile; (2) scrivano **commenti contestuali e vari** (seri vs leggeri/ironici) sulle notizie, non frasi generiche. L'attività deve sembrare reale, non palesemente finta.

## Discussione (cosa decidere in chat prima di implementare)
1. **Post da bot:** Quanti post per run (es. 2–5)? Scelta eventi: aperti, recenti o in tendenza; distribuzione temporale (non tutti insieme). Per ogni post: usare la stessa logica Step 5 per type (slide vs AI_IMAGE); se AI_IMAGE, il job Step 9 genererà l'immagine. Contenuto commento: generato da LLM (titolo evento + categoria + "persona" bot) o da template migliorati?
2. **Commenti "super opportuni":** Oggi i bot usano `comment-templates.ts` (frasi generiche). Obiettivo: commenti che riferiscono alla **notizia specifica** e con **tono vario** (formale/serio vs leggero/ironico, es. partita di calcio). Opzioni: (a) LLM con prompt "genera un commento breve su questa notizia, tono [serio/leggero]"; (b) template per categoria + variante "persona" (serio/leggero). Fallback a template se LLM non disponibile.
3. **Personalità bot:** Assegnare a ogni bot un "tipo" (es. formale, sarcastico, sportivo) e usarlo nel prompt per commenti/post. Dove salvare: campo su User (es. `personality`) o mappa in codice (botId → personality).
4. **Runner:** In `lib/simulated-activity/runner.ts` aggiungere `runSimulatedPosts`: crea N post (chiamando logica Step 5 e creando record Post come fa POST /api/posts, ma a nome di un bot). Integrare nel risultato di runSimulatedActivity (post created, errors).

## Implementazione (cosa fare)
- [ ] Creare `lib/simulated-activity/posts.ts` (o simile): funzione `runSimulatedPosts(prisma, botUserIds)` che sceglie eventi aperti (es. recenti o in tendenza), per ognuno sceglie un bot, decide se con commento (e tipo da Step 5), genera testo commento (LLM o template); crea Post con source BOT. Se type AI_IMAGE, il job Step 9 processerà il post.
- [ ] Migliorare commenti bot: nuovo modulo o estensione di `comment-templates.ts` per commenti contestuali (LLM con titolo evento + persona) o template più ricchi; integrare in `runSimulatedComments` esistente.
- [ ] (Opzionale) Aggiungere "personality" ai bot (campo User o mappa) e usarlo nel prompt LLM per post e commenti.
- [ ] In `runner.ts` chiamare `runSimulatedPosts` e includere il risultato in `RunSimulatedActivityResult`. Aggiornare `app/api/admin/run-simulated-activity/route.ts` se necessario (già restituisce result del runner).

## Cosa faranno gli step successivi
- **Step 11** (notifiche e moderazione): policy per moderare contenuti bot e immagini AI; notifiche per like/commenti sui post sono già parzialmente coperte dallo Step 7.

## File coinvolti
- `lib/simulated-activity/posts.ts` (nuovo)
- `lib/simulated-activity/comment-templates.ts` o nuovo modulo per commenti LLM/template contestuali
- `lib/simulated-activity/runner.ts`
- `lib/simulated-activity/bot-users.ts` (se si aggiunge personality)
- `app/api/admin/run-simulated-activity/route.ts` (se serve esporre nuovi campi)

---

# Step 11 – Notifiche e moderazione

**Stato:** [ ] Da eseguire

## Cosa è già stato fatto (step precedenti)
- **Step 1–10:** Feed completo: post, card, API, pubblicazione utenti e bot, like/commenti, immagini AI, bot che creano post e commenti credibili.

## Obiettivo di questo step
Completare le **notifiche** legate ai post (se non già coperte nello Step 7) e definire una **policy di moderazione** per contenuti bot e immagini AI (filtrati, coda revisione, segnalazioni). Implementazione può essere minima (solo doc policy + estensione tipi notifica) o più completa (pannello admin, segnalazioni).

## Discussione (cosa decidere in chat prima di implementare)
1. **Notifiche:** Quali eventi devono generare notifica: "qualcuno ha commentato il tuo post", "qualcuno ha messo like al tuo post", "qualcuno ha ripubblicato un evento che hai pubblicato tu". Tipi in `Notification.type` (es. POST_COMMENT, POST_LIKE, POST_REPOST). Link dalla notifica al post (es. `/discover?postId=...` o deep link).
2. **Moderazione:** (1) Filtri automatici (parole, policy del provider immagini). (2) Coda di revisione per post bot o immagini AI prima di mostrare in feed. (3) Segnalazione utenti e nascondimento post. Decidere cosa implementare subito (es. solo doc policy) e cosa rimandare.

## Implementazione (cosa fare)
- [ ] Estendere `Notification.type` e logica in `app/api/notifications` (o dove si creano le notifiche) per POST_COMMENT, POST_LIKE, POST_REPOST. Creare notifica quando un utente commenta/mette like/ripubblica su un post di un altro utente. Link nel payload alla pagina post/evento.
- [ ] Verificare che NotificationBell e dropdown mostrino i nuovi tipi con messaggio e link corretti.
- [ ] Redigere documento (es. `docs/moderation-policy-feed.md`) con policy: cosa si fa con contenuti inappropriati da bot o da immagini AI; filtri, revisione manuale, segnalazioni. Se si implementa coda revisione o pannello segnalazioni, descriverlo qui e implementare il minimo (es. flag `post.hidden` e filtro in GET feed).

## Cosa faranno gli step successivi
- Nessuno: Step 11 conclude il piano Feed 2.0. Eventuali estensioni (ranking feed, filtri avanzati, deep link post) sono fuori da questo piano.

## File coinvolti
- `prisma/schema.prisma` (Notification.type o payload)
- `app/api/notifications/` e logica creazione notifiche
- `components/notifications/NotificationBell.tsx` (messaggi per nuovi tipi)
- `docs/moderation-policy-feed.md` (nuovo)
- (Opzionale) Admin: pannello segnalazioni, campo `post.hidden` e filtro in GET feed

---

# Riepilogo ordine di esecuzione

| Step | Nome breve | Dipende da |
|------|------------|-------------|
| 1 | Modello dati Post | - |
| 2 | API feed | 1 |
| 3 | Pagina feed unica | 1, 2 |
| 4 | Due tipi di card | 1, 2, 3 |
| 5 | Regole slide vs immagine | 1 |
| 6 | Pubblicazione utenti | 1, 5 |
| 7 | Like e azioni sui post | 1, 2, 4, 6 |
| 8 | Analisi provider immagini | - (parallelo possibile) |
| 9 | Generazione immagini AI | 1, 5, 8 |
| 10 | Bot 2.0 | 1, 5, 6, 9 |
| 11 | Notifiche e moderazione | 7, 10 |

**Come usare in chat:** Apri una nuova chat, incolla la sezione dello step (da "# Step N" fino a "File coinvolti" incluso) e scrivi: *"Esegui questo step del piano Feed 2.0. Prima discutiamo le decisioni, poi implementiamo."* Dopo il completamento, passa allo step successivo nella prossima chat usando la sezione del nuovo step.
