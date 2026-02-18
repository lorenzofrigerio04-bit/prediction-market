import type { Metadata } from "next";
import { getServerSession } from "next-auth";
import "./globals.css";
import SessionProvider from "@/components/providers/SessionProvider";
import { authOptions } from "@/lib/auth";
import ThemeScript from "./ThemeScript";

export const metadata: Metadata = {
  title: "Prediction Market",
  description: "Piattaforma italiana di previsioni sociali",
};

// Obbliga il layout a essere valutato a ogni richiesta (no cache), così i cookie di sessione vengono letti
export const dynamic = "force-dynamic";

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  let session = null;
  try {
    session = await getServerSession(authOptions);
  } catch (e) {
    // In produzione un errore qui (es. NEXTAUTH_SECRET mancante, DB irraggiungibile)
    // non deve far vedere pagina bianca: usiamo sessione null e lasciamo che
    // global-error.tsx intercetti solo errori non catturati.
    console.error("getServerSession error:", e);
  }
  const buildId =
    typeof process.env.VERCEL_GIT_COMMIT_SHA === "string"
      ? process.env.VERCEL_GIT_COMMIT_SHA.slice(0, 7)
      : process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA?.slice(0, 7) ?? "dev";

  return (
    <html lang="it" className="dark" suppressHydrationWarning>
      <body className="font-sans antialiased min-h-screen bg-bg text-fg flex flex-col">
        <ThemeScript />
        <SessionProvider session={session}>
          <div className="flex-1">{children}</div>
          <footer
            className="py-2 text-center text-fg-muted text-ds-micro"
            aria-hidden
          >
            Build {buildId}
          </footer>
        </SessionProvider>
      </body>
    </html>
  );
}
