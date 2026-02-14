import type { Metadata } from "next";
import { getServerSession } from "next-auth";
import "./globals.css";
import SessionProvider from "@/components/providers/SessionProvider";
import { authOptions } from "@/lib/auth";

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
  return (
    <html lang="it">
      <body className="font-sans antialiased min-h-screen bg-slate-50 text-slate-900">
        <SessionProvider session={session}>{children}</SessionProvider>
      </body>
    </html>
  );
}
