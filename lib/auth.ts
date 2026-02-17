/**
 * Helper per autenticazione nelle API routes
 * 
 * Questo file esporta authOptions che viene già usato in app/layout.tsx
 * Se hai già una configurazione next-auth esistente, aggiorna questo file
 * per importarla invece del placeholder.
 */

import { getServerSession } from 'next-auth';
import type { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { PrismaAdapter } from '@next-auth/prisma-adapter';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;
        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
          select: { id: true, email: true, name: true, password: true, role: true },
        });
        if (!user) return null;
        if (!user.password) return null;
        const ok = await bcrypt.compare(credentials.password, user.password);
        if (!ok) return null;
        return { id: user.id, email: user.email ?? '', name: user.name ?? null, image: null };
      },
    }),
  ],
  callbacks: {
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
