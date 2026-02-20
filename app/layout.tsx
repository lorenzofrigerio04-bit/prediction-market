import type { Metadata } from "next";
import { getServerSession } from "next-auth";
import "./globals.css";
import SessionProvider from "@/components/providers/SessionProvider";
import { authOptions } from "@/lib/auth";
import ThemeScript from "./ThemeScript";

export const metadata: Metadata = {
  title: "Prediction Market",
  description: "Piattaforma italiana di previsioni sociali",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#fafbfd" },
    { media: "(prefers-color-scheme: dark)", color: "#181b26" },
  ],
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "PredictionMaster",
  },
  viewport: {
    width: "device-width",
    initialScale: 1,
    maximumScale: 1,
    viewportFit: "cover",
  },
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
  return (
    <html lang="it" className="dark" suppressHydrationWarning>
      <body className="font-sans antialiased min-h-screen bg-bg text-fg flex flex-col">
        <ThemeScript />
        <SessionProvider session={session}>
          <a
            href="#main-content"
            className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[100] focus:px-4 focus:py-2 focus:bg-surface focus:text-fg focus:border focus:border-border focus:rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-bg"
          >
            Vai al contenuto
          </a>
          <div className="flex-1">{children}</div>
          <footer
            className="py-3 text-center text-fg-muted text-ds-micro bg-transparent"
            aria-hidden
          >
            <span className="brand-logo__text font-display font-extrabold tracking-tight inline-block text-sm md:text-base">
              <span className="brand-logo__word brand-logo__word--prediction">Prediction</span>
              <span className="brand-logo__word brand-logo__word--master">Master</span>
            </span>
          </footer>
        </SessionProvider>
      </body>
    </html>
  );
}
