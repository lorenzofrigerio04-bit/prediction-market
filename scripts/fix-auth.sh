#!/bin/bash

# Script per trovare e configurare authOptions
# Esegui: bash scripts/fix-auth.sh

echo "🔍 Cercando configurazione next-auth esistente..."

# Cerca file che potrebbero contenere authOptions
AUTH_FILES=$(find . -type f \( -name "*auth*.ts" -o -name "*auth*.tsx" -o -name "*nextauth*.ts" \) ! -path "*/node_modules/*" ! -path "*/.next/*")

if [ -z "$AUTH_FILES" ]; then
    echo "⚠️  Nessun file auth trovato"
    echo ""
    echo "📋 Devi configurare authOptions manualmente in lib/auth.ts"
    exit 0
fi

echo "📁 File auth trovati:"
echo "$AUTH_FILES"
echo ""

# Cerca export authOptions
for file in $AUTH_FILES; do
    if grep -q "export.*authOptions\|authOptions.*=" "$file" 2>/dev/null; then
        echo "✅ Configurazione authOptions trovata in: $file"
        echo ""
        echo "📝 Contenuto rilevante:"
        grep -A 10 "authOptions" "$file" | head -15
        echo ""
        echo "💡 Aggiorna lib/auth.ts per importare da questo file:"
        echo "   import { authOptions } from '$(echo $file | sed 's|^\./||' | sed 's|\.ts$||' | sed 's|\.tsx$||')';"
        echo "   export { authOptions };"
        echo ""
        break
    fi
done

echo ""
echo "📋 Se non trovi authOptions, configura manualmente lib/auth.ts con:"
echo "   - providers (Google, Credentials, etc.)"
echo "   - callbacks.session per aggiungere userId"
echo ""
