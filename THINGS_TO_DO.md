# Things to do – Piattaforma di previsioni social

**Come usare questa lista:** spunta ogni voce quando è completata sostituendo `[ ]` con `[x]`. Tieni il file nel repo come riferimento e per tracciare l'avanzamento. Ordine consigliato: dall'alto verso il basso (le fasi rispettano le dipendenze).

---

## Fase 0 – Fondamenta (schema e API base)

- [ ] Aggiungere al model `Event` in Prisma i campi `resolutionSourceUrl` (String?), `resolutionNotes` (String?), e opzionalmente `resolutionDisputedAt`, `resolutionDisputedBy` per le dispute.
- [ ] Creare model `EventFollower` (userId, eventId) per la funzionalità "Segui evento" con indice su userId e eventId.
- [ ] Creare model `AuditLog` (id, userId, action, entityType, entityId, payload JSON, createdAt) per tracciare azioni admin.
- [ ] Creare model `Season` (id, name, startAt, endAt) per stagioni/tornei; aggiungere relazione o campo su Event/Leaderboard se necessario.
- [ ] Creare model `ShopItem` (id, name, type CREDIT_BUNDLE|COSMETIC|TICKET, priceCredits, description?, active) per il negozio crediti.
- [ ] Eseguire migration Prisma (`db push` o `migrate dev`) e verificare che lo schema sia applicato al database.
- [ ] Implementare rate limit su signup (es. max richieste per IP/minuto) e restituire 429 oltre il limite.
- [ ] Implementare rate limit su login (stesso criterio) e restituire 429 oltre il limite.
- [ ] Implementare rate limit su creazione previsione (es. N previsioni per user per minuto) e restituire 429 oltre il limite.
- [ ] Implementare rate limit su creazione commenti (es. N commenti per user per minuto) e restituire 429 oltre il limite.

---

## Fase 1 – Landing e Auth

- [ ] Creare o adattare la landing page per utenti non loggati: hero con headline "Dimostra di capire il mondo prima degli altri." e sottotitolo sul valore dei crediti virtuali.
- [ ] Aggiungere CTA principali "Registrati" e "Accedi" in evidenza sulla landing.
- [ ] Mostrare anteprima di 3–4 eventi in tendenza (read-only, card) sulla landing; gestire stato vuoto con messaggio "Presto nuovi eventi. Iscriviti per non perderli."
- [ ] Aggiungere sezione trust/credibilità: "Crediti virtuali · Nessun prelievo · Risoluzione trasparente" (o equivalente).
- [ ] Verificare che le pagine Registrati e Accedi esistano e che il copy sia in italiano (pulsanti, label, messaggi di errore).
- [ ] Verificare che dopo login/registrazione l'utente venga reindirizzato alla homepage loggata (o onboarding se previsto).

---

## Fase 2 – Home e Discover

- [ ] Homepage loggata: mostrare saluto "Bentornato, [nome]." (o equivalente).
- [ ] Aggiungere banner/widget per il daily bonus ("Ritira i crediti giornalieri") con stato disabilitato se già ritirato ("Prossimo bonus domani").
- [ ] Aggiungere widget missioni: mostrare 2–3 missioni del giorno con titolo "Missioni di oggi" e CTA "Completa per guadagnare crediti".
- [ ] Implementare sezioni eventi in homepage: almeno "In scadenza", "In tendenza" (e opzionale "Per te"); usare tab o sezioni distinte.
- [ ] Gestire empty state eventi: "Nessun evento al momento. Torna più tardi o esplora le categorie."
- [ ] Aggiungere teaser classifica in homepage (top 3 o link "Vedi classifica") che porta a `/leaderboard`.
- [ ] Creare pagina Discover (`/discover`) con titolo "Scopri le previsioni" e barra di ricerca ("Cerca eventi...").
- [ ] Aggiungere filtri Discover: categoria (Tech/AI, Cultura, Attualità, ecc.), stato (aperti/chiusi se applicabile).
- [ ] Aggiungere ordinamento Discover: "In tendenza", "In scadenza", "Più recenti", "Più discussi" con risultati da API.
- [ ] Implementare paginazione sulla lista eventi in Discover e gestire empty state "Nessun evento con questi filtri."

---

## Fase 3 – Dettaglio evento e previsioni

