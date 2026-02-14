# Audit codebase – Prediction Market

Documento di analisi della codebase **senza refactor**: solo mappatura e documentazione.

---

## 1) ROUTES / PAGINE

### Pre-login (accessibili senza autenticazione)

| Route | File | Scopo |
|-------|------|--------|
| `/` | `app/page.tsx` | Landing per utenti non loggati (hero, CTA, eventi in tendenza); se loggato → Home con eventi, bonus, missioni, leaderboard teaser |
| `/auth/login` | `app/auth/login/page.tsx` | Login (credentials + Google). Pagina NextAuth `signIn`. |
| `/auth/signup` | `app/auth/signup/page.tsx` | Registrazione (email/password + Google). Crea utente con 1000 crediti iniziali. |
| `/auth/success` | `app/auth/success/page.tsx` | Pagina server: verifica sessione e redirect a `callbackUrl` (default `/`). Solo redirect, non UI. |
| `/auth/logout` | `app/auth/logout/page.tsx` | Esegue `signOut` e redirect a `/`. |
| `/discover` | `app/discover/page.tsx` | Esplora eventi: filtri (stato, ordine, categoria), ricerca, paginazione. **Non protetta da middleware.** |
| `/leaderboard` | `app/leaderboard/page.tsx` | Classifica utenti (periodo, categoria). **Non protetta da middleware.** |
| `/events/[id]` | `app/events/[id]/page.tsx` | Dettaglio evento: quote, previsione utente, commenti, CTA “Fai una previsione” (se loggato). **Non protetta.** |
| `/legal/terms` | `app/legal/terms/page.tsx` | Termini di servizio |
| `/legal/privacy` | `app/legal/privacy/page.tsx` | Privacy policy |
| `/legal/content-rules` | `app/legal/content-rules/page.tsx` | Regole sui contenuti |
| `/legal/credits` | `app/legal/credits/page.tsx` | Crediti (pagina legale) |
| `/legal/*` | `app/legal/layout.tsx` | Layout condiviso per le pagine legali |

### Post-login (richiedono autenticazione)

Protezione: **middleware** (`middleware.ts`) per le route nel `matcher`; per le altre, redirect lato pagina se `status === "unauthenticated"`.

| Route | File | Protetta da | Scopo |
|-------|------|-------------|--------|
| `/` (home loggato) | `app/page.tsx` | No middleware | Home: daily bonus, missioni, eventi (tabs), leaderboard teaser, onboarding |
| `/profile` | `app/profile/page.tsx` | **Sì** middleware | Profilo utente: stats, badge, previsioni, link impostazioni |
| `/profile/[userId]` | `app/profile/[userId]/page.tsx` | No middleware; redirect se non loggato | Profilo pubblico; se `userId === session.user.id` → redirect a `/profile` |
| `/wallet` | `app/wallet/page.tsx` | **Sì** middleware | Wallet: saldo, streak, daily bonus, storico transazioni |
| `/missions` | `app/missions/page.tsx` | **Sì** middleware | Missioni giornaliere/settimanali, streak, moltiplicatore bonus |
| `/notifications` | `app/notifications/page.tsx` | **Sì** middleware | Elenco notifiche, segna come lette |
| `/shop` | `app/shop/page.tsx` | No middleware; redirect in pagina | Acquisti con crediti (shop items). Redirect a login se non loggato. |
| `/settings` | `app/settings/page.tsx` | No middleware; redirect in pagina | Impostazioni (placeholder) + link documenti legali |

### Admin (solo ruolo ADMIN)

| Route | File | Scopo |
|-------|------|--------|
| `/admin` | `app/admin/page.tsx` | Dashboard: lista eventi, filtri, link crea/modifica/risolvi |
| `/admin/events/create` | `app/admin/events/create/page.tsx` | Creazione evento |
| `/admin/events/[id]/edit` | `app/admin/events/[id]/edit/page.tsx` | Modifica evento |
| `/admin/users` | `app/admin/users/page.tsx` | Gestione utenti |
| `/admin/moderation` | `app/admin/moderation/page.tsx` | Moderazione |
| `/admin/disputes` | `app/admin/disputes/page.tsx` | Dispute |
| `/admin/audit` | `app/admin/audit/page.tsx` | Audit log |

