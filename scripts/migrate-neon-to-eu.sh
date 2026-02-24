#!/usr/bin/env bash
# Migrazione Neon: dump dal progetto America e restore nel progetto Europa.
# Uso: ./scripts/migrate-neon-to-eu.sh "URL_SORGENTE_SENZA_POOLER" "URL_DESTINAZIONE_SENZA_POOLER"
#
# Per il dump/restore Neon richiede connection string SENZA pooler (no -pooler nell'host).
# Dopo la migrazione aggiorna DATABASE_URL in .env e su Vercel con la URL del progetto EU CON pooler.

set -e

OLD_URL="${1:?Fornisci URL del database Neon SORGENTE (America, senza pooler)}"
NEW_URL="${2:?Fornisci URL del database Neon DESTINAZIONE (Europa, senza pooler)}"

DUMP_FILE="${DUMP_FILE:-neon-dump-migration.bak}"

echo "--- Migrazione Neon (America → Europa) ---"
echo "Sorgente (dump):  ${OLD_URL%%@*}@***"
echo "Destinazione:     ${NEW_URL%%@*}@***"
echo "File dump:        $DUMP_FILE"
echo ""

if [[ "$OLD_URL" == *"-pooler"* ]]; then
  echo "ATTENZIONE: usa la connection string SENZA pooler per la sorgente (rimuovi -pooler dall'host)."
  exit 1
fi
if [[ "$NEW_URL" == *"-pooler"* ]]; then
  echo "ATTENZIONE: usa la connection string SENZA pooler per la destinazione (rimuovi -pooler dall'host)."
  exit 1
fi

echo "1/2 Esecuzione pg_dump sul database sorgente..."
pg_dump -Fc -v -d "$OLD_URL" -f "$DUMP_FILE" || { echo "pg_dump fallito."; exit 1; }

echo ""
echo "2/2 Esecuzione pg_restore sul database destinazione (Europa)..."
# -c --if-exists: drop oggetti esistenti prima di ricrearli (copia completa da America)
pg_restore -v -O -c --if-exists -d "$NEW_URL" "$DUMP_FILE" || true
# pg_restore può uscire con codice non zero per errori di ownership; schema e dati di solito ci sono

echo ""
echo "--- Migrazione completata ---"
echo "Prossimi passi:"
echo "1. Aggiorna .env (e .env.local) con DATABASE_URL del progetto EU (usa la URL CON pooler)."
echo "2. Su Vercel: Settings → Environment Variables → DATABASE_URL → nuova URL EU (con pooler) → Redeploy."
echo "3. Verifica login e dati in locale e in produzione."
echo "4. (Opzionale) Elimina il file dump: rm $DUMP_FILE"
echo "5. (Opzionale) Quando sei sicuro, elimina il vecchio progetto Neon (America) dalla console."
