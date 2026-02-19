"use client";

import Link from "next/link";
import StreakBadge from "@/components/StreakBadge";

interface HomeSummaryProps {
  credits: number | null;
  weeklyRank: number | undefined;
  streak: number | null;
  creditsLoading?: boolean;
  rankLoading?: boolean;
  streakLoading?: boolean;
}

export default function HomeSummary({
  credits,
  weeklyRank,
  streak,
  creditsLoading,
  rankLoading,
  streakLoading,
}: HomeSummaryProps) {
  return (
    <section
      className="mb-section md:mb-section-lg card-raised hover-lift p-4 md:p-5"
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

        {/* Posizione in classifica settimanale */}
        <Link
          href="/leaderboard?period=weekly"
          className="flex items-center gap-3 rounded-xl hover:bg-surface/50 transition-colors p-1 -m-1 focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-bg outline-none"
        >
          <div
            className="flex items-center justify-center w-11 h-11 rounded-xl bg-warning-bg/90 text-warning dark:bg-warning-bg/50 dark:text-warning shrink-0"
            aria-hidden
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
            </svg>
          </div>
          <div className="min-w-0">
            <p className="text-ds-micro font-semibold text-fg-muted uppercase tracking-wider">
              Classifica settimanale
            </p>
            {rankLoading ? (
              <p className="text-ds-h2 font-bold text-fg animate-pulse">—</p>
            ) : weeklyRank != null ? (
              <p className="text-ds-h2 font-bold text-fg">
                #{weeklyRank}
              </p>
            ) : (
              <p className="text-ds-body-sm text-text-muted">Partecipa per entrare</p>
            )}
          </div>
        </Link>

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
      </div>
    </section>
  );
}
