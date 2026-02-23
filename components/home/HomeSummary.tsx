"use client";

import Link from "next/link";
import StreakBadge from "@/components/StreakBadge";

interface HomeSummaryProps {
  credits: number | null;
  streak: number | null;
  creditsLoading?: boolean;
  streakLoading?: boolean;
}

export default function HomeSummary({
  credits,
  streak,
  creditsLoading,
  streakLoading,
}: HomeSummaryProps) {
  return (
    <section
      className="mb-section md:mb-section-lg card-raised hover-lift p-4 md:p-5 transition-all duration-300"
      aria-label="Riepilogo"
    >
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6">
        {/* Saldo crediti */}
        <div className="flex items-center gap-3">
          <div
            className="flex items-center justify-center w-11 h-11 rounded-xl bg-primary/15 text-primary shrink-0"
            aria-hidden
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div className="min-w-0">
            <p className="text-ds-micro font-semibold text-fg-muted uppercase tracking-wider">
              Crediti
            </p>
            {creditsLoading ? (
              <p className="text-ds-h2 font-bold text-fg animate-pulse">—</p>
            ) : (
              <p className="text-ds-h2 font-bold text-fg tabular-nums">
                {credits != null ? credits.toLocaleString("it-IT") : "—"}
              </p>
            )}
          </div>
        </div>

        {/* Streak */}
        <Link
          href="/missions"
          className="flex items-center gap-3 rounded-xl hover:bg-surface/50 transition-colors p-1 -m-1 focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-bg outline-none"
        >
          <div
            className="flex items-center justify-center w-11 h-11 rounded-xl bg-orange-500/15 text-orange-600 dark:text-orange-400 shrink-0"
            aria-hidden
          >
            <span className="text-xl">🔥</span>
          </div>
          <div className="min-w-0">
            <p className="text-ds-micro font-semibold text-fg-muted uppercase tracking-wider">
              Streak
            </p>
            {streakLoading ? (
              <p className="text-ds-body font-bold text-fg animate-pulse">—</p>
            ) : streak != null && streak > 0 ? (
              <StreakBadge streak={streak} size="sm" />
            ) : (
              <p className="text-ds-body-sm text-fg-muted">
                Inizia la streak →
              </p>
            )}
          </div>
        </Link>

        {/* Hook FOMO: Scopri eventi consigliati */}
        <Link
          href="/discover"
          className="flex items-center gap-3 rounded-xl hover:bg-surface/50 transition-colors p-1 -m-1 focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-bg outline-none group"
        >
          <div
            className="flex items-center justify-center w-11 h-11 rounded-xl bg-primary/20 text-primary shrink-0 group-hover:bg-primary/30 transition-colors"
            aria-hidden
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
          </div>
          <div className="min-w-0">
            <p className="text-ds-micro font-semibold text-fg-muted uppercase tracking-wider">
              Consigliati
            </p>
            <p className="text-ds-body font-bold text-fg group-hover:text-primary transition-colors">
              Scopri eventi →
            </p>
          </div>
        </Link>
      </div>
    </section>
  );
}
