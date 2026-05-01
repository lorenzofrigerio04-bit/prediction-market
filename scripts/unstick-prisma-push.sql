-- Sblocca `npx prisma db push` su Neon/Postgres in casi tipici di drift.
--
-- 1) BADGES — "ERROR: relation badges_code_key already exists"
-- Il vincolo univoco era già stato creato ma Prisma prova ancora CREATE.
DROP INDEX IF EXISTS "badges_code_key";
DROP INDEX IF EXISTS public.badges_code_key;
ALTER TABLE public.badges DROP CONSTRAINT IF EXISTS badges_code_key CASCADE;
--
-- 2) Colonne registrazione pending (se mai non applicate)
ALTER TABLE verification_tokens ADD COLUMN IF NOT EXISTS pending_password_hash TEXT;
ALTER TABLE verification_tokens ADD COLUMN IF NOT EXISTS pending_name TEXT;
--
-- 3) SESSION — "violates foreign key constraint sessions_user_id_fkey" durante push
DELETE FROM sessions
WHERE NOT EXISTS (
  SELECT 1 FROM users u WHERE u.id = sessions.user_id
);
--
-- Poi: npx prisma db push
