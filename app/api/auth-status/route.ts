import { NextRequest, NextResponse } from "next/server";

/**
 * Diagnostica login: verifica che le variabili d'ambiente siano impostate
 * e che l'URL corrente corrisponda a NEXTAUTH_URL (importante in produzione).
 * Non espone valori sensibili.
 * Path fuori da /api/auth/ per non essere intercettato da NextAuth [...nextauth].
 */
export async function GET(request: NextRequest) {
  const hasSecret = Boolean(
    process.env.NEXTAUTH_SECRET && process.env.NEXTAUTH_SECRET.length >= 16
  );
  const hasUrl = Boolean(
    process.env.NEXTAUTH_URL &&
      process.env.NEXTAUTH_URL.startsWith("http")
  );
  const rawDbUrl = process.env.DATABASE_URL || "";
  const hasDatabase =
    rawDbUrl.length > 0 &&
    (rawDbUrl.startsWith("postgresql://") || rawDbUrl.startsWith("postgres://"));
  const databaseCheck =
    !rawDbUrl.length
      ? "mancante"
      : hasDatabase
        ? "impostato (formato OK)"
        : "formato non valido: deve iniziare con postgresql:// o postgres://";

  const dbHost = rawDbUrl.match(/@([^/]+)/)?.[1] ?? "";
  const databaseRegion =
    dbHost.includes("eu-central-1") || dbHost.includes("eu-west-2")
      ? "EU"
      : dbHost.includes("us-east-1") || dbHost.includes("us-east-2") || dbHost.includes("us-west-2")
        ? "US"
        : dbHost ? "other" : "unknown";

  const host = request.headers.get("host") || "";
  const currentOrigin = request.nextUrl?.origin || "";

  let urlMatches = false;
  let expectedHost = "";
  if (process.env.NEXTAUTH_URL) {
    try {
      const url = new URL(process.env.NEXTAUTH_URL);
      expectedHost = url.host;
      urlMatches = url.host === host;
    } catch {
      urlMatches = false;
    }
  }

  const ok = hasSecret && hasUrl && hasDatabase && urlMatches;

  return NextResponse.json({
    ok: ok ? "Configurazione auth OK." : "Controlla le variabili d'ambiente su Vercel (vedi sotto).",
    checks: {
      NEXTAUTH_SECRET: hasSecret ? "impostato" : "mancante o troppo corto",
      NEXTAUTH_URL: hasUrl ? "impostato" : "mancante o non valido",
      DATABASE_URL: databaseCheck,
      databaseRegion,
      urlMatch: urlMatches
        ? "OK (l'URL della pagina corrisponde a NEXTAUTH_URL)"
        : `L'URL della pagina (${host}) non corrisponde all'host in NEXTAUTH_URL (${expectedHost || "non impostato"}). Imposta NEXTAUTH_URL esattamente come l'URL che usi per aprire l'app (es. https://tuo-progetto.vercel.app).`,
    },
    currentOrigin,
    hint: !urlMatches
      ? "Su Vercel imposta NEXTAUTH_URL uguale all'URL che vedi nella barra del browser (senza slash finale). Poi Redeploy."
      : undefined,
  });
}
