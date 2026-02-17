# 🔄 ISTRUZIONI MIGRATION DATABASE

**Data:** 2026-02-17  
**Problema:** Il database ha dati esistenti e Prisma non può aggiungere colonne required senza default.

---

## ✅ PREPARAZIONE COMPLETATA

Ho già modificato lo schema Prisma per:
1. ✅ Aggiungere default temporanei alle colonne required (`updatedAt`, `amount`, `type`)
2. ✅ Aggiungere colonne legacy (`probability`, `yesCredits`, ecc.) per preservare dati esistenti
3. ✅ Creare script SQL per aggiornare dati dopo migration

---

## 📋 PROCEDURA MIGRATION

### Passo 1: Eseguire la migration

```bash
cd /Users/lorenzofrigerio/Desktop/prediction-market
npx prisma db push --accept-data-loss
```

**Nota:** `--accept-data-loss` è necessario perché alcune colonne legacy verranno eliminate (ma sono già nello schema come opzionali, quindi non verranno eliminate).

### Passo 2: Aggiornare i dati esistenti

Dopo la migration, eseguire lo script SQL sul database:

```bash
# Opzione 1: Usando psql direttamente
psql $DATABASE_URL -f prisma/migrate-existing-data.sql

# Opzione 2: Usando Prisma Studio o un client SQL
# Aprire prisma/migrate-existing-data.sql e eseguire le query manualmente
```

**Oppure** eseguire le query manualmente sul database:

```sql
-- 1. Copia credits in amount per predictions esistenti
UPDATE predictions 
SET amount = credits 
WHERE amount = 0 OR amount IS NULL;

-- 2. Aggiorna type per shop_items esistenti
UPDATE shop_items 
SET type = 'CREDIT_BUNDLE' 
WHERE type IS NULL OR type = '';

-- 3. Verifica sincronizzazione amount/credits
SELECT COUNT(*) as mismatches 
FROM predictions 
WHERE amount != credits AND amount IS NOT NULL AND credits IS NOT NULL;
-- Se restituisce > 0, verificare manualmente
```

### Passo 3: Verificare la migration

```bash
# Rigenerare Prisma Client
npx prisma generate

# Verificare che lo schema sia sincronizzato
npx prisma db pull --print
```

---

## 🔍 COSA FA LO SCRIPT SQL

1. **Predictions.amount**: Copia il valore da `credits` a `amount` per tutte le righe dove `amount` è 0 o NULL
2. **ShopItem.type**: Imposta `CREDIT_BUNDLE` come default per item esistenti senza type
3. **Check sicurezza**: Verifica che `amount` e `credits` siano sincronizzati

---

## ⚠️ COLONNE LEGACY PRESERVATE

Le seguenti colonne sono state aggiunte allo schema come **opzionali** per preservare i dati esistenti:

**Event:**
- `probability`, `yesCredits`, `noCredits`, `totalCredits`
- `yesPredictions`, `noPredictions`
- `q_yes`, `q_no`, `p_init` (LMSR)
- `realWorldEventTime`, `resolutionTimeExpected`

**Notification:**
- `message` (legacy, i messaggi sono ora generati da `type` + `data`)

Queste colonne possono essere rimosse in futuro quando il codice non le usa più.

---

## 🎯 DOPO LA MIGRATION

1. ✅ Eseguire `npx prisma generate` per rigenerare il client
2. ✅ Testare le API che usano i nuovi modelli (Mission, ShopItem, UserMission)
3. ✅ Verificare che le predictions abbiano `amount` = `credits`
4. ✅ Verificare che lo shop funzioni correttamente

---

## 📝 NOTE

- I default temporanei (`@default(now())` per `updatedAt`, `@default(0)` per `amount`, `@default("CREDIT_BUNDLE")` per `type`) possono essere rimossi dopo la migration se preferisci, ma non è necessario.
- Le colonne legacy possono essere rimosse in futuro quando il codice non le usa più.