- [ ] Pagina Event Detail: mostrare titolo, categoria, date (creazione, chiusura), descrizione.
- [ ] Mostrare criteri di risoluzione e fonte obbligatoria ("Fonte di risoluzione: [link]") in modo visibile.
- [ ] Blocco previsione: pulsanti/scelta SÌ e NO, slider o input per importo crediti, CTA "Conferma previsione"; disabilitare se evento chiuso o già risolto.
- [ ] Garantire una sola previsione per utente per evento (validazione lato server e messaggio chiaro se già presente).
- [ ] Mostrare grafico o indicatore semplice di probabilità (es. yesCredits/totalCredits) e volume in crediti sul lato SÌ/NO.
- [ ] Implementare calcolo payout pool proporzionale: alla risoluzione, i vincitori ricevono (stake_personale / stake_totale_outcome_vincente) * pool_totale.
- [ ] Sezione commenti: thread con risposte, possibilità di commentare e reagire (es. thumbs up, fire, heart); empty state "Nessun commento. Inizia tu la discussione."
- [ ] Pulsante "Segui evento" / "Non seguire più" con persistenza (model EventFollower) e uso per notifiche.
- [ ] Pulsante Condividi (share) per l'evento (Web Share API o copy link).
- [ ] Se evento chiuso: nascondere blocco previsione e mostrare "Previsioni chiuse. Risultato: SÌ/NO."; se risolto, mostrare risultato e link alla fonte.
- [ ] API risoluzione evento: aggiornare crediti utenti, creare transazioni (PREDICTION_WIN), inviare notifiche ai follower e a chi ha previsto.

---

## Fase 4 – Missioni, bonus e retention

- [x] Definire missioni daily (es. "Fai 3 previsioni", "1 previsione su Tech") con target e reward crediti; salvare progresso in UserMission.
- [x] Definire missioni weekly con target e reward; rispettare periodStart per il periodo (giorno/settimana).
- [x] Completamento missione: aggiornare progress, completed, completedAt; accreditare reward crediti e creare transazione; inviare notifica "Missione completata: +[X] crediti."
- [x] Daily bonus: endpoint o azione "Ritira bonus giornaliero" utilizzabile una volta ogni 24h; crediti base (es. 50) + moltiplicatore streak.
- [x] Calcolo streak: giorni consecutivi con almeno login o claim daily bonus; aggiornare lastDailyBonus e streak su User; moltiplicatore (es. 1 + 0.1 per giorno, max 2x) applicato al daily bonus.
- [x] Pagina Missioni: titolo "Missioni", card streak "Serie: [N] giorni" e "Moltiplicatore bonus: x1.2", lista missioni daily e weekly con barra progresso e reward; empty "Nessuna missione attiva. Torna domani."
- [x] Pagina Leaderboard: tab periodo (settimana, mese, sempre) e filtro per categoria.
- [x] Tabella classifica: colonne Posizione, Utente, Accuratezza %, Serie, Punteggio (performance); link al profilo utente; tooltip "Punteggio basato su previsioni corrette e consistenza."
- [x] Gestire empty leaderboard: "Nessun dato per questo periodo."; opzionale mostrare "La tua posizione: N" se l'utente non è in top.

---

## Fase 5 – Wallet e Shop

- [x] Pagina Wallet: saldo in evidenza ("Crediti disponibili") con valore aggiornato.
- [x] Pulsante "Ritira bonus giornaliero" (o link alla stessa azione della homepage) con stato disabilitato + "Prossimo bonus domani" se già ritirato.
- [x] Storico transazioni: lista con tipo (Previsione, Risultato, Bonus giornaliero, Missione), importo (+/-), data, descrizione; paginazione.
- [x] Mostrare disclaimer crediti in Wallet: "I crediti sono virtuali e non hanno valore monetario. Non sono convertibili né prelevabili."
- [x] Empty state storico: "Nessuna transazione ancora."
- [x] Creare pagina Credit Shop (`/shop`) con disclaimer in alto: "Tutti gli acquisti usano crediti virtuali. I crediti non hanno valore reale e non sono prelevabili o convertibili."
- [x] Elenco prodotti da ShopItem: nome, prezzo in crediti, descrizione; in MVP solo prodotti acquistabili con crediti (nessun prezzo in euro).
- [x] Acquisto con crediti: verifica saldo, decremento crediti, creazione transazione e eventuale sblocco item (cosmetico/ticket); messaggio "Crediti insufficienti" se saldo < prezzo.
- [x] Empty state shop: "Nessun prodotto disponibile al momento."

---

## Fase 6 – Profilo e notifiche

- [x] Pagina Profilo: avatar, nome, username; statistiche (Previsioni, Accuratezza, Serie) da User.
- [x] Sezione badge: elenco badge sbloccati; empty "Completa missioni e previsioni per sbloccare badge."
- [x] Mostrare categorie seguite (o eventi seguiti) e link a Impostazioni.
- [x] Pagina Notifiche: titolo "Notifiche", lista con tipo (risoluzione evento, missione completata, streak a rischio), titolo, messaggio, data; link a evento/profilo dove applicabile.
- [x] Azione "Marca come lette" per singola notifica e "Tutte lette" per batch; aggiornare read/readAt.
- [x] Template notifiche in italiano: "L'evento [titolo] è stato risolto: [SÌ/NO].", "Missione completata: +[X] crediti.", "La tua serie è a rischio. Fai login per mantenerla."
- [x] Empty state notifiche: "Nessuna notifica."

