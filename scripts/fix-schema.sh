#!/bin/bash

# Script per aggiungere model User e relazione Notification allo schema Prisma
# Esegui: bash scripts/fix-schema.sh

echo "🔍 Cercando schema Prisma esistente..."

# Trova tutti gli schema Prisma (escludendo node_modules)
SCHEMA_FILES=$(find . -name "*.prisma" -type f ! -path "*/node_modules/*" ! -path "*/.prisma/*")

if [ -z "$SCHEMA_FILES" ]; then
    echo "❌ Nessuno schema Prisma trovato!"
    exit 1
fi

echo "📁 File schema trovati:"
echo "$SCHEMA_FILES"
echo ""

# Cerca schema principale (quello con generator e datasource)
MAIN_SCHEMA=""
for file in $SCHEMA_FILES; do
    if grep -q "^generator\|^datasource" "$file" 2>/dev/null; then
        MAIN_SCHEMA="$file"
        echo "✅ Schema principale trovato: $file"
        break
    fi
done

if [ -z "$MAIN_SCHEMA" ]; then
    # Se non trova schema con generator, usa il primo
    MAIN_SCHEMA=$(echo "$SCHEMA_FILES" | head -1)
    echo "⚠️  Usando il primo schema trovato: $MAIN_SCHEMA"
fi

echo ""
echo "📝 Verificando model User..."

# Verifica se esiste già model User
if grep -q "^model User" "$MAIN_SCHEMA" 2>/dev/null; then
    echo "✅ Model User trovato!"
    
    # Verifica se ha già la relazione notifications
    if grep -q "notifications Notification" "$MAIN_SCHEMA" 2>/dev/null; then
        echo "✅ Relazione notifications già presente!"
        echo ""
        echo "🎉 Schema già configurato correttamente!"
    else
        echo "⚠️  Model User trovato ma manca relazione notifications"
        echo ""
        echo "📋 Devi aggiungere manualmente questa riga al model User:"
        echo "   notifications Notification[]"
        echo ""
        echo "Apri il file: $MAIN_SCHEMA"
        echo "Trova il model User e aggiungi la riga sopra."
    fi
else
    echo "❌ Model User NON trovato!"
    echo ""
    echo "📋 Devi aggiungere manualmente il model User allo schema."
    echo ""
    echo "Aggiungi questo al file: $MAIN_SCHEMA"
    echo ""
    cat << 'EOF'
model User {
  id            String    @id @default(cuid())
  email         String?   @unique
  name          String?
  emailVerified DateTime?
  image         String?
  streakCount   Int       @default(0)
  credits       Int       @default(100)
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt

  // Relazione con Notification
  notifications Notification[]

  // Aggiungi qui altre relazioni esistenti (predictions, events, etc.)
}
EOF
    echo ""
fi

echo ""
echo "📋 Prossimi passi:"
echo "1. Apri $MAIN_SCHEMA"
echo "2. Assicurati che ci sia il model User con la relazione notifications Notification[]"
echo "3. Esegui: npx prisma migrate dev --name add_notifications"
echo ""
