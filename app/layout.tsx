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
    console.error("getServerSession error:", e);
  }
  return (
    <html lang="it">
      <body className="font-sans antialiased min-h-screen bg-gray-50">
        <SessionProvider session={session}>{children}</SessionProvider>
      </body>
    </html>
  );
}
