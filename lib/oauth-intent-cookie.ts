import { useSecureAuthCookie } from "@/lib/auth-session-cookie";
import { headers } from "next/headers";

/** Cookie impostato da POST /api/auth/oauth-intent prima di signIn("google"). */
export const PM_OAUTH_INTENT_COOKIE = "pm_oauth_intent";

export const PM_OAUTH_INTENT_MAX_AGE = 600;

export type OAuthIntent = "login" | "signup";

export function getOAuthIntentCookieOptions(): {
  path: string;
  httpOnly: boolean;
  sameSite: "lax";
  secure: boolean;
  maxAge: number;
} {
  return {
    path: "/",
    httpOnly: true,
    sameSite: "lax",
    secure: useSecureAuthCookie(),
    maxAge: PM_OAUTH_INTENT_MAX_AGE,
  };
}

/**
 * Legge l'intent OAuth dalla stringa Cookie della richiesta.
 * Non usare `cookies()` dentro `callbacks.signIn` di NextAuth: con l’App Router può
 * andare in errore e produrre `error=Callback` + messaggio generico invece di `AccessDenied`.
 */
export async function readOAuthIntentFromRequest(): Promise<OAuthIntent | null> {
  try {
    const h = await headers();
    const raw = h.get("cookie");
    if (!raw) return null;
    const prefix = `${PM_OAUTH_INTENT_COOKIE}=`;
    for (const part of raw.split(";")) {
      const s = part.trim();
      if (!s.startsWith(prefix)) continue;
      let v = s.slice(prefix.length);
      try {
        v = decodeURIComponent(v);
      } catch {
        /* valore raw */
      }
      if (v === "login" || v === "signup") return v;
    }
  } catch {
    /* API dinamiche non disponibili in questo contesto */
  }
  return null;
}
