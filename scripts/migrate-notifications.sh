#!/bin/bash

# Script per eseguire la migrazione Prisma per le notifiche
# Esegui: bash scripts/migrate-notifications.sh

echo "🚀 Eseguendo migrazione Prisma per le notifiche..."

# Verifica che Prisma sia installato
if ! command -v npx &> /dev/null; then
    echo "❌ Errore: npx non trovato. Assicurati di avere Node.js installato."
    exit 1
fi

# Verifica che il file schema.prisma esista
if [ ! -f "prisma/schema.prisma" ]; then
    echo "⚠️  Attenzione: prisma/schema.prisma non trovato."
    echo "📝 Assicurati di aver aggiunto il model Notification al tuo schema Prisma esistente."
    echo ""
    echo "Aggiungi questo model al tuo schema:"
    echo ""
    cat << 'EOF'
model Notification {
  id        String   @id @default(cuid())
  userId    String
  type      String   // EVENT_CLOSING_SOON | EVENT_RESOLVED | RANK_UP | STREAK_RISK
  data      Json     // Dati aggiuntivi
  readAt    DateTime?
  createdAt DateTime @default(now())

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId])
  @@index([userId, readAt])
  @@index([createdAt])
}
EOF
    echo ""
    echo "E aggiungi questa relazione al model User:"
    echo "  notifications Notification[]"
    echo ""
    read -p "Premi INVIO quando hai aggiunto il model allo schema..."
fi

# Esegui la migrazione
echo "📦 Generando migrazione..."
npx prisma migrate dev --name add_notifications

if [ $? -eq 0 ]; then
    echo "✅ Migrazione completata con successo!"
    echo ""
    echo "📋 Prossimi passi:"
    echo "1. Verifica che la tabella Notification sia stata creata nel database"
    echo "2. Testa le API routes delle notifiche"
    echo "3. Verifica che l'autenticazione funzioni correttamente"
else
    echo "❌ Errore durante la migrazione."
    echo "💡 Suggerimento: Se usi db push invece di migrate, esegui:"
    echo "   npx prisma db push"
    exit 1
fi
