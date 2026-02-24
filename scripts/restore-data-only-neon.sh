#!/usr/bin/env bash
# Copia SOLO i dati da un progetto Neon (America) a un altro (EU).
# Lo schema sul DB destinazione deve già esistere (es. creato con prisma db push).
# Uso: bash scripts/restore-data-only-neon.sh "URL_AMERICA_SENZA_POOLER" "URL_EU_SENZA_POOLER"

set -e

OLD_URL="${1:?Fornisci URL database SORGENTE (America, senza pooler)}"
NEW_URL="${2:?Fornisci URL database DESTINAZIONE (EU, senza pooler)}"

DUMP_FILE="${DUMP_FILE:-neon-data-only.bak}"

echo "--- Dump dati (solo dati) da America ---"
pg_dump -Fc --data-only -v -d "$OLD_URL" -f "$DUMP_FILE" || { echo "pg_dump fallito."; exit 1; }

echo ""
echo "--- Restore dati su EU ---"
pg_restore -v -O --data-only -d "$NEW_URL" "$DUMP_FILE" || true

echo ""
echo "Fatto. Verifica con: npx tsx scripts/check-db-events.ts"
