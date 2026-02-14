# Prompt per step – da usare in chat separate (Agent mode)

Usa **una nuova chat in Agent mode** per ogni fase. Copia e incolla il blocco "Prompt" nella chat; l’agente avrà tutto il contesto per realizzare solo quella fase. Dopo il lavoro, spunta le voci in [THINGS_TO_DO.md](THINGS_TO_DO.md).

---

## Fase 0 – Fondamenta (schema e API base)

**Scopo chat:** estendere lo schema Prisma e introdurre rate limit su signup, login, previsioni e commenti.

**Prompt:**

```
Contesto: progetto "piattaforma di previsioni social" per l’Italia. Stack: Next.js 14 (App Router), TypeScript, Prisma, Postgres, NextAuth, Tailwind. Crediti solo virtuali, niente lessico scommesse.

Implementa tutto ciò che rientra nella Fase 0 del file THINGS_TO_DO.md (Fondamenta). In sintesi:

1. In Prisma: aggiungi al model Event i campi resolutionSourceUrl (String?), resolutionNotes (String?), e opzionalmente resolutionDisputedAt, resolutionDisputedBy.
2. Crea il model EventFollower (userId, eventId) con indice su userId e eventId.
3. Crea il model AuditLog (id, userId, action, entityType, entityId, payload Json?, createdAt).
4. Crea il model Season (id, name, startAt, endAt) per stagioni/tornei.
5. Crea il model ShopItem (id, name, type String es. CREDIT_BUNDLE|COSMETIC|TICKET, priceCredits Int, description String?, active Boolean).
6. Esegui db push (o migrate) e verifica che lo schema sia applicato.
7. Implementa rate limit su signup (per IP, es. max 5/min), risposta 429 oltre il limite.
8. Implementa rate limit su login (stesso criterio), 429 oltre il limite.
9. Implementa rate limit su creazione previsione (es. 10 per user/min), 429 oltre il limite.
10. Implementa rate limit su creazione commenti (es. 5 per user/min), 429 oltre il limite.

Usa una lib o middleware per il rate limit (es. in-memory per MVP o Redis se già in stack). Alla fine aggiorna THINGS_TO_DO.md segnando come completate le voci della Fase 0.
```

---

## Fase 1 – Landing e Auth

**Scopo chat:** landing per utenti non loggati, CTA, anteprima eventi, trust; verificare flussi Registrati/Accedi.

**Prompt:**

```
Contesto: progetto "piattaforma di previsioni social" per l’Italia. Next.js 14 App Router, TypeScript, Prisma, NextAuth, Tailwind. Copy in italiano, tono professionale, niente lessico scommesse.

Implementa tutto ciò che rientra nella Fase 1 del file THINGS_TO_DO.md (Landing e Auth):

1. Creare o adattare la landing per utenti non loggati: hero con headline "Dimostra di capire il mondo prima degli altri." e sottotitolo sul valore dei crediti virtuali.
2. CTA in evidenza: "Registrati" e "Accedi".
3. Anteprima 3–4 eventi in tendenza (card read-only); empty state: "Presto nuovi eventi. Iscriviti per non perderli."
4. Sezione trust: "Crediti virtuali · Nessun prelievo · Risoluzione trasparente" (o equivalente).
5. Verificare pagine Registrati e Accedi: copy in italiano (pulsanti, label, messaggi di errore).
6. Verificare redirect post login/registrazione verso homepage loggata (o onboarding se previsto).

Alla fine aggiorna THINGS_TO_DO.md segnando come completate le voci della Fase 1.
```

---

## Fase 2 – Home e Discover

**Scopo chat:** homepage loggata (saluto, daily bonus, missioni, sezioni eventi, teaser classifica) e pagina Discover con filtri, sort e paginazione.

**Prompt:**

```
Contesto: progetto "piattaforma di previsioni social" per l’Italia. Next.js 14 App Router, TypeScript, Prisma, NextAuth, Tailwind. Copy in italiano.

Implementa tutto ciò che rientra nella Fase 2 del file THINGS_TO_DO.md (Home e Discover):

1. Homepage loggata: saluto "Bentornato, [nome]." (o equivalente).
2. Banner/widget daily bonus: "Ritira i crediti giornalieri"; se già ritirato: disabilitato + "Prossimo bonus domani".
3. Widget missioni: 2–3 missioni del giorno, titolo "Missioni di oggi", CTA "Completa per guadagnare crediti".
4. Sezioni eventi: almeno "In scadenza", "In tendenza" (e opzionale "Per te"); tab o sezioni distinte.
5. Empty state eventi: "Nessun evento al momento. Torna più tardi o esplora le categorie."
6. Teaser classifica: top 3 o link "Vedi classifica" → /leaderboard.
7. Pagina /discover: titolo "Scopri le previsioni", barra di ricerca "Cerca eventi...".
8. Filtri Discover: categoria (Tech/AI, Cultura, Attualità, ecc.), stato (aperti/chiusi se applicabile).
9. Sort Discover: "In tendenza", "In scadenza", "Più recenti", "Più discussi"; risultati da API.
10. Paginazione lista eventi in Discover; empty state: "Nessun evento con questi filtri."

Alla fine aggiorna THINGS_TO_DO.md segnando come completate le voci della Fase 2.
```