Layout admin: `app/admin/layout.tsx` — verifica sessione e `isAdmin()`, redirect a `/auth/login` o `/?error=admin_required`.

### Altre

| Route | File | Scopo |
|-------|------|--------|
| `app/error.tsx` | Error boundary (UI) | |
| `app/global-error.tsx` | Global error boundary | |

---

## 2) NAVIGAZIONE

### Bottom navigation (solo mobile, `md:hidden`)

**File:** `components/Header.tsx` (blocco `<nav className="md:hidden fixed bottom-0 ...">`).

- **Sempre visibili:** Home (`/`), Scopri (`/discover`), Classifica (`/leaderboard`).
- **Se loggato:** anche Wallet (`/wallet`), Missioni (`/missions`), Profilo (`/profile`).
- **Se non loggato:** al posto di Wallet/Missioni/Profilo c’è un solo link “Accedi” (`/auth/login`).

Voci: Home, Scopri, Classifica, Wallet, Missioni, Profilo (o Accedi). Nessun link a Shop, Notifiche, Admin nella bottom bar.

### Navbar (header) – desktop e mobile

**File:** `components/Header.tsx`.

- Logo “Prediction Market” → `/`.
- **Desktop (`hidden md:flex`):** Scopri, Classifica, (se admin) Admin, Wallet, Shop, Missioni, NotificationBell, Profilo, “Ciao, {name}”, Esci.
- **Mobile:** hamburger che apre lo stesso menu in dropdown (`mobileOpen`).
- ThemeToggle sempre visibile.

Pre-login: stesso header ma con link “Accedi” e bottone “Registrati” invece di Wallet/Shop/Missioni/Profilo.

### Sidebar / menu laterale

- **Admin:** `components/admin/AdminSidebar.tsx` — usata in `app/admin/layout.tsx`. Voci: Eventi (`/admin`), Utenti, Moderazione, Dispute, Audit; “Torna al sito” → `/`.
- **Nessuna sidebar** per utenti normali; tutto in Header + bottom nav.

### Navbar pre-login

Stesso `Header`: logo, (in landing) nessun link nella navbar per utenti non loggati tranne Accedi/Registrati. La landing è gestita dentro `app/page.tsx` quando `status === "unauthenticated"`.

---

## 3) STATO UTENTE

### Autenticazione

- **Configurazione:** `lib/auth.ts` — NextAuth con PrismaAdapter, JWT strategy, Credentials + Google (opzionale). Pagine custom: `signIn`/`signOut`/`error` → `/auth/login`.
- **Route API:** `app/api/auth/[...nextauth]/route.ts` — handler NextAuth.
- **Middleware:** `middleware.ts` — `withAuth` solo per le route nel `matcher`; per login POST applica rate limit su `/api/auth/callback/credentials`.
- **Session:** in root layout `app/layout.tsx` viene chiamato `getServerSession(authOptions)` e passato a `<SessionProvider session={session}>` (`components/providers/SessionProvider.tsx` che wrappa `SessionProvider` di next-auth).

Estensione sessione: `types/next-auth.d.ts` — `Session.user` con `id`, `role`, `onboardingCompleted`. JWT callbacks in `lib/auth.ts` aggiornano `role` e `onboardingCompleted` dal DB.

### Caricamento stato utente

