# Analytics e controlli anti-abuse (Fase 8)

## Analytics

### Eventi implementati

| Evento | Dove | Proprietà principali |
|--------|------|----------------------|
| `USER_SIGNUP` | API signup | userId |
| `ONBOARDING_COMPLETE` | API onboarding-complete | userId |
| `EVENT_VIEWED` | Pagina evento (client) | eventId, category |
| `EVENT_FOLLOWED` | API follow evento | userId, eventId |
| `PREDICTION_PLACED` | API predictions | userId, eventId, amount, outcome, category |
| `COMMENT_POSTED` | API comments | userId, eventId |
| `REACTION_ADDED` | API reactions | userId, commentId, eventId, reactionType |
| `EVENT_RESOLVED_VIEWED` | Pagina evento se resolved (client) | eventId |
| `MISSION_VIEWED` | Pagina missioni (client) | - |
| `MISSION_COMPLETED` | lib/missions (completamento) | userId, missionId, period, amount |
| `DAILY_BONUS_CLAIMED` | API daily-bonus | userId, amount, period, streak |
| `LEADERBOARD_VIEWED` | Pagina classifica (client) | - |
| `PROFILE_VIEWED` | Pagina profilo /profile e /profile/[userId] | userId |
| `SHOP_VIEWED` | Pagina negozio (client) | - |
| `SHOP_PURCHASED` | API shop purchase | userId, item, itemId, priceCredits |

### Provider

Configurazione tramite variabili d’ambiente:

- **PostHog**: `ANALYTICS_PROVIDER=posthog`, `POSTHOG_API_KEY` (o `NEXT_PUBLIC_POSTHOG_KEY`), opzionale `POSTHOG_HOST`
- **Custom**: `ANALYTICS_PROVIDER=custom`, `ANALYTICS_ENDPOINT=<url>` (POST JSON con `event` e `properties`)
- **Vercel**: `ANALYTICS_PROVIDER=vercel`; se vuoi inviare anche a un backend, imposta `ANALYTICS_ENDPOINT`

Il client invia gli eventi “view” tramite `POST /api/analytics/track` (body: `{ event, properties }`). Il server aggiunge `userId` dalla sessione quando disponibile.

### Funnel suggerito (dashboard analytics)

1. **Signup → Onboarding complete → First prediction**  
   - Filtrare utenti con `ONBOARDING_COMPLETE` e almeno un `PREDICTION_PLACED`.
2. **Ritenzione D1 / D7**  
   - Utenti con signup a T; contare chi ha almeno un evento (es. `EVENT_VIEWED`, `PREDICTION_PLACED`, `DAILY_BONUS_CLAIMED`) a T+1 e T+7.
3. **Mission completion → Next session**  
   - Dopo `MISSION_COMPLETED`, contare sessioni successive (es. `EVENT_VIEWED`, `LEADERBOARD_VIEWED`, `PROFILE_VIEWED`) nella stessa giornata o giorno successivo.

---

## Controlli anti-abuse già implementati

### Una sola previsione per utente per evento

- **DB**: constraint `@@unique([userId, eventId])` sul modello `Prediction` (Prisma).
- **API**: in `POST /api/predictions` viene fatto un check esplicito e, in caso di race, l’errore Prisma `P2002` (unique violation) viene mappato in risposta 400 “Hai già fatto una previsione per questo evento”.

### Rate limit signup per IP

- In `POST /api/auth/signup`: `rateLimit(\`signup:${ip}\`, 5)` con finestra 1 minuto (vedi `lib/rate-limit.ts`).
- Header usati per l’IP: `x-forwarded-for`, `x-real-ip`.

### Opzionale per MVP (multi-account / device)

- **Rate limit signup per IP**: già fatto (5/minuto).
- **Stesso device/fingerprint**: non implementato; si può aggiungere in seguito (es. cookie o header client, flag su tabella User o tabella dedicata).

---

## File coinvolti

- `lib/analytics.ts` – logica server: `track(event, properties, context)`, invio PostHog/custom.
- `lib/analytics-client.ts` – helper client: `trackView(event, properties)` → `POST /api/analytics/track`.
- `app/api/analytics/track/route.ts` – endpoint per eventi dal client.
- Chiamate a `track()` nelle API: signup, onboarding-complete, predictions, comments, reactions, follow, daily-bonus, shop purchase, missions (completamento).
- Chiamate a `trackView()` nelle pagine: evento, leaderboard, profilo, shop, missioni.
