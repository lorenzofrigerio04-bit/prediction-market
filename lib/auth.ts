/**
 * Helper per autenticazione nelle API routes
 * 
 * Questo file esporta authOptions che viene già usato in app/layout.tsx
 * Se hai già una configurazione next-auth esistente, aggiorna questo file
 * per importarla invece del placeholder.
 */

// Workaround per "unable to get local issuer certificate" con Login con Google in sviluppo
// (es. proxy aziendale, certificati di sistema mancanti). Solo in dev e solo se esplicitamente abilitato.
if (
  process.env.NODE_ENV === 'development' &&
  process.env.NEXTAUTH_INSECURE_SSL_DEV === '1'
) {
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
}

import { getServerSession } from 'next-auth';
import type { NextAuthOptions, Account } from 'next-auth';
import type { AdapterUser } from 'next-auth/adapters';
import GoogleProvider from 'next-auth/providers/google';
import { PrismaAdapter } from '@next-auth/prisma-adapter';
import { prisma } from '@/lib/prisma';
import {
  getSessionTokenCookieName,
  AUTH_SESSION_MAX_AGE_SECONDS,
  useSecureAuthCookie,
} from '@/lib/auth-session-cookie';

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID ?? '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? '',
      allowDangerousEmailAccountLinking: true,
    }),
    /**
     * Login email/password: non usiamo CredentialsProvider qui.
     * Con `session: { strategy: "database" }`, NextAuth per le credenziali emette ancora un JWT
     * (`next-auth.session-token`), mentre il middleware e la purge accettano solo `pm.sid` (sessione DB).
     * Vedi `POST /api/auth/login-credentials`.
     */
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      if (account?.provider === 'google' && user.email) {
        const existingUser = await prisma.user.findUnique({
          where: { email: user.email },
          include: { accounts: true },
        });

        if (existingUser) {
          const hasGoogleAccount = existingUser.accounts.some(
            (acc) => acc.provider === 'google'
          );

          if (!hasGoogleAccount && account) {
            await prisma.account.create({
              data: {
                userId: existingUser.id,
                type: account.type,
                provider: account.provider,
                providerAccountId: account.providerAccountId,
                access_token: account.access_token,
                refresh_token: account.refresh_token,
                expires_at: account.expires_at,
                token_type: account.token_type,
                scope: account.scope,
                id_token: account.id_token,
                session_state: account.session_state as string | undefined,
              },
            });

            if (profile && 'picture' in profile && !existingUser.image) {
              await prisma.user.update({
                where: { id: existingUser.id },
                data: { image: profile.picture as string },
              });
            }
          }

          (user as AdapterUser).id = existingUser.id;
        }
      }
      return true;
    },
    // Session strategy: database — cookie con solo sessionToken (piccolo). Evita JWT grossi o
    // cookie frammentati (.0, .1, …) che superano il limite header Vercel (494) su mobile/Safari.
    session: async ({ session, user }) => {
      if (session.user && user) {
        session.user.id = user.id;
        session.user.email = user.email ?? '';
        session.user.name = user.name ?? null;
        session.user.image = user.image ?? null;
        const u = user as { role?: string | null };
        session.user.role = u.role ?? undefined;
        session.user.emailVerified = user.emailVerified ?? null;
      }
      return session;
    },
  },
  pages: {
    signIn: '/auth/login',
    error: '/auth/login', // così gli errori di login mostrano la pagina di login invece della generica "Error"
  },
  session: {
    strategy: 'database',
    maxAge: AUTH_SESSION_MAX_AGE_SECONDS,
    updateAge: 24 * 60 * 60,
  },
  /** Nome cookie dedicato: evita conflitto con JWT legacy; accoppiato a purge nel middleware. */
  cookies: {
    sessionToken: {
      name: getSessionTokenCookieName(),
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: useSecureAuthCookie(),
      },
    },
  },
  secret: process.env.NEXTAUTH_SECRET || process.env.AUTH_SECRET,
};

/**
 * Ottiene l'utente autenticato dalla sessione
 * Usa questo helper nelle API routes per ottenere userId
 */
export async function getCurrentUser() {
  try {
    const session = await getServerSession(authOptions);
    return session?.user;
  } catch (error) {
    console.error('Error getting current user:', error);
    return null;
  }
}

/**
 * Ottiene userId dalla sessione, ritorna null se non autenticato
 */
export async function getUserId(): Promise<string | null> {
  const user = await getCurrentUser();
  // Usa il tipo definito in types/next-auth.d.ts che include id
  return user?.id || null;
}