---

## Fase 3 – Dettaglio evento e previsioni

**Scopo chat:** pagina Event Detail completa (previsione SÌ/NO, pool proporzionale, commenti, follow, share, risoluzione e notifiche).

**Prompt:**

```
Contesto: progetto "piattaforma di previsioni social" per l’Italia. Next.js 14 App Router, TypeScript, Prisma, NextAuth, Tailwind. Una sola previsione per utente per evento. Payout = pool proporzionale (stake_personale / stake_totale_outcome_vincente * pool_totale).

Implementa tutto ciò che rientra nella Fase 3 del file THINGS_TO_DO.md (Dettaglio evento e previsioni):

1. Event Detail: titolo, categoria, date (creazione, chiusura), descrizione.
2. Criteri di risoluzione e fonte obbligatoria visibile: "Fonte di risoluzione: [link]".
3. Blocco previsione: scelta SÌ/NO, slider o input crediti, CTA "Conferma previsione"; disabilitare se evento chiuso o risolto.
4. Validazione server: una sola previsione per utente per evento; messaggio chiaro se già presente.
5. Grafico o indicatore probabilità (yesCredits/totalCredits) e volume crediti SÌ/NO.
6. Calcolo payout pool proporzionale alla risoluzione: vincitori ricevono (stake_personale / stake_totale_outcome_vincente) * pool_totale.
7. Sezione commenti: thread con risposte, commentare e reagire (thumbs up, fire, heart); empty "Nessun commento. Inizia tu la discussione."
8. Pulsante "Segui evento" / "Non seguire più" con EventFollower; usare per notifiche.
9. Pulsante Condividi (Web Share API o copy link).
10. Se evento chiuso: nascondere blocco previsione, mostrare "Previsioni chiuse. Risultato: SÌ/NO."; se risolto: risultato + link fonte.
11. API risoluzione: aggiornare crediti, creare Transaction (PREDICTION_WIN), notifiche a follower e a chi ha previsto.

Alla fine aggiorna THINGS_TO_DO.md segnando come completate le voci della Fase 3.
```

---

## Fase 4 – Missioni, bonus e retention

**Scopo chat:** missioni daily/weekly, daily bonus con streak, pagina Missioni, Leaderboard con periodo e categoria.

**Prompt:**

```
Contesto: progetto "piattaforma di previsioni social" per l’Italia. Next.js 14 App Router, TypeScript, Prisma, NextAuth, Tailwind. Missioni e UserMission già in schema; daily bonus con streak e moltiplicatore.

Implementa tutto ciò che rientra nella Fase 4 del file THINGS_TO_DO.md (Missioni, bonus e retention):

1. Missioni daily (es. "Fai 3 previsioni", "1 previsione su Tech") con target e reward crediti; progresso in UserMission.
2. Missioni weekly con target e reward; rispettare periodStart (giorno/settimana).
3. Completamento missione: progress, completed, completedAt; accreditare reward, creare Transaction; notifica "Missione completata: +[X] crediti."
4. Endpoint/azione "Ritira bonus giornaliero" una volta ogni 24h; crediti base (es. 50) + moltiplicatore streak.
5. Streak: giorni consecutivi (login o claim daily); aggiornare lastDailyBonus e streak su User; moltiplicatore (es. 1 + 0.1 per giorno, max 2x) sul daily bonus.
6. Pagina Missioni: titolo "Missioni", card streak "Serie: [N] giorni" e "Moltiplicatore bonus: x1.2", lista daily/weekly con progresso e reward; empty "Nessuna missione attiva. Torna domani."
7. Pagina Leaderboard: tab periodo (settimana, mese, sempre) e filtro categoria.
8. Tabella: Posizione, Utente, Accuratezza %, Serie, Punteggio; link profilo; tooltip "Punteggio basato su previsioni corrette e consistenza."
9. Empty leaderboard: "Nessun dato per questo periodo."; opzionale "La tua posizione: N".

Alla fine aggiorna THINGS_TO_DO.md segnando come completate le voci della Fase 4.
```

