# Provider per generazione immagini AI (feed eventi)

Documento di confronto qualità-prezzo e scelta del provider per lo **Step 8** del feed.  
Riferimento: [FEED_2.0_ESECUZIONE_STEP.md](FEED_2.0_ESECUZIONE_STEP.md) – Step 8 e Step 9.

---

## 1. Criteri di valutazione

- **Uso:** notizie/eventi nel feed (post con `type` AI_IMAGE; logica in `lib/feed/post-type.ts`).
- **Requisiti:** immagini **sobrie**, foto-realistiche o illustrative, **senza testo nell’immagine**.
- **Obiettivo:** miglior **rapporto qualità-prezzo** per l’MVP, con integrazione semplice e costi prevedibili.

---

## 2. Tabella confronto provider

Dati indicativi; verificare sempre i siti ufficiali prima di implementare (prezzi aggiornati a marzo 2025).

| Provider | Modello / prodotto | Costo/immagine | Qualità (1–5) | Latenza | Limiti / note |
| -------- | ------------------ | --------------- | ------------- | ------- | ------------- |
| **OpenAI** | Image Generation API (GPT-image-1, 1.5, 1.5-mini) | ~$0.01 (low) – ~$0.17 (high) per quadrata; tipico medium ~$0.04 | 5 | Media (secondi) | Ottima aderenza al prompt; “no text” rispettato; API stabile; [pricing](https://openai.com/api/pricing/) |
| **OpenAI** | GPT-image-1-mini | ~$0.01 (low) – ~$0.08 (high) | 4 | Più veloce | Stesso stack OpenAI; costo inferiore, qualità leggermente sotto 1.5 |
| **Replicate** | FLUX 1.1 Pro | $0.04 / output | 5 | Variabile | Pay-per-run; ottima qualità e prompt adherence; [modello](https://replicate.com/black-forest-labs/flux-1.1-pro) |
| **Replicate** | FLUX dev | $0.025 / output | 4 | Variabile | Buon rapporto qualità-prezzo; [modello](https://replicate.com/black-forest-labs/flux-dev) |
| **Replicate** | FLUX schnell | $3 / 1000 ≈ $0.003 / immagine | 3 | Molto veloce | Molto economico; qualità adatta a placeholder/anteprime |
| **Replicate** | Recraft V3 | $0.04 / output | 5 | Variabile | SOTA in alcuni benchmark; stili multipli; [modello](https://replicate.com/recraft-ai/recraft-v3) |
| **Replicate** | Stable Diffusion (time-based) | ~$0.002–0.01/run (dipende da HW/tempo) | 3–4 | Variabile | Modelli diversi su A100/T4; costo per run, non per immagine |
| **Stability AI** | API diretta (Stable Image Core / Ultra) | ~$0.03 – $0.08 / immagine | 4 | Media | Credit-based; [stability.ai](https://stability.ai/) |
| **Google** | Imagen (Vertex AI) | Da verificare su Google Cloud | 4–5 | Media | Enterprise; integrazione GCP; prezzi e quote da [cloud.google.com](https://cloud.google.com/) |

**Qualità (1–5):** 1 = scarsa, 5 = eccellente; valutate in base a: resa foto-realistica/illustrativa, aderenza al prompt, assenza di testo indesiderato per uso “notizie/eventi sobrio”.

---

## 3. Raccomandazione finale

**Per l’MVP si consiglia OpenAI Image Generation API (GPT-image-1-mini o GPT-image-1 a seconda del budget).**

- **Motivazione:** Ottima aderenza al prompt e rispetto dell’istruzione “nessun testo nell’immagine”, essenziale per notizie/eventi. Costo per immagine prevedibile (~$0.01–0.04 con mini/medium). Un solo provider e una sola API da integrare; stack OpenAI già familiare se si usano altri servizi. Latenza accettabile per un job in background (Step 9).
- **Alternativa a minor costo:** Replicate (FLUX dev a $0.025 o FLUX schnell a ~$0.003) se il volume è alto e si accetta una qualità leggermente più variabile e un secondo fornitore da gestire.

---

## 4. Note per lo Step 9 (implementazione)

Da usare quando si implementa la generazione delle immagini (Step 9).

### Dove invocare il servizio

- **Opzione A – API route + background:** Alla creazione del post (in `POST /api/posts` o nel job bot), se `type === 'AI_IMAGE'` si invoca in background (senza `await`) una route dedicata, es. `POST /api/ai/generate-event-image` con body `{ postId }`. La route legge il post, genera l’immagine, salva su storage e aggiorna `Post.aiImageUrl`.
- **Opzione B – Cron/job:** Un cron (o job periodico) cerca i post con `type === 'AI_IMAGE'` e `aiImageUrl` null e li processa in batch. Utile se si preferisce non legare la creazione del post alla latenza del provider.

Entrambe le opzioni sono descritte in [FEED_2.0_ESECUZIONE_STEP.md](FEED_2.0_ESECUZIONE_STEP.md) (Step 9).

### Formato prompt

Template suggerito per il modulo di generazione:

- **Testo:** *"Immagine foto-realistica che rappresenta questa notizia: [titolo]. Categoria: [categoria]. Stile sobrio, nessun testo nell'immagine."*
- **Dati:** Titolo e categoria vanno presi dall’evento associato al post (o da campi del post se già denormalizzati). Sanitizzare titolo/descrizione per evitare prompt injection (es. limitare lunghezza, rimuovere caratteri speciali per il prompt).

### Storage

- **Opzioni:** Vercel Blob (integrato con deploy Vercel), S3 (o compatibili tipo Cloudflare R2), o altro storage con URL pubblico.
- **Flusso:** Il modulo di generazione riceve l’immagine (URL temporaneo o binary dal provider), la carica sullo storage scelto e ottiene un URL pubblico. Tale URL va salvato in `Post.aiImageUrl` (campo già presente nello schema Prisma).
- **Env:** Configurare variabili d’ambiente per API key del provider (es. `OPENAI_API_KEY`) e per le credenziali storage (es. `BLOB_READ_WRITE_TOKEN` per Vercel Blob). Documentare in `.env.example` o README.
