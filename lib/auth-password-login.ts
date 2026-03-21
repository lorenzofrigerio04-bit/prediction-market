import { randomUUID } from 'crypto';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { AUTH_SESSION_MAX_AGE_SECONDS } from '@/lib/auth-session-cookie';

/**
 * Verifica email/password e crea una riga `Session` (stesso flusso di OAuth con adapter DB).
 * Necessario perché NextAuth Credentials + `strategy: "database"` emette ancora JWT incompatibile con `pm.sid`.
 */
export async function createDbSessionForPasswordLogin(
  email: string,
  password: string
): Promise<{ sessionToken: string } | null> {
  const normalized = email.trim();
  const user = await prisma.user.findUnique({
    where: { email: normalized },
    select: { id: true, password: true },
  });
  if (!user?.password) {
    return null;
  }
  const ok = await bcrypt.compare(password, user.password);
  if (!ok) {
    return null;
  }
  const sessionToken = randomUUID();
  const expires = new Date(Date.now() + AUTH_SESSION_MAX_AGE_SECONDS * 1000);
  await prisma.session.create({
    data: {
      sessionToken,
      userId: user.id,
      expires,
    },
  });
  return { sessionToken };
}
