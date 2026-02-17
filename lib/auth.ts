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
        try {
          if (!credentials?.email || !credentials?.password) {
            return null; // NextAuth gestisce null come "CredentialsSignin"
          }
          
          // Prova a recuperare l'utente, gestendo il caso in cui la colonna password non esista
          let user;
          try {
            user = await prisma.user.findUnique({
              where: { email: credentials.email },
              select: { id: true, email: true, name: true, password: true, role: true },
            });
          } catch (dbError: any) {
            // Se la colonna password non esiste (P2022) o la tabella non esiste (P2021)
            if (dbError?.code === 'P2022' || dbError?.code === 'P2021' || 
                dbError?.message?.includes('does not exist') || 
                dbError?.message?.includes('password')) {
              console.error('[CredentialsProvider] Database schema non aggiornato:', dbError);
              // Prova senza password per vedere se l'utente esiste
              user = await prisma.user.findUnique({
                where: { email: credentials.email },
                select: { id: true, email: true, name: true, role: true },
              });
              if (user) {
                // L'utente esiste ma la colonna password non è stata ancora aggiunta
                throw new Error('Database non configurato: esegui "npx prisma migrate deploy" e "npx prisma db seed"');
              }
            }
            throw dbError;
          }
          
          if (!user) {
            return null; // NextAuth convertirà in "CredentialsSignin"
          }
          
          if (!user.password) {
            return null; // Account senza password impostata
          }
          
          const ok = await bcrypt.compare(credentials.password, user.password);
          if (!ok) {
            return null; // Password errata
          }
          
          return { id: user.id, email: user.email ?? '', name: user.name ?? null, image: null };
        } catch (error: any) {
          console.error('[CredentialsProvider] Errore durante authorize:', error);
          // Se è un errore con messaggio chiaro, rilancialo così NextAuth lo passa al client
          if (error?.message && error.message.includes('Database non configurato')) {
            throw error;
          }
          // Per altri errori, ritorna null così NextAuth genera "CredentialsSignin"
          return null;
        }
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
