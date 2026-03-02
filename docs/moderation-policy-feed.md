# Policy di moderazione – Feed 2.0

Questo documento descrive la policy di moderazione per i contenuti del feed (post, like, commenti sui post) e come si integra con il sistema esistente.

## Scope

- **Contenuti in scope:** Post del feed (pubblicazioni utente, ripubblicazioni, post da bot), immagini AI associate ai post, commenti sui post.
- **Obiettivo:** Mantenere il feed appropriato, rispettare le policy del provider di immagini AI e gestire segnalazioni in modo trasparente.

## Ruolo di `post.hidden`

- Il modello `Post` ha il campo **`hidden`** (boolean, default `false`).
- L’API del feed **GET /api/feed/posts** filtra i post con `where: { hidden: false }`, quindi i post nascosti **non compaiono** nel feed.
- Uso previsto: moderazione manuale (contenuti inappropriati), post segnalati e nascosti dopo revisione, o eventuale coda di revisione per post bot/AI.

## Filtri automatici (da definire / estendere)

1. **Testo (parole/frasi):** Una lista interna di parole o frasi da considerare inappropriati può essere usata per:
   - bloccare la pubblicazione di un post/commento, oppure
   - marcare il contenuto per revisione manuale (es. futuro campo `status: PENDING | APPROVED`).
   La lista e la logica sono da definire in fase di implementazione.

2. **Immagini AI:** Il contenuto generato dal provider di immagini AI è soggetto alle policy del provider. In caso di contenuti non conformi:
   - seguire le linee guida del provider (blocco generazione, report);
   - eventualmente impostare `post.hidden = true` per il post associato e registrare l’azione in AuditLog.

## Coda di revisione (opzionale, futura)

- Se si introduce una **coda di revisione** per post da bot o con immagini AI prima della pubblicazione in feed:
  - si può aggiungere un campo allo schema (es. `status: PENDING | APPROVED`) o riusare `hidden` (es. post in revisione = non mostrati fino ad approvazione).
  - Il flusso andrebbe descritto qui (chi approva, come si notifica, scadenza).
- Attualmente non è implementata; i post sono visibili nel feed finché `hidden` è `false`.

## Segnalazioni utenti

- **Come segnalare:** L’implementazione di un flusso di segnalazione (es. pulsante “Segnala” sulla card del post) è opzionale e da definire.
- **Cosa fa il team:** In caso di segnalazione o contenuto inappropriato:
  - **Nascondere il post:** impostare `post.hidden = true` (tramite pannello admin o endpoint dedicato).
  - **AuditLog:** registrare l’azione (es. `POST_HIDE`, `entityType: "post"`, `entityId`, motivazione opzionale).
  - Eventuale notifica o comunicazione all’autore del post può essere definita in seguito.

## Riferimento admin e API

- **Commenti (eventi):** Esiste già **PATCH /api/admin/comments/[id]** per nascondere commenti sugli eventi (`Comment`), con AuditLog (azione `COMMENT_HIDE`). Vedi `app/api/admin/comments/[id]/route.ts`.
- **Post (feed):** Un endpoint analogo per i post del feed (es. **PATCH /api/admin/posts/[id]** con body `{ hidden: true, reason?: string }`) non è ancora implementato. Quando verrà aggiunto, andrà usato per nascondere post dal feed e andrà documentato qui; la logica sarà coerente con `post.hidden` e il filtro in GET /api/feed/posts.

## Riepilogo

| Aspetto              | Stato attuale |
|----------------------|----------------|
| Campo `post.hidden`   | Presente; feed filtra già `hidden: false` |
| Filtri automatici    | Da definire (lista parole, policy provider AI) |
| Coda revisione       | Non implementata |
| Segnalazioni utenti  | Non implementate; policy descritta sopra |
| Admin: nascondere post | Endpoint dedicato non presente; da implementare in seguito |
