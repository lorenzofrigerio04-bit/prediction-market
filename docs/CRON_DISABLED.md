# Cron disabilitati (modalità whitelabel)

Tutti i cron sono stati **disabilitati** per permettere di lavorare sulla struttura e sulle funzioni specifiche in futuro.

## Cron rimossi da `vercel.json`

| Cron | Era | Scopo |
|------|-----|-------|
| `resolve-events` | 00:00 UTC | Risoluzione eventi scaduti |
| `auto-resolve` | ogni 15 min | Auto-risoluzione eventi |
| `generate-events` | 08:00, 20:00 UTC | Pipeline BLOCCO 5 (news/storylines → eventi) |
| `generate-markets` | 00:05, ogni 30 min | Generazione mercati da storylines |
| `simulate-activity` | ogni ora :30 | Attività bot (previsioni, commenti, post) |
| `generate-post-images` | ogni ora :15 | Generazione immagini AI per post |
| `generate-odds-events` | ogni 6 ore | Pipeline eventi da The Odds API |
| `aggregate-metrics` | ogni ora | Aggregazione metriche |
| `ingest` | ogni ora :10 | Ingestione news (alimenta pipeline) |

## Come riattivare

Aggiungere di nuovo i cron in `vercel.json` quando necessario.

## Struttura whitelabel prevista

L'obiettivo è avere un workflow di generazione standard che possa essere adattato a:
- The Odds API (attuale)
- API di bookmaker futuri (eventi + quote forniti da loro)

La pipeline in `lib/odds-event-generation/` è pensata come primo prototipo; la struttura dovrà essere generalizzata per supportare più provider.
