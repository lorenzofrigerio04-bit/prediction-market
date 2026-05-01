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
import type { NextAuthOptions } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import { prisma } from '@/lib/prisma';
import { createAuthAdapter } from '@/lib/prisma-auth-adapter';
import { readOAuthIntentFromRequest } from '@/lib/oauth-intent-cookie';
import {
  getSessionTokenCookieName,
  AUTH_SESSION_MAX_AGE_SECONDS,
  useSecureAuthCookie,
} from '@/lib/auth-session-cookie';
import { sendWelcomeEmail } from '@/lib/email';

export const authOptions: NextAuthOptions = {
  adapter: createAuthAdapter(prisma),
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
    /**
     * Google da «Accedi»: solo utenti già presenti (account Google o email già registrata).
     * Nuova iscrizione con Google solo da «Registrati» (cookie impostato da /api/auth/oauth-intent).
     */
    async signIn({ user, account, profile }) {
      if (account?.provider !== 'google' || !account.providerAccountId) {
        return true;
      }

      const existingAccount = await prisma.account.findUnique({
        where: {
          provider_providerAccountId: {
            provider: 'google',
            providerAccountId: account.providerAccountId,
          },
        },
        select: { id: true },
      });
      if (existingAccount) return true;

      const profileEmail =
        profile &&
        typeof profile === 'object' &&
        'email' in profile &&
        typeof (profile as { email?: string }).email === 'string'
          ? (profile as { email: string }).email.trim().toLowerCase()
          : typeof user?.email === 'string'
            ? user.email.trim().toLowerCase()
            : null;

      if (profileEmail) {
        const existingUser = await prisma.user.findFirst({
          where: { email: { equals: profileEmail, mode: 'insensitive' } },
          select: { id: true },
        });
        if (existingUser) return true;
      }

      const intent = await readOAuthIntentFromRequest();
      if (intent === 'signup') return true;

      return false;
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
        try {
          const row = await prisma.user.findUnique({
            where: { id: user.id },
            select: { creditsWelcomeDismissedAt: true },
          });
          session.user.showCreditsWelcome = !row?.creditsWelcomeDismissedAt;
        } catch {
          session.user.showCreditsWelcome = false;
        }
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
  events: {
    /**
     * NextAuth invoca `createUser` anche quando si collega Google a un utente già esistente
     * (email uguale + allowDangerousEmailAccountLinking). In quel caso NON va reinviata la welcome.
     * Si invia solo se la riga `users` è appena stata creata dall’adapter (prima registrazione OAuth).
     */
    async createUser({ user }) {
      const email = typeof user.email === 'string' ? user.email.trim() : '';
      if (!email || !user.id) return;
      try {
        const row = await prisma.user.findUnique({
          where: { id: user.id },
          select: { createdAt: true },
        });
        if (!row) return;
        const ageMs = Date.now() - row.createdAt.getTime();
        if (ageMs > 5 * 60 * 1000) return;
      } catch (v) {
        console.warn('[auth.events.createUser] skip welcome guard', v);
        return;
      }
      sendWelcomeEmail(email, user.name ?? null, { reason: 'oauth_google' }).catch((e) =>
        console.error('[auth.events.createUser] welcome email', e)
      );
    },
    async linkAccount({ user, profile }) {
      const image =
        profile &&
        typeof profile === 'object' &&
        'image' in profile &&
        typeof (profile as { image?: string }).image === 'string'
          ? (profile as { image: string }).image.trim()
          : '';
      if (!image) return;
      try {
        const row = await prisma.user.findUnique({
          where: { id: user.id },
          select: { image: true },
        });
        if (row?.image) return;
        await prisma.user.update({
          where: { id: user.id },
          data: { image },
        });
      } catch (e) {
        console.warn("[auth.events.linkAccount] sync profile image", e);
      }
    },
    /**
     * Dopo OAuth, assicura email su `users` (alcuni flussi lasciano email solo sul profile;
     * senza email la riga esiste ma l’admin e le ricerche “per email” sembrano vuote).
     */
    async signIn({ user, account, profile }) {
      if (account?.provider !== 'google' || !user?.id) return;
      const profileEmail =
        profile &&
        typeof profile === 'object' &&
        'email' in profile &&
        typeof (profile as { email?: string }).email === 'string'
          ? (profile as { email: string }).email.trim()
          : null;
      if (!profileEmail) return;

      try {
        const row = await prisma.user.findUnique({
          where: { id: user.id },
          select: { email: true },
        });
        if (row?.email && row.email.trim() !== '') return;

        await prisma.user.update({
          where: { id: user.id },
          data: { email: profileEmail, emailVerified: new Date() },
        });
      } catch (e) {
        console.warn('[auth.events.signIn] sync google email', e);
      }
    },
  },
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
