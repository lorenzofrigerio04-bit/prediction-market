"use client";

import Link from "next/link";
import Header from "@/components/Header";

export default function SupportPage() {
  return (
    <div className="min-h-screen bg-bg">
      <Header />
      <main id="main-content" className="mx-auto px-4 py-6 pb-24 md:py-8 max-w-2xl">
        <div className="box-raised rounded-2xl p-5 md:p-6">
          <h1 className="text-xl md:text-2xl font-bold text-fg mb-2">Supporto</h1>
          <p className="text-fg-muted text-sm mb-6">
            Per assistenza consulta i documenti legali o contatta il team. Funzionalità in arrivo.
          </p>
          <nav className="space-y-2" aria-label="Link utili">
            <Link
              href="/legal/terms"
              className="block py-3 px-4 rounded-2xl border border-border dark:border-white/10 text-fg hover:bg-surface/50 min-h-[48px] flex items-center font-medium"
            >
              Termini di servizio
            </Link>
            <Link
              href="/legal/privacy"
              className="block py-3 px-4 rounded-2xl border border-border dark:border-white/10 text-fg hover:bg-surface/50 min-h-[48px] flex items-center font-medium"
            >
              Privacy policy
            </Link>
            <Link
              href="/settings"
              className="block py-3 px-4 rounded-2xl border border-border dark:border-white/10 text-fg hover:bg-surface/50 min-h-[48px] flex items-center font-medium"
            >
              Impostazioni
            </Link>
          </nav>
        </div>
      </main>
    </div>
  );
}
