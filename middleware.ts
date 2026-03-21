import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";
import { rateLimit, getClientIp } from "@/lib/rate-limit";
import {
  getSessionTokenCookieName,
  purgeLegacyNextAuthCookies,
} from "@/lib/auth-session-cookie";

const AUTH_LOGIN_LIMIT = 10;

function isProtectedPath(pathname: string): boolean {
  if (pathname.startsWith("/admin")) return true;
  if (pathname === "/profile" || pathname.startsWith("/profile/")) return true;
  if (pathname === "/wallet" || pathname.startsWith("/wallet/")) return true;
  if (pathname === "/notifications" || pathname.startsWith("/notifications/"))
    return true;
  if (pathname === "/missions" || pathname.startsWith("/missions/")) return true;
  return false;
}

export async function middleware(request: NextRequest) {
  const res = NextResponse.next();
  purgeLegacyNextAuthCookies(res);

  const pathname = request.nextUrl.pathname;

  if (
    pathname === "/api/auth/callback/credentials" &&
    request.method === "POST"
  ) {
    const ip = getClientIp(request as Parameters<typeof getClientIp>[0]);
    const limited = rateLimit(`login:${ip}`, AUTH_LOGIN_LIMIT);
    if (limited) {
      const json = NextResponse.json(
        { error: "Troppe richieste di accesso. Riprova tra un minuto." },
        { status: 429 }
      );
      purgeLegacyNextAuthCookies(json);
      return json;
    }
    return res;
  }

  if (!isProtectedPath(pathname)) {
    return res;
  }

  const secret = process.env.NEXTAUTH_SECRET ?? process.env.AUTH_SECRET;
  if (!secret) {
    return res;
  }

  const token = await getToken({
    req: request,
    secret,
    cookieName: getSessionTokenCookieName(),
  });

  if (token) {
    return res;
  }

  const signIn = new URL("/auth/login", request.url);
  signIn.searchParams.set(
    "callbackUrl",
    `${pathname}${request.nextUrl.search}`
  );
  const redirect = NextResponse.redirect(signIn);
  purgeLegacyNextAuthCookies(redirect);
  return redirect;
}

export const config = {
  matcher: [
    "/",
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
