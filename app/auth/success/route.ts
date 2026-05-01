import type { NextApiRequest, NextApiResponse } from "next";
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PM_OAUTH_INTENT_COOKIE } from "@/lib/oauth-intent-cookie";
import { sanitizePostAuthRedirectPath, withWelcomeCreditsParam } from "@/lib/auth-welcome-credits-url";

export const dynamic = "force-dynamic";

/**
 * NextAuth `getServerSession(authOptions)` (un solo argomento) usa `cookies()` da `next/headers`
 * in modalità RSC; nei Route Handler, dopo il redirect OAuth, non sempre vede gli stessi cookie
 * della `NextRequest`. Costruiamo req/res compatibili con Pages API così la sessione DB
 * si risolve sulla richiesta reale (evita redirect/login errati e risposte anomale sul path
 * `/auth/success`).
 */
function nextAuthReqResFrom(request: NextRequest): {
  req: NextApiRequest;
  res: NextApiResponse;
} {
  const headers: Record<string, string> = {};
  request.headers.forEach((value, key) => {
    headers[key] = value;
  });
  const cookies: Record<string, string> = {};
  for (const c of request.cookies.getAll()) {
    cookies[c.name] = c.value;
  }

  const req = {
    headers,
    cookies,
    method: request.method ?? "GET",
    query: Object.fromEntries(request.nextUrl.searchParams),
    url: request.url,
  } as unknown as NextApiRequest;

  let setCookieHeader: string | string[] | undefined;
  const res = {
    getHeader(name: string) {
      if (name.toLowerCase() !== "set-cookie") return undefined;
      return setCookieHeader;
    },
    setHeader(name: string, value: string | string[]) {
      if (name.toLowerCase() === "set-cookie") {
        setCookieHeader = value;
      }
      return res;
    },
  } as unknown as NextApiResponse;

  return { req, res };
}

/**
 * Intermedia dopo login/OAuth: redirect verso `callbackUrl` con sessione già sul cookie.
 * La cancellazione `pm_oauth_intent` deve avvenire qui (Route Handler): in un Server
 * Component `cookies().delete()` non è consentita e provoca l'error boundary.
 */
export async function GET(req: NextRequest) {
  const { req: nReq, res: nRes } = nextAuthReqResFrom(req);
  const session = await getServerSession(nReq, nRes, authOptions);
  const callbackUrl = req.nextUrl.searchParams.get("callbackUrl");
  const rawDestination =
    callbackUrl && callbackUrl.startsWith("/") && !callbackUrl.startsWith("//")
      ? callbackUrl
      : "/";
  const destination = sanitizePostAuthRedirectPath(rawDestination);

  if (!session?.user?.id) {
    return NextResponse.redirect(new URL("/auth/login", req.nextUrl.origin));
  }

  const row = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { creditsWelcomeDismissedAt: true },
  });
  const needsWelcomeCredits = !row?.creditsWelcomeDismissedAt;
  const destPath = needsWelcomeCredits ? withWelcomeCreditsParam(destination) : destination;

  const res = NextResponse.redirect(new URL(destPath, req.nextUrl.origin));
  res.cookies.delete(PM_OAUTH_INTENT_COOKIE);
  return res;
}