---

## Fase 5 – Wallet e Shop

**Scopo chat:** pagina Wallet (saldo, daily bonus, storico transazioni, disclaimer) e Credit Shop (prodotti in crediti, acquisto, disclaimer).

**Prompt:**

```
Contesto: progetto "piattaforma di previsioni social" per l’Italia. Next.js 14 App Router, TypeScript, Prisma, NextAuth, Tailwind. Wallet = crediti virtuali; shop in MVP solo prodotti acquistabili con crediti (nessun euro).

Implementa tutto ciò che rientra nella Fase 5 del file THINGS_TO_DO.md (Wallet e Shop):

1. Pagina Wallet: saldo in evidenza "Crediti disponibili" aggiornato.
2. Pulsante "Ritira bonus giornaliero" (o link alla stessa azione); se già ritirato: disabilitato + "Prossimo bonus domani".
3. Storico transazioni: tipo (Previsione, Risultato, Bonus giornaliero, Missione), importo (+/-), data, descrizione; paginazione.
4. Disclaimer in Wallet: "I crediti sono virtuali e non hanno valore monetario. Non sono convertibili né prelevabili."
5. Empty stato storico: "Nessuna transazione ancora."
6. Pagina /shop: disclaimer in alto "Tutti gli acquisti usano crediti virtuali. I crediti non hanno valore reale e non sono prelevabili o convertibili."
7. Elenco prodotti da ShopItem: nome, prezzo in crediti, descrizione; solo crediti in MVP.
8. Acquisto con crediti: verifica saldo, decremento, Transaction, sblocco item se cosmetico/ticket; "Crediti insufficienti" se saldo < prezzo.
9. Empty shop: "Nessun prodotto disponibile al momento."

Alla fine aggiorna THINGS_TO_DO.md segnando come completate le voci della Fase 5.
```

---

## Fase 6 – Profilo e notifiche

**Scopo chat:** pagina Profilo (stats, badge, categorie seguite) e Centro notifiche (lista, marca lette, template IT).

**Prompt:**

```
Contesto: progetto "piattaforma di previsioni social" per l’Italia. Next.js 14 App Router, TypeScript, Prisma, NextAuth, Tailwind. Copy in italiano.

Implementa tutto ciò che rientra nella Fase 6 del file THINGS_TO_DO.md (Profilo e notifiche):

1. Pagina Profilo: avatar, nome, username; statistiche (Previsioni, Accuratezza, Serie) da User.
2. Sezione badge; empty "Completa missioni e previsioni per sbloccare badge."
3. Categorie seguite (o eventi seguiti) e link Impostazioni.
4. Pagina Notifiche: titolo "Notifiche", lista con tipo (risoluzione, missione, streak), titolo, messaggio, data; link a evento/profilo.
5. "Marca come lette" singola e "Tutte lette" batch; aggiornare read/readAt.
6. Template notifiche in italiano: "L’evento [titolo] è stato risolto: [SÌ/NO].", "Missione completata: +[X] crediti.", "La tua serie è a rischio. Fai login per mantenerla."
7. Empty notifiche: "Nessuna notifica."

Alla fine aggiorna THINGS_TO_DO.md segnando come completate le voci della Fase 6.
```

---

## Fase 7 – Admin e Ops

**Scopo chat:** area admin protetta, CRUD eventi con resolution source/notes, risoluzione e payout, moderazione, dispute, audit log.

**Prompt:**

```
Contesto: progetto "piattaforma di previsioni social" per l’Italia. Next.js 14 App Router, TypeScript, Prisma, NextAuth, Tailwind. Solo utenti con role ADMIN possono accedere a /admin. AuditLog per tracciare azioni.

Implementa tutto ciò che rientra nella Fase 7 del file THINGS_TO_DO.md (Admin e Ops):

1. Proteggere route /admin (e sotto-route): solo role ADMIN; redirect o 403 per altri.
2. Layout Admin: sidebar (Eventi, Moderazione, Audit, Dispute); area contenuto per tabelle/form.
3. Admin Eventi: form crea/modifica con titolo, descrizione, categoria, closesAt, resolution_source_url e resolution_notes obbligatori; createdById; scrivere in AuditLog.
4. Admin Risoluzione: per evento chiuso, form outcome (SÌ/NO), conferma; calcolo payout pool proporzionale, aggiorna User.credits, Transaction, Notification; AuditLog.
5. Admin Moderazione: coda/lista commenti; azioni Nascondi/Elimina; motivazione opzionale; AuditLog.
6. Admin Dispute: coda eventi in finestra dispute (es. 2h post-risoluzione); Approva/Rifiuta/Correggi; AuditLog.
7. Sezione Audit: tabella AuditLog (userId, action, entityType, entityId, payload, createdAt) con filtri e paginazione; sola lettura.

Alla fine aggiorna THINGS_TO_DO.md segnando come completate le voci della Fase 7.
```

