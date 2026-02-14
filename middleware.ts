import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";
import { rateLimit, getClientIp } from "@/lib/rate-limit";

const AUTH_LOGIN_LIMIT = 10; // richieste login per IP per minuto

/**
 * Rate limit su login (POST a callback credentials).
 * withAuth protegge le route nel matcher e gestisce redirect a signIn.
 */
export default withAuth(
  function middleware(req) {
    const pathname = req.nextUrl.pathname;
    if (
      pathname === "/api/auth/callback/credentials" &&
      req.method === "POST"
    ) {
      const ip = getClientIp(req as Parameters<typeof getClientIp>[0]);
      const result = rateLimit(`login:${ip}`, AUTH_LOGIN_LIMIT);
      if (result) {
        return NextResponse.json(
          { error: "Troppe richieste di accesso. Riprova tra un minuto." },
          { status: 429 }
        );
      }
    }
    return NextResponse.next();
  },
  {
    pages: { signIn: "/auth/login" },
  }
);

export const config = {
  matcher: [
    "/api/auth/callback/credentials",
    "/admin/:path*",
    "/profile",
    "/profile/:path*",
    "/wallet",
    "/wallet/:path*",
    "/notifications",
    "/notifications/:path*",
    "/missions",
    "/missions/:path*",
  ],
};
