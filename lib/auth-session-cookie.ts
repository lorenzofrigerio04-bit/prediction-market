/**
 * Cookie di sessione NextAuth: nome dedicato + purge dei cookie legacy (JWT grandi / chunk).
 * Vercel 494 REQUEST_HEADER_TOO_LARGE: l'header Cookie supera il limite se restano token vecchi o frammentati.
 */

import type { NextResponse } from "next/server";

/**
 * Solo build/runtime “produzione” (deploy), non NEXTAUTH_URL=https da .env mentre fai `npm run dev` su http://localhost:
 * altrimenti Secure + nome __Secure-* fa scartare il cookie e sembra che registrazione/login non vadano mai a buon fine.
 */
const isProdHttps =
  process.env.NODE_ENV === "production" || process.env.VERCEL === "1";

/** Allineato a `authOptions.cookies.sessionToken.options.secure` (cookie `__Secure-` richiede Secure). */
export function useSecureAuthCookie(): boolean {
  return isProdHttps;
}

/** Stessa durata di `authOptions.session.maxAge`. */
export const AUTH_SESSION_MAX_AGE_SECONDS = 30 * 24 * 60 * 60;

/** Opzioni Set-Cookie per `pm.sid` (sessione DB NextAuth). */
export function getSessionCookieWriteOptions() {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    path: "/",
    secure: useSecureAuthCookie(),
    maxAge: AUTH_SESSION_MAX_AGE_SECONDS,
  };
}

/** Nome attuale del cookie di sessione (deve coincidere con authOptions.cookies.sessionToken.name). */
export function getSessionTokenCookieName(): string {
  return isProdHttps ? "__Secure-pm.sid" : "pm.sid";
}

const LEGACY_SESSION_BASE = [
  "next-auth.session-token",
  "__Secure-next-auth.session-token",
  "__Host-next-auth.session-token",
] as const;

const CHUNK_SUFFIX_MAX = 8;

/** Aggiunge Set-Cookie per far scadere cookie NextAuth vecchi e chunk (.0 … .7). */
export function purgeLegacyNextAuthCookies(res: NextResponse): void {
  const secure = isProdHttps;
  const baseOpts = {
    path: "/",
    maxAge: 0,
    sameSite: "lax" as const,
    httpOnly: true,
    secure,
  };

  for (const name of LEGACY_SESSION_BASE) {
    res.cookies.set(name, "", baseOpts);
  }
  for (let i = 0; i < CHUNK_SUFFIX_MAX; i++) {
    res.cookies.set(`next-auth.session-token.${i}`, "", baseOpts);
    res.cookies.set(`__Secure-next-auth.session-token.${i}`, "", baseOpts);
    res.cookies.set(`__Host-next-auth.session-token.${i}`, "", baseOpts);
  }
}