- **Server:** layout root legge la sessione una volta per request (`getServerSession`).
- **Client:** `useSession()` (next-auth) ovunque serva utente; dopo login, la pagina `/auth/success` fa redirect lato server così la home riceve il cookie; sulla home c’è anche `updateSession()` e `sessionSynced` per evitare flash “non loggato”.
- **Crediti utente:** non in sessione. Si ottengono da:
  - `GET /api/user/credits` — usato in `app/events/[id]/page.tsx` per il modal previsione.
  - `GET /api/wallet/stats` — crediti, totalEarned, totalSpent, streak, daily bonus (usato in Wallet, Home, Shop).

### Saldo crediti

- **Modello:** `User.credits` (Prisma, default 1000 in schema; signup imposta `credits: 1000` in `app/api/auth/signup/route.ts`).
- **Lettura:** `GET /api/user/credits` (solo credits), `GET /api/wallet/stats` (credits + altre stats).
- **Scrittura:** vedi sezione 5 (Crediti).

---

## 4) MERCATI / EVENTI

### Definizione e caricamento eventi

- **DB:** `prisma/schema.prisma` — modello `Event` con title, description, category, closesAt, resolved, outcome, yesCredits, noCredits, totalCredits, probability, createdBy, ecc.
- **Lista eventi:** `GET /api/events` (`app/api/events/route.ts`) — parametri: filter, search, category, status, sort, page, limit. Filtri: expiring (prossimi 7 giorni), open/closed/all. Ordini: popular (totalCredits desc), expiring (closesAt asc), discussed (_count comments), recent (createdAt desc). Restituisce eventi con `createdBy`, `_count.predictions`, `_count.comments`. **Non restituisce** yesCredits/noCredits (il list usa solo probability e totalCredits dal DB).
- **Dettaglio evento:** `GET /api/events/[id]` (`app/api/events/[id]/route.ts`) — restituisce `event` (tutti i campi incluso yesCredits, noCredits), `userPrediction`, `isFollowing` (se loggato).
- **Categorie:** `GET /api/events/categories` — lista categorie distinte.

### Percentuali, quote, stati

- **Probability:** salvata su `Event.probability` (Float). Aggiornata in:
  - `app/api/predictions/route.ts` — a ogni nuova previsione: `probability = (yesCredits / totalCredits) * 100`.
  - `app/api/events/resolve-closed/route.ts` e `app/api/events/resolve/[eventId]/route.ts` — quando si risolve (calcolo da yesCredits/noCredits).
- **yesCredits / noCredits:** campi sul modello Event; aggiornati in `app/api/predictions/route.ts` (increment su YES/NO) e ricalcolati in resolve-closed/resolve quando si risolve.
- **Stato evento (aperto/chiuso/risolto):** derivato da `event.resolved`, `event.closesAt`; in lista si filtra con `where.resolved`, `where.closesAt`.
- **UI:** In `EventCard` si usa solo `event.probability` e `event.totalCredits` (dalla lista). In `app/events/[id]/page.tsx` si usano yesCredits, noCredits, probability per barra SÌ/NO e percentuale.

### Duplicazioni

- **Risoluzione eventi:** tre punti che risolvono eventi e calcolano payout:
  1. `app/api/admin/events/[id]/resolve/route.ts` — POST admin, outcome nel body, payout proporzionale, notifiche, audit, missioni WIN_PREDICTIONS, badge.
  2. `app/api/events/resolve-closed/route.ts` — POST (cron o admin), risolve **tutti** gli eventi chiusi non risolti; outcome determinato da “yesCredits > noCredits → YES altrimenti NO” (logica automatica).
  3. `app/api/events/resolve/[eventId]/route.ts` — POST con body `{ outcome }`, risolve un singolo evento; **nessun controllo admin/cron** nel codice letto — potenziale inconsistenza di autorizzazione.
- **resolveClosedEvents:** `lib/resolveClosedEvents.ts` chiama POST `/api/events/resolve-closed` dal **client** (da `app/page.tsx` in `useEffect`). Senza CRON_SECRET la route richiede admin; utenti normali che caricano la home ottengono 401 su quella chiamata (silenziosa in catch).
- **Costanti daily bonus:** `DAILY_BONUS_BASE`, `STREAK_MULTIPLIER_PER_DAY`, `STREAK_CAP` definite sia in `app/api/wallet/daily-bonus/route.ts` sia in `app/api/wallet/stats/route.ts` (duplicazione).