---

## Fase 7 – Admin e Ops

- [x] Proteggere route `/admin` (e sotto-route): accesso solo per utenti con role ADMIN; redirect o 403 per altri.
- [x] Layout Admin: sidebar con voci Eventi, Moderazione, Audit, Dispute; area contenuto per tabelle/form.
- [x] Admin – Eventi: form crea/modifica evento con titolo, descrizione, categoria, closesAt, resolution_source_url (obbligatorio), resolution_notes (obbligatorio); salvataggio con createdById e scrittura in AuditLog.
- [x] Admin – Risoluzione: per evento chiuso, form con scelta outcome (SÌ/NO), conferma; chiamata a logica che calcola payout pool proporzionale, aggiorna User.credits, crea Transaction, invia Notification; scrivere azione in AuditLog.
- [x] Admin – Moderazione: coda commenti segnalati (o lista commenti con azioni); azioni "Nascondi" / "Elimina" con motivazione opzionale e scrittura in AuditLog.
- [x] Admin – Dispute: coda eventi in finestra dispute (es. 2h post-risoluzione); azioni Approva/Rifiuta/Correggi outcome; ogni azione tracciata in AuditLog.
- [x] Pagina o sezione Audit: tabella AuditLog (userId, action, entityType, entityId, payload, createdAt) con filtri e paginazione; sola lettura.

---

## Fase 8 – Abuse e analytics

- [x] Implementare invio eventi analytics: USER_SIGNUP, ONBOARDING_COMPLETE, EVENT_VIEWED, EVENT_FOLLOWED, PREDICTION_PLACED (amount, outcome, category), COMMENT_POSTED, REACTION_ADDED, EVENT_RESOLVED_VIEWED, MISSION_VIEWED, MISSION_COMPLETED, DAILY_BONUS_CLAIMED, LEADERBOARD_VIEWED, PROFILE_VIEWED, SHOP_VIEWED, SHOP_PURCHASED (item, price in credits).
- [x] Integrare provider analytics (Vercel Analytics, PostHog, o endpoint custom) e passare userId, sessionId, category, eventId, amount, period dove applicabile.
- [x] Verificare che il backend imponga una sola previsione per user per event (constraint DB + check in API) per evitare abusi.
- [x] Documentare o implementare controlli anti multi-account: rate limit signup per IP, eventuale flag per stesso device/fingerprint (opzionale per MVP).
- [x] Definire funnel in analytics: Signup → Onboarding complete → First prediction; D1/D7 return; Mission completion → Next session (dashboard o report).

Vedi **docs/ANALYTICS_AND_ABUSE.md** per dettagli su eventi, env, abuse e funnel.

---

## Fase 9 – Copy, legal e polish

- [ ] Revisionare tutte le pagine: headline, sottotitoli, CTA e pulsanti in italiano e in linea con il tono (professionale, nessun lessico scommesse).
- [ ] Verificare empty state e messaggi di errore su ogni pagina (es. "Qualcosa è andato storto. Riprova.", "Crediti insufficienti.", "Sessione scaduta. Accedi di nuovo.").
- [ ] Verificare tooltip onboarding (es. "Scegli un evento e fai la tua prima previsione.", "I crediti si vincono con previsioni corrette e missioni.", "Segui gli eventi per restare aggiornato.").
- [ ] Creare pagina o sezione Termini di servizio (`/legal/terms` o `/settings`): placeholder per età minima 18 anni, uso accettabile, crediti virtuali.
- [ ] Creare pagina Privacy policy (`/legal/privacy`): placeholder per dati raccolti, base giuridica, diritti utente (GDPR).
- [ ] Creare pagina Regole contenuti: "Contenuti vietati: insulti, spam, informazioni false. Le previsioni sono solo con crediti virtuali."
- [ ] Creare pagina Disclaimer crediti (`/legal/credits`): "I crediti sono valuta di gioco. Non hanno valore monetario, non sono prelevabili né convertibili in denaro o altri beni."
- [ ] Verifica accessibilità: contrasto testo/sfondo ≥ 4.5:1, touch target ≥ 44px, focus visibile su elementi interattivi, label per form.
- [ ] Verifica responsive: layout mobile-first, breakpoint 360px, 768px, 1024px; griglia e spaziatura coerenti.
