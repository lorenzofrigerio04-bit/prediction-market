-- Aggiunge la colonna hidden alla tabella events (senza toccare altre tabelle).
-- Esegui con: npx prisma db execute --file prisma/add-hidden-column.sql

ALTER TABLE events ADD COLUMN IF NOT EXISTS hidden BOOLEAN NOT NULL DEFAULT false;
CREATE INDEX IF NOT EXISTS idx_events_hidden ON events(hidden);
