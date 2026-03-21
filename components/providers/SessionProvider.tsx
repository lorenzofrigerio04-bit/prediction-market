"use client";

import { SessionProvider as NextAuthSessionProvider } from "next-auth/react";

/** Non passare `session` da SSR: il client deve chiamare GET /api/auth/session così useSession() è allineato al cookie dopo OAuth. */
export default function SessionProvider({ children }: { children: React.ReactNode }) {
  return (
    <NextAuthSessionProvider refetchOnWindowFocus={true} refetchInterval={0}>
      {children}
    </NextAuthSessionProvider>
  );
}