---

## Fase 8 – Abuse e analytics

**Scopo chat:** eventi analytics (signup, onboarding, prediction, mission, daily, leaderboard, shop), integrazione provider, verifica constraint previsione, anti multi-account, funnel.

**Prompt:**

```
Contesto: progetto "piattaforma di previsioni social" per l’Italia. Next.js 14 App Router, TypeScript, Prisma, NextAuth, Tailwind. Servono analytics per PMF e dashboards; abuse prevention già parzialmente con rate limit e una previsione per user/event.

Implementa tutto ciò che rientra nella Fase 8 del file THINGS_TO_DO.md (Abuse e analytics):

1. Invio eventi analytics: USER_SIGNUP, ONBOARDING_COMPLETE, EVENT_VIEWED, EVENT_FOLLOWED, PREDICTION_PLACED (amount, outcome, category), COMMENT_POSTED, REACTION_ADDED, EVENT_RESOLVED_VIEWED, MISSION_VIEWED, MISSION_COMPLETED, DAILY_BONUS_CLAIMED, LEADERBOARD_VIEWED, PROFILE_VIEWED, SHOP_VIEWED, SHOP_PURCHASED (item, price in credits).
2. Integrare provider (Vercel Analytics, PostHog, o endpoint custom); passare userId, sessionId, category, eventId, amount, period dove applicabile.
3. Verificare che il backend imponga una sola previsione per user per event (constraint DB + check API).
4. Documentare o implementare controlli anti multi-account: rate limit signup per IP; opzionale flag device/fingerprint per MVP.
5. Definire funnel: Signup → Onboarding complete → First prediction; D1/D7 return; Mission completion → Next session (dashboard o report).

Alla fine aggiorna THINGS_TO_DO.md segnando come completate le voci della Fase 8.
```

---

## Fase 9 – Copy, legal e polish

**Scopo chat:** revisione copy italiano, empty/error, tooltip onboarding, pagine legal (TOS, Privacy, Regole, Disclaimer crediti), accessibilità e responsive.

**Prompt:**

```
Contesto: progetto "piattaforma di previsioni social" per l’Italia. Next.js 14 App Router, TypeScript, Prisma, NextAuth, Tailwind. Tono professionale, niente lessico scommesse. Legal = placeholder da sostituire con testi legali.

Implementa tutto ciò che rientra nella Fase 9 del file THINGS_TO_DO.md (Copy, legal e polish):

1. Revisionare tutte le pagine: headline, sottotitoli, CTA e pulsanti in italiano, tono professionale.
2. Verificare empty state e messaggi di errore: "Qualcosa è andato storto. Riprova.", "Crediti insufficienti.", "Sessione scaduta. Accedi di nuovo."
3. Tooltip onboarding: "Scegli un evento e fai la tua prima previsione.", "I crediti si vincono con previsioni corrette e missioni.", "Segui gli eventi per restare aggiornato."
4. Pagina Termini di servizio (/legal/terms o in settings): placeholder età 18+, uso accettabile, crediti virtuali.
5. Pagina Privacy policy (/legal/privacy): placeholder dati raccolti, base giuridica, diritti GDPR.
6. Pagina Regole contenuti: "Contenuti vietati: insulti, spam, informazioni false. Le previsioni sono solo con crediti virtuali."
7. Pagina Disclaimer crediti (/legal/credits): "I crediti sono valuta di gioco. Non hanno valore monetario, non sono prelevabili né convertibili in denaro o altri beni."
8. Verifica accessibilità: contrasto ≥ 4.5:1, touch target ≥ 44px, focus visibile, label form.
9. Verifica responsive: mobile-first, breakpoint 360, 768, 1024px; griglia e spaziatura coerenti.

Alla fine aggiorna THINGS_TO_DO.md segnando come completate le voci della Fase 9.
```

---

## Ordine consigliato

Esegui le chat nell’ordine **Fase 0 → Fase 1 → … → Fase 9**: ogni fase dipende dalla precedente (es. Fase 2 usa daily bonus e missioni che possono essere implementati in Fase 4, ma il widget in homepage può chiamare API già esistenti; Fase 3 usa EventFollower e payout che richiedono Fase 0).

Se una fase richiede API o modelli non ancora presenti, l’agente può segnalarlo: in quel caso completa prima la Fase 0, poi riprova.
