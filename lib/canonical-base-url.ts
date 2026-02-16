/**
 * Canonical base URL for server-side use (e.g. /api/version, cron, email links).
 * Prefers NEXTAUTH_URL / NEXT_PUBLIC_SITE_URL over VERCEL_URL so production
 * and preview use the configured canonical domain, not the random preview URL.
 */

function isValidOriginUrl(value: string): boolean {
  const trimmed = value.trim();
  return (
    (trimmed.startsWith("http://") || trimmed.startsWith("https://")) &&
    !/\s/.test(trimmed)
  );
}

function toOriginOnly(url: string): string {
  let out = url.trim().replace(/\/+$/, "");
  if (out.endsWith("/api")) out = out.replace(/\/api\/?$/, "") || out;
  return out;
}

/**
 * Returns the canonical base URL (origin only, no trailing slash, never ending with /api).
 * Priority: NEXTAUTH_URL → NEXT_PUBLIC_SITE_URL → https://VERCEL_URL → http://localhost:PORT
 */
export function getCanonicalBaseUrl(): string {
  const na = process.env.NEXTAUTH_URL;
  if (na && isValidOriginUrl(na)) {
    return toOriginOnly(na);
  }
  const site = process.env.NEXT_PUBLIC_SITE_URL;
  if (site && isValidOriginUrl(site)) {
    return toOriginOnly(site);
  }
  if (process.env.VERCEL_URL) {
    return toOriginOnly("https://" + process.env.VERCEL_URL);
  }
  const port = process.env.PORT || "3000";
  return "http://localhost:" + port;
}

/**
 * Dev-only: warn if NEXTAUTH_URL contains newline or ends with "/api".
 */
export function warnNextAuthUrlIfInvalid(): void {
  if (process.env.NODE_ENV === "test") return;
  const na = process.env.NEXTAUTH_URL;
  if (!na) return;
  if (/\n|\r/.test(na)) {
    console.warn("[canonical-base-url] NEXTAUTH_URL contains newline; fix in Vercel env vars.");
  }
  if (na.trim().endsWith("/api")) {
    console.warn("[canonical-base-url] NEXTAUTH_URL should be the site origin, not .../api.");
  }
}
