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
    <div className="min-h-screen bg-admin-bg">
      <Header />
      <main id="main-content" className="mx-auto px-4 py-5 md:py-8 max-w-2xl settings-flat-page">
        <div className="box-raised rounded-3xl p-5 md:p-6 border border-border/70 bg-admin-bg">
          <h1 className="font-kalshi text-[1.8rem] md:text-[2.1rem] font-bold text-fg leading-[1.05] tracking-[0.01em] mb-2">
            Impostazioni
          </h1>
          <p className="text-fg-muted text-sm mb-6">
            Qui potrai gestire preferenze, notifiche e account. Funzionalità in arrivo.
          </p>

          <nav className="mb-6" aria-label="Documenti legali">
            <h2 className="font-kalshi text-[1.25rem] leading-[1.05] tracking-[0.01em] text-fg mb-3">
              Documenti legali
            </h2>
            <ul className="space-y-2.5">
              <li>
                <Link
                  href="/legal/terms"
                  className="group flex items-center justify-between gap-3 rounded-2xl border border-border/70 bg-admin-bg px-4 py-3.5 text-fg transition-all hover:border-[#81D8D0]/50 hover:bg-admin-bg hover:shadow-[0_10px_24px_-18px_rgba(129,216,208,0.65)] focus-visible:ring-2 focus-visible:ring-[#81D8D0]/60 focus-visible:ring-offset-2 focus-visible:ring-offset-admin-bg"
                >
                  <span>Termini di servizio</span>
                  <span className="text-fg-muted text-xs transition-transform group-hover:translate-x-0.5" aria-hidden>→</span>
                </Link>
              </li>
              <li>
                <Link
                  href="/legal/privacy"
                  className="group flex items-center justify-between gap-3 rounded-2xl border border-border/70 bg-admin-bg px-4 py-3.5 text-fg transition-all hover:border-[#81D8D0]/50 hover:bg-admin-bg hover:shadow-[0_10px_24px_-18px_rgba(129,216,208,0.65)] focus-visible:ring-2 focus-visible:ring-[#81D8D0]/60 focus-visible:ring-offset-2 focus-visible:ring-offset-admin-bg"
                >
                  <span>Privacy policy</span>
                  <span className="text-fg-muted text-xs transition-transform group-hover:translate-x-0.5" aria-hidden>→</span>
                </Link>
              </li>
              <li>
                <Link
                  href="/legal/content-rules"
                  className="group flex items-center justify-between gap-3 rounded-2xl border border-border/70 bg-admin-bg px-4 py-3.5 text-fg transition-all hover:border-[#81D8D0]/50 hover:bg-admin-bg hover:shadow-[0_10px_24px_-18px_rgba(129,216,208,0.65)] focus-visible:ring-2 focus-visible:ring-[#81D8D0]/60 focus-visible:ring-offset-2 focus-visible:ring-offset-admin-bg"
                >
                  <span>Regole contenuti</span>
                  <span className="text-fg-muted text-xs transition-transform group-hover:translate-x-0.5" aria-hidden>→</span>
                </Link>
              </li>
              <li>
                <Link
                  href="/legal/credits"
                  className="group flex items-center justify-between gap-3 rounded-2xl border border-border/70 bg-admin-bg px-4 py-3.5 text-fg transition-all hover:border-[#81D8D0]/50 hover:bg-admin-bg hover:shadow-[0_10px_24px_-18px_rgba(129,216,208,0.65)] focus-visible:ring-2 focus-visible:ring-[#81D8D0]/60 focus-visible:ring-offset-2 focus-visible:ring-offset-admin-bg"
                >
                  <span>Disclaimer crediti</span>
                  <span className="text-fg-muted text-xs transition-transform group-hover:translate-x-0.5" aria-hidden>→</span>
                </Link>
              </li>
            </ul>
          </nav>

          <Link
            href="/profile"
            className="inline-flex items-center gap-2 text-fg font-semibold hover:underline min-h-[44px] focus-visible:ring-2 focus-visible:ring-[#81D8D0]/60 focus-visible:ring-offset-2 focus-visible:ring-offset-admin-bg rounded"
          >
            ← Torna al profilo
          </Link>
        </div>
      </main>
    </div>
  );
}
