import { NextAuthOptions } from "next-auth";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

const credentialsProvider = CredentialsProvider({
  name: "Credentials",
  credentials: {
    email: { label: "Email", type: "email" },
    password: { label: "Password", type: "password" },
  },
  async authorize(credentials) {
    if (!credentials?.email || !credentials?.password) {
      throw new Error("Email e password sono obbligatori");
    }

    try {
      const user = await prisma.user.findUnique({
        where: { email: credentials.email },
      });

      if (!user || !user.password) {
        throw new Error("Credenziali non valide");
      }

      const isPasswordValid = await bcrypt.compare(
        credentials.password,
        user.password
      );

      if (!isPasswordValid) {
        throw new Error("Credenziali non valide");
      }

      return {
        id: user.id,
        email: user.email,
        name: user.name,
        image: user.image,
        role: user.role,
        onboardingCompleted: user.onboardingCompleted,
      };
    } catch (err: unknown) {
      // Errore di connessione DB / Prisma: non esporre dettagli, ma logga per debug
      if (err && typeof err === "object" && "code" in err) {
        console.error("[auth] Errore DB in authorize:", err);
        throw new Error("Errore di connessione al server. Riprova tra poco.");
      }
      throw err;
    }
  },
});

const providers: NextAuthOptions["providers"] = [
  ...(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
    ? [
        GoogleProvider({
          clientId: process.env.GOOGLE_CLIENT_ID,
          clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        }),
      ]
    : []),
  credentialsProvider,
];

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers,
  // In produzione (Vercel) assicurati che NEXTAUTH_URL sia l'URL reale (es. https://tuo-app.vercel.app)
  // e che NEXTAUTH_SECRET sia impostato (es. openssl rand -base64 32).
  pages: {
    signIn: "/auth/login",
    signOut: "/auth/login",
    error: "/auth/login",
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 giorni
  },
  // Post-deploy: in produzione cookie __Secure-*, httpOnly, sameSite: lax, secure (vedi DEPLOY_AND_BETA.md Fase 6)
  cookies: {
    sessionToken: {
      name: process.env.NODE_ENV === "production"
        ? "__Secure-next-auth.session-token"
        : "next-auth.session-token",
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: process.env.NODE_ENV === "production",
        maxAge: 30 * 24 * 60 * 60,
      },
    },
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user?.id) {
        token.id = user.id;
        try {
          const dbUser = await prisma.user.findUnique({
            where: { id: user.id },
            select: { role: true, onboardingCompleted: true, emailVerified: true },
          });
          token.role = dbUser?.role ?? (user as { role?: string }).role ?? "USER";
          token.onboardingCompleted = dbUser?.onboardingCompleted ?? (user as { onboardingCompleted?: boolean }).onboardingCompleted ?? false;
          token.emailVerified = dbUser?.emailVerified ? dbUser.emailVerified.getTime() : null;
        } catch {
          token.role = (user as { role?: string }).role ?? "USER";
          token.onboardingCompleted = (user as { onboardingCompleted?: boolean }).onboardingCompleted ?? false;
          token.emailVerified = (user as { emailVerified?: Date | null }).emailVerified
            ? (user as { emailVerified: Date }).emailVerified.getTime()
            : null;
        }
      } else if (token.id) {
        try {
          const dbUser = await prisma.user.findUnique({
            where: { id: token.id as string },
            select: { role: true, onboardingCompleted: true, emailVerified: true },
          });
          if (dbUser) {
            token.role = dbUser.role;
            token.onboardingCompleted = dbUser.onboardingCompleted;
            token.emailVerified = dbUser.emailVerified ? dbUser.emailVerified.getTime() : null;
          }
        } catch {
          // Mantieni i valori già nel token
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = (token.role as string) || "USER";
        session.user.onboardingCompleted = token.onboardingCompleted ?? false;
        session.user.emailVerified = token.emailVerified ? new Date(token.emailVerified) : null;
      }
      return session;
    },
  },
  events: {
    async signIn({ user, account }) {
      // Google verifica già l'email: segna come verificata in DB
      if (account?.provider === "google" && user?.id) {
        try {
          await prisma.user.update({
            where: { id: user.id },
            data: { emailVerified: new Date() },
          });
        } catch (e) {
          console.error("[auth] Impossibile aggiornare emailVerified per Google user:", e);
        }
      }
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};
