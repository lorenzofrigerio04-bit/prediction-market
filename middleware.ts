import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

/**
 * Route protette: richiedono login. Redirect a /auth/login se non autenticati.
 * Gli header di sicurezza (X-Frame-Options, ecc.) sono in next.config.js per tutte le risposte.
 */
export default withAuth(
  function middleware() {
    return NextResponse.next();
  },
  {
    pages: { signIn: "/auth/login" },
  }
);

export const config = {
  matcher: [
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
