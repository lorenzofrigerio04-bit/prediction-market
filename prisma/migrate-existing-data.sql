-- Script SQL per aggiornare dati esistenti dopo la migration
-- Eseguire DOPO aver fatto `npx prisma db push` o `npx prisma migrate deploy`
-- 
-- IMPORTANTE: Eseguire questo script manualmente sul database dopo la migration
-- oppure integrarlo nella migration Prisma

-- 1. Copia credits in amount per tutte le predictions esistenti dove amount è 0 o NULL
UPDATE predictions 
SET amount = credits 
WHERE amount = 0 OR amount IS NULL;

-- 2. Aggiorna type per shop_items esistenti (se non già impostato correttamente)
-- Verifica prima quali type esistono già:
-- SELECT DISTINCT type FROM shop_items;
-- Poi aggiorna solo quelli che sono NULL o vuoti:
UPDATE shop_items 
SET type = 'CREDIT_BUNDLE' 
WHERE type IS NULL OR type = '';

-- 3. updatedAt per events e predictions viene gestito automaticamente da Prisma (@updatedAt)
-- Le righe esistenti avranno updatedAt = createdAt (dal default now()) che è corretto

-- 4. Verifica che amount e credits siano sincronizzati (dovrebbero essere sempre uguali)
-- Questo è un check di sicurezza:
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM predictions 
    WHERE amount != credits AND amount IS NOT NULL AND credits IS NOT NULL
  ) THEN
    RAISE NOTICE 'ATTENZIONE: Trovate predictions con amount != credits. Verificare manualmente.';
  END IF;
END $$;
