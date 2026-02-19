"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Header from "@/components/Header";

export default function SettingsPage() {
  const { status } = useSession();
  const router = useRouter();

  if (status === "unauthenticated") {
    router.push("/auth/login");
    return null;
  }

  return (
    <div className="min-h-screen bg-bg">
      <Header />
      <main id="main-content" className="mx-auto px-4 py-5 md:py-8 max-w-2xl">
        <div className="box-raised rounded-2xl p-5 md:p-6">
          <h1 className="text-xl md:text-2xl font-bold text-fg mb-2">Impostazioni</h1>
          <p className="text-fg-muted text-sm mb-6">
            Qui potrai gestire preferenze, notifiche e account. Funzionalità in arrivo.
          </p>

          <nav className="mb-6" aria-label="Documenti legali">
            <h2 className="text-sm font-semibold text-fg mb-3">Documenti legali</h2>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/legal/terms"
                  className="text-primary hover:underline focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-bg rounded py-1 inline-block min-h-[44px] flex items-center"
                >
                  Termini di servizio
                </Link>
              </li>
              <li>
                <Link
                  href="/legal/privacy"
                  className="text-primary hover:underline focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-bg rounded py-1 inline-block min-h-[44px] flex items-center"
                >
                  Privacy policy
                </Link>
              </li>
              <li>
                <Link
                  href="/legal/content-rules"
                  className="text-primary hover:underline focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-bg rounded py-1 inline-block min-h-[44px] flex items-center"
                >
                  Regole contenuti
                </Link>
              </li>
              <li>
                <Link
                  href="/legal/credits"
                  className="text-primary hover:underline focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-bg rounded py-1 inline-block min-h-[44px] flex items-center"
                >
                  Disclaimer crediti
                </Link>
              </li>
            </ul>
          </nav>

          <Link
            href="/profile"
            className="inline-flex items-center gap-2 text-primary font-semibold hover:underline min-h-[44px] items-center focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-bg rounded"
          >
            ← Torna al profilo
          </Link>
        </div>
      </main>
    </div>
  );
}