---

## 5) CREDITI

Punti in cui i crediti vengono assegnati o detratti:

| Punto | File | Tipo | Descrizione |
|-------|------|------|-------------|
| Registrazione | `app/api/auth/signup/route.ts` | Assegnazione | `credits: 1000` alla creazione utente (solo signup email; Google crea utente via adapter, default schema 1000). |
| Previsione (scommessa) | `app/api/predictions/route.ts` | Detrazione | Decremento `user.credits`, incremento `event.yesCredits` o `noCredits` e `totalCredits`, transazione `PREDICTION_BET` (amount negativo). |
| Vincita previsione | `app/api/admin/events/[id]/resolve/route.ts` | Assegnazione | Payout proporzionale ai vincitori; incremento `user.credits` e `totalEarned`, transazione `PREDICTION_WIN`. |
| Vincita (resolve-closed) | `app/api/events/resolve-closed/route.ts` | Assegnazione | Stessa logica payout, transazione `PREDICTION_WIN`. |
| Vincita (resolve by eventId) | `app/api/events/resolve/[eventId]/route.ts` | Assegnazione | Stessa logica payout. |
| Daily bonus | `app/api/wallet/daily-bonus/route.ts` | Assegnazione | Incremento crediti (base 50 × moltiplicatore streak), `totalEarned`, transazione `DAILY_BONUS`; aggiorna missione DAILY_LOGIN e badge. |
| Missione completata | `lib/missions.ts` (`updateMissionProgress`) | Assegnazione | Incremento `user.credits` e `totalEarned`, transazione `MISSION_REWARD`; notifica MISSION_COMPLETED. Chiamato da: daily-bonus (DAILY_LOGIN), predictions (MAKE_PREDICTIONS), admin resolve (WIN_PREDICTIONS). |
| Shop | `app/api/shop/purchase/route.ts` | Detrazione | Decremento crediti, incremento `totalSpent`, transazione `SHOP_PURCHASE` (amount negativo). |

Tipi transazione presenti in Wallet UI ma **non usati** nel codice (solo label/icona): `ADMIN_ADJUSTMENT`, `REFERRAL_BONUS` — nessuna API trovata che crei queste transazioni.

---

## OUTPUT OBBLIGATORIO

### Elenco routes + descrizione (sintesi)

Vedi **Sezione 1** per l’elenco completo. In sintesi:

- **Pubbliche:** `/`, `/auth/login`, `/auth/signup`, `/auth/success`, `/auth/logout`, `/discover`, `/leaderboard`, `/events/[id]`, `/legal/*`.
- **Post-login:** `/` (home), `/profile`, `/profile/[userId]`, `/wallet`, `/missions`, `/notifications`, `/shop`, `/settings`.
- **Admin:** `/admin`, `/admin/events/create`, `/admin/events/[id]/edit`, `/admin/users`, `/admin/moderation`, `/admin/disputes`, `/admin/audit`.

### Componenti chiave con path

| Componente | Path |
|-----------|------|
| Header (navbar + bottom nav) | `components/Header.tsx` |
| AdminSidebar | `components/admin/AdminSidebar.tsx` |
| EventCard | `components/EventCard.tsx` |
| PredictionModal | `components/PredictionModal.tsx` |
| CommentsSection | `components/CommentsSection.tsx` |
| SessionProvider | `components/providers/SessionProvider.tsx` |
| OnboardingTour | `components/OnboardingTour.tsx` |
| NotificationBell / NotificationDropdown | `components/NotificationBell.tsx`, `components/NotificationDropdown.tsx` |
| ThemeToggle | `components/ThemeToggle.tsx` |
| StreakBadge | `components/StreakBadge.tsx` |
| StatsCard | `components/StatsCard.tsx` |
| LeaderboardRow | `components/LeaderboardRow.tsx` |
| HeroMarquee | `components/landing/HeroMarquee.tsx` |
| BreakingNewsTicker | `components/landing/BreakingNewsTicker.tsx` |

