import type { Metadata } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import SessionProvider from "@/components/providers/SessionProvider";
import "@/app/globals.css";

export const metadata: Metadata = {
  title: "PredictionMaster",
  description: "Prevedi il futuro. Guadagna crediti. Scala la classifica.",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  return (
    <html lang="it">
      <body className="min-h-screen bg-bg text-fg">
        <SessionProvider session={session}>
          {children}
        </SessionProvider>
      </body>
    </html>
  );
}
