# Prediction Market

Piattaforma italiana di previsioni sociali con crediti virtuali.

## Setup Iniziale

1. **Installa le dipendenze**:
   ```bash
   npm install
   ```

2. **Configura il database**:
   - Crea un file `.env` copiando `.env.example`
   - Modifica `DATABASE_URL` con le tue credenziali PostgreSQL
   - Esegui le migrazioni:
     ```bash
     npm run db:generate
     npm run db:push
     ```
   - Popola il database con dati di esempio:
     ```bash
     npm run db:seed
     ```
     Questo creerà un utente admin e 3 eventi generici per testare l'applicazione.

3. **Avvia il server di sviluppo**:
   ```bash
   npm run dev
   ```

4. Apri [http://localhost:3000](http://localhost:3000) nel browser.

## Deploy su Vercel – Passi da fare tu

Per **Google Login** e **variabili d’ambiente su Vercel**, segui la guida:

- **[docs/PASSI_DA_FARE.md](docs/PASSI_DA_FARE.md)** – cosa fare su Vercel e Google Cloud; cosa scrivere in chat quando hai finito o quando cambi dominio/database.

Riferimento variabili: `.env.example`.

## Script Disponibili

- `npm run dev` - Avvia il server di sviluppo
- `npm run build` - Crea la build di produzione
- `npm run start` - Avvia il server di produzione
- `npm run lint` - Esegue il linter
- `npm run db:generate` - Genera il Prisma Client
- `npm run db:push` - Sincronizza lo schema con il database
- `npm run db:migrate` - Crea una nuova migrazione
- `npm run db:studio` - Apre Prisma Studio
- `npm run db:seed` - Popola il database con dati di esempio (admin + 3 eventi)

## Sistema di Risoluzione Eventi

Il sistema gestisce automaticamente gli eventi chiusi:

### Funzionalità Automatiche

1. **Risoluzione Automatica**: Quando un evento chiude (`closesAt` < ora), viene automaticamente processato quando la homepage viene caricata
2. **Calcolo Payout**: Le previsioni vincenti ricevono crediti proporzionali alla loro scommessa
3. **Aggiornamento Statistiche**: Accuracy, totalEarned, totalSpent vengono aggiornati automaticamente
4. **Esclusione dalla Homepage**: Gli eventi risolti non appaiono più nella homepage

### API Endpoints

- `POST /api/events/resolve-closed` - Processa tutti gli eventi chiusi automaticamente
- `POST /api/events/resolve/[eventId]` - Risolve manualmente un evento specifico
  ```json
  { "outcome": "YES" | "NO" }
  ```
- `GET /api/cron/resolve-events` - Endpoint per cron job esterni (richiede `CRON_SECRET`)

### Come Funziona

1. Quando un evento chiude, viene trovato dalla query `closesAt <= now AND resolved = false`
2. L'outcome viene determinato automaticamente (maggioranza crediti) o manualmente (admin)
3. Le previsioni vincenti ricevono: `payout = credits_investiti * (totalCredits / credits_lato_vincente)`
4. I crediti vengono aggiunti agli utenti vincenti
5. Le statistiche (accuracy, correctPredictions) vengono aggiornate
6. Le transazioni vengono registrate nel wallet

### Configurazione Cron Job (Produzione)

Per chiamare automaticamente la risoluzione ogni minuto:

```bash
# Vercel Cron
# vercel.json
{
  "crons": [{
    "path": "/api/cron/resolve-events",
    "schedule": "*/1 * * * *"
  }]
}

# GitHub Actions / Altri servizi
# Chiama GET /api/cron/resolve-events con header:
# Authorization: Bearer YOUR_CRON_SECRET
```

## Prossimi Step

Vedi il file `roadmap_gioco_previsioni_*.plan.md` per la roadmap completa.
