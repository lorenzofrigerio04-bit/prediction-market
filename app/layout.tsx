import type { Metadata, Viewport } from "next";
import { getServerSession } from "next-auth";
import "./globals.css";
import SessionProvider from "@/components/providers/SessionProvider";
import { authOptions } from "@/lib/auth";
import ThemeScript from "./ThemeScript";
import AppBackground from "@/components/AppBackground";
import ConditionalFooter from "@/components/ConditionalFooter";
import { LandingBackgroundProviderWithRoute } from "@/components/landing/LandingBackgroundCarousel";

/* Colore barre sistema: status bar + barra browser (Android Chrome, iOS). Stesso valore in manifest.json. */
const THEME_COLOR = "#001B51";

export const metadata: Metadata = {
  title: "Prediction Market",
  description: "Piattaforma italiana di previsioni sociali",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "PredictionMaster",
  },
  manifest: "/manifest.json",
};

/* In Next.js 14+ theme-color e viewport vanno nell'export viewport, non in metadata. */
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  viewportFit: "cover",
  themeColor: THEME_COLOR,
  colorScheme: "dark",
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
      <head>
        {/* Barre scure: theme-color + color-scheme (Android Chrome, iOS Safari). Meta espliciti per massima compatibilità. */}
        <meta name="theme-color" content={THEME_COLOR} />
        <meta name="color-scheme" content="dark" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="PredictionMaster" />
      </head>
      <body className="font-sans antialiased min-h-screen bg-admin-bg text-fg flex flex-col">
        {/* ClipPath per bottom nav: contorno con mezza luna al centro */}
        <svg width="0" height="0" aria-hidden>
          <defs>
            <clipPath id="nav-bar-halfmoon-clip" clipPathUnits="objectBoundingBox">
              {/* Barra full-width, lati attaccati: angoli top arrotondati + convesso al centro */}
              <path d="M.06 0 L.44 0 Q.5 -.1 .56 0 L.94 0 Q1 0 1 .5 L1 1 L0 1 L0 .5 Q0 0 .06 0Z" />
            </clipPath>
          </defs>
        </svg>
        <ThemeScript />
        <LandingBackgroundProviderWithRoute>
          <AppBackground />
          <SessionProvider
            session={session}
            key={session?.user?.id ?? "guest"}
          >
          <a
            href="#main-content"
            className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[100] focus:px-4 focus:py-2 focus:bg-surface focus:text-fg focus:border focus:border-border focus:rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-bg"
          >
            Vai al contenuto
          </a>
          <div className="flex-1 platform-content" suppressHydrationWarning>{children}</div>
          <ConditionalFooter />
        </SessionProvider>
        </LandingBackgroundProviderWithRoute>
      </body>
    </html>
  );
}