### Flusso utente testuale

1. **Pre-login:** Utente arriva su `/` → vede landing (hero, ticker, eventi in tendenza, CTA Registrati/Accedi). Può andare su `/discover`, `/leaderboard`, `/events/[id]` senza login. Su dettaglio evento può leggere ma non “Fai una previsione” (vede “Accedi per scommettere”).
2. **Login:** Clic “Accedi” → `/auth/login`. Credentials o Google → redirect a `/auth/success?callbackUrl=/` → server verifica sessione → redirect a `/`.
3. **Home:** Vede “Bentornato, {nome}”, widget crediti giornalieri, missioni di oggi, tab eventi (In scadenza / In tendenza / Per te), teaser classifica. Può ritirare daily bonus, andare a Scopri/Missioni/Wallet/Profilo.
4. **Scopri:** `/discover` — filtri, ricerca, griglia eventi; click su evento → `/events/[id]`.
5. **Evento:** Dettaglio, barra SÌ/NO, eventuale previsione già fatta; se può, “Fai una Previsione” apre PredictionModal; crediti caricati da `/api/user/credits`. Dopo previsione, refresh evento e crediti.
6. **Wallet/Missioni:** Da header o bottom nav → `/wallet` (saldo, bonus, transazioni) o `/missions` (missioni giornaliere/settimanali, streak). Shop da header → `/shop` (acquisti con crediti). Notifiche da campanella → `/notifications`. Profilo → `/profile` (stats, badge, previsioni) o `/profile/[userId]` per profilo pubblico.

### Incoerenze trovate (senza correzioni)

1. **Middleware vs redirect in pagina:** `/shop`, `/settings`, `/profile/[userId]`, `/leaderboard`, `/discover` non sono nel matcher del middleware. Per shop/settings/profile la protezione è solo client-side (redirect se `unauthenticated`). Per discover/leaderboard non c’è protezione (voluto).
2. **Risoluzione eventi in tre posti:** logica di resolve e payout duplicata in `admin/events/[id]/resolve`, `events/resolve-closed`, `events/resolve/[eventId]`; `resolve/[eventId]` non sembra verificare admin/cron.
3. **Chiamata client a resolve-closed:** la home chiama `resolveClosedEvents()` (POST `/api/events/resolve-closed`) da ogni client; senza CRON_SECRET solo admin può farla → 401 per utenti normali (catturato in catch, nessun messaggio utente).
4. **Tipi transazione non implementati:** Wallet mostra label per `ADMIN_ADJUSTMENT` e `REFERRAL_BONUS` ma non esiste codice che crei queste transazioni.
5. **Crediti iniziali Google:** signup email imposta esplicitamente `credits: 1000`; utenti creati via Google usano il default dello schema (1000) ma il flusso non è documentato nello stesso punto.
6. **nextBonusAmount in wallet/stats:** calcolo “prossimo bonus” usa streak+1 se può claimare oggi; in daily-bonus il moltiplicatore è calcolato con il nuovo streak dopo il claim. Possibile piccola differenza tra “preview” e valore effettivo al click.
7. **Home “Per te”:** tab “Per te” usa gli stessi dati di “In tendenza” (`fetchSectionEvents("popular", ...)` per entrambi), quindi non c’è personalizzazione.
8. **Pagina logout:** usa classi `bg-gray-50`, `bg-white` invece del design system (glass, bg-bg, ecc.) usato nel resto dell’app.
9. **Profilo pubblico:** `/profile/[userId]` richiede login (redirect) ma non è nel matcher del middleware — protezione solo client-side.

Fine audit.
