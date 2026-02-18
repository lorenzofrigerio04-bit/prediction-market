# Verifica Foreign Keys verso Event

## Obiettivo

Verificare che tutte le Foreign Keys (FK) verso la tabella `Event` abbiano `onDelete: Cascade` sia nello schema Prisma che nel database.

## FK Verificate

Le seguenti FK verso `Event` sono state verificate:

1. **Comment.event** → `Event.id`
   - Tabella: `comments`
   - Colonna: `eventId`
   - Schema Prisma: ✅ `onDelete: Cascade` (riga 135)
   - Database: ✅ Verificabile con script

2. **Prediction.event** → `Event.id`
   - Tabella: `predictions`
   - Colonna: `eventId`
   - Schema Prisma: ✅ `onDelete: Cascade` (riga 181)
   - Database: ✅ Verificabile con script

3. **EventFollower.event** → `Event.id`
   - Tabella: `event_followers`
   - Colonna: `eventId`
   - Schema Prisma: ✅ `onDelete: Cascade` (riga 258)
   - Database: ✅ Verificabile con script

## Verifica Schema Prisma

Tutte le FK verso Event nello schema Prisma (`prisma/schema.prisma`) hanno `onDelete: Cascade`:

```prisma
// Comment.event
event Event @relation(fields: [eventId], references: [id], onDelete: Cascade)

// Prediction.event
event Event @relation(fields: [eventId], references: [id], onDelete: Cascade)

// EventFollower.event
event Event @relation(fields: [eventId], references: [id], onDelete: Cascade)
```

## Verifica Database

Per verificare che lo schema sia correttamente applicato al database, eseguire:

```bash
npm run verify-fk
```

Lo script `scripts/verify-prisma-fk.ts`:
- Verifica lo schema Prisma (lettura statica)
- Interroga il database PostgreSQL per verificare le FK reali
- Controlla che tutte le FK abbiano `ON DELETE CASCADE`
- Fornisce un report dettagliato

## Risultato

✅ **Tutte le FK verso Event hanno `onDelete: Cascade` nello schema Prisma**

⚠️ **Verifica database**: Eseguire `npm run verify-fk` per confermare che lo schema sia applicato correttamente.

## Note

- Le FK con `onDelete: Cascade` garantiscono che quando un Event viene eliminato, tutti i record correlati (Comment, Prediction, EventFollower) vengono eliminati automaticamente.
- Questo è essenziale per mantenere l'integrità referenziale del database.
- Se lo script di verifica rileva discrepanze, eseguire `npm run db:push` o `npm run db:migrate` per sincronizzare lo schema.
