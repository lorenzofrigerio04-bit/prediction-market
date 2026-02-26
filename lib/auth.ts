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
import CredentialsProvider from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';
import { PrismaAdapter } from '@next-auth/prisma-adapter';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID ?? '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? '',
      allowDangerousEmailAccountLinking: true,
    }),
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        try {
          if (!credentials?.email || !credentials?.password) {
            return null;
          }
          
          let user;
          try {
            user = await prisma.user.findUnique({
              where: { email: credentials.email },
              select: { id: true, email: true, name: true, password: true, role: true },
            });
          } catch (dbError: any) {
            if (dbError?.code === 'P2022' || dbError?.code === 'P2021' || 
                dbError?.message?.includes('does not exist') || 
                dbError?.message?.includes('password')) {
              console.error('[CredentialsProvider] Database schema non aggiornato:', dbError);
              user = await prisma.user.findUnique({
                where: { email: credentials.email },
                select: { id: true, email: true, name: true, role: true },
              });
              if (user) {
                throw new Error('Database non configurato: esegui "npx prisma migrate deploy" e "npx prisma db seed"');
              }
            }
            throw dbError;
          }
          
          if (!user) {
            return null;
          }
          
          if (!user.password) {
            return null;
          }
          
          const ok = await bcrypt.compare(credentials.password, user.password);
          if (!ok) {
            return null;
          }
          
          return { id: user.id, email: user.email ?? '', name: user.name ?? null, image: null };
        } catch (error: any) {
          console.error('[CredentialsProvider] Errore durante authorize:', error);
          if (error?.message && error.message.includes('Database non configurato')) {
            throw error;
          }
          return null;
        }
      },
    }),
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
    session: async ({ session, token }) => {
      // IMPORTANTE: Aggiunge userId e role alla session
      if (session.user && token.sub) {
        (session.user as any).id = token.sub;
        // Aggiunge role dal token alla session
        if (token.role) {
          (session.user as any).role = token.role;
        } else {
          // Fallback: recupera role dal database se non presente nel token
          const user = await prisma.user.findUnique({
            where: { id: token.sub },
            select: { role: true },
          });
          if (user?.role) {
            (session.user as any).role = user.role;
          }
        }
      }
      return session;
    },
    jwt: async ({ token, user }) => {
      // Aggiunge userId e role al token quando l'utente fa login
      if (user) {
        token.sub = user.id;
        // Recupera role dal database
        const dbUser = await prisma.user.findUnique({
          where: { id: user.id },
          select: { role: true },
        });
        if (dbUser?.role) {
          token.role = dbUser.role;
        }
      }
      return token;
    },
  },
  pages: {
    signIn: '/auth/login',
    error: '/auth/login', // così gli errori di login mostrano la pagina di login invece della generica "Error"
  },
  session: {
    strategy: 'jwt', // Usa JWT invece di database session (più semplice)
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
