/**
 * Flag in query dopo OAuth: CreditsWelcomeGate apre subito il popup 10k se la sessione non ha ancora scalato showCreditsWelcome.
 */
export const PM_WELCOME_CREDITS_PARAM = "pmWelcomeCredits";

/** Evita di reindirizzare di nuovo verso login/registrazione (loop) dopo OAuth riuscito. */
export function sanitizePostAuthRedirectPath(raw: string): string {
  if (!raw.startsWith("/") || raw.startsWith("//")) return "/";
  const pathOnly = raw.split(/[?#]/)[0];
  if (pathOnly === "/auth/login" || pathOnly === "/auth/signup") {
    try {
      const u = new URL(raw, "http://welcome.local");
      const inner = u.searchParams.get("callbackUrl");
      if (typeof inner === "string" && inner.startsWith("/") && !inner.startsWith("//")) {
        return sanitizePostAuthRedirectPath(inner);
      }
    } catch {
      /* usa “/” sotto */
    }
    return "/";
  }
  return raw;
}

/** Accoda `pmWelcomeCredits=1` a un path interno (es. /discover). */
export function withWelcomeCreditsParam(dest: string): string {
  if (!dest.startsWith("/") || dest.startsWith("//")) return dest;
  try {
    const u = new URL(dest, "http://welcome.local");
    if (u.searchParams.get(PM_WELCOME_CREDITS_PARAM) === "1") return dest;
    u.searchParams.set(PM_WELCOME_CREDITS_PARAM, "1");
    return `${u.pathname}${u.search}${u.hash}`;
  } catch {
    return dest.includes("?") ? `${dest}&${PM_WELCOME_CREDITS_PARAM}=1` : `${dest}?${PM_WELCOME_CREDITS_PARAM}=1`;
  }
}
