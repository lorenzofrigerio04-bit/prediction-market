"use client";

import Link from "next/link";

interface Mission {
  id: string;
  name: string;
  completed: boolean;
  progress: number;
  target: number;
  reward: number;
}

interface LeaderboardUser {
  rank: number;
  id: string;
  name: string | null;
}

interface HomeTeaserProps {
  missions: Mission[];
  missionsLoading: boolean;
  credits: number | null;
  creditsLoading: boolean;
  leaderboardTop: LeaderboardUser[];
  leaderboardLoading: boolean;
  canSpinToday?: boolean | null;
  spinLoading?: boolean;
}

export default function HomeTeaser({
  missions,
  missionsLoading,
  credits,
  creditsLoading,
  leaderboardTop,
  leaderboardLoading,
  canSpinToday = null,
  spinLoading = false,
}: HomeTeaserProps) {
  return (
    <section
      className="mb-section md:mb-section-lg"
      aria-label="Missioni, wallet, classifica e Spin of the Day"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Spin of the Day — teaser */}
        <Link
          href="/spin"
          className="block rounded-2xl border-2 border-primary/30 bg-primary/5 glass p-4 md:p-5 hover:border-primary/50 hover:shadow-glow-sm transition-all duration-ds-normal group focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-bg outline-none"
        >
          <div className="flex items-center justify-between gap-2 mb-3">
            <h3 className="text-ds-body font-bold text-fg group-hover:text-primary transition-colors">
              🎡 Spin of the Day
            </h3>
            <span className="text-ds-micro font-semibold text-primary">
              Gira →
            </span>
          </div>
          {spinLoading ? (
            <p className="text-ds-body-sm text-fg-muted animate-pulse">Caricamento...</p>
          ) : canSpinToday ? (
            <p className="text-ds-body-sm text-fg">
              Un giro al giorno. Vinci fino a <strong className="text-primary">500 crediti</strong>.
            </p>
          ) : (
            <p className="text-ds-body-sm text-fg-muted">
              Spin di oggi usato. Torna domani.
            </p>
          )}
        </Link>

        {/* Missioni — max 3 */}
        <Link
          href="/missions"
          className="block rounded-2xl border border-border dark:border-white/10 glass p-4 md:p-5 hover:border-primary/20 hover:shadow-glow-sm transition-all duration-ds-normal group focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-bg outline-none"
        >
          <div className="flex items-center justify-between gap-2 mb-3">
            <h3 className="text-ds-body font-bold text-fg group-hover:text-primary transition-colors">
              Missioni
            </h3>
            <span className="text-ds-micro font-semibold text-primary">
              Vedi tutte →
            </span>
          </div>
          {missionsLoading ? (
            <p className="text-ds-body-sm text-fg-muted animate-pulse">Caricamento...</p>
          ) : missions.length === 0 ? (
            <p className="text-ds-body-sm text-fg-muted">
              Completa le missioni per guadagnare crediti.
            </p>
          ) : (
            <ul className="space-y-2">
              {missions.slice(0, 3).map((m) => (
                <li
                  key={m.id}
                  className="flex items-center justify-between gap-2 text-ds-body-sm"
                >
                  <span className="text-fg truncate">{m.name}</span>
                  <span className="shrink-0 font-semibold text-primary">
                    {m.completed ? "✓" : `${m.progress}/${m.target}`} · +{m.reward} cr
                  </span>
                </li>
              ))}
            </ul>
          )}
        </Link>

        {/* Wallet */}
        <Link
          href="/wallet"
          className="block rounded-2xl border border-border dark:border-white/10 glass p-4 md:p-5 hover:border-primary/20 hover:shadow-glow-sm transition-all duration-ds-normal group focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-bg outline-none"
        >
          <div className="flex items-center justify-between gap-2 mb-3">
            <h3 className="text-ds-body font-bold text-fg group-hover:text-primary transition-colors">
              Wallet
            </h3>
            <span className="text-ds-micro font-semibold text-primary">
              Dettagli →
            </span>
          </div>
          {creditsLoading ? (
            <p className="text-2xl font-bold text-primary animate-pulse">—</p>
          ) : (
            <p className="text-2xl font-bold text-primary tabular-nums">
              {credits != null ? credits.toLocaleString("it-IT") : "—"} crediti
            </p>
          )}
          <p className="text-ds-body-sm text-fg-muted mt-0.5">
            Saldo attuale
          </p>
        </Link>

        {/* Classifica */}
        <Link
          href="/leaderboard"
          className="block rounded-2xl border border-border dark:border-white/10 glass p-4 md:p-5 hover:border-primary/20 hover:shadow-glow-sm transition-all duration-ds-normal group focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-bg outline-none"
        >
          <div className="flex items-center justify-between gap-2 mb-3">
            <h3 className="text-ds-body font-bold text-fg group-hover:text-primary transition-colors">
              Classifica
            </h3>
            <span className="text-ds-micro font-semibold text-primary">
              Vedi classifica →
            </span>
          </div>
          {leaderboardLoading ? (
            <p className="text-ds-body-sm text-fg-muted animate-pulse">Caricamento...</p>
          ) : leaderboardTop.length === 0 ? (
            <p className="text-ds-body-sm text-fg-muted">
              Fai previsioni per salire in classifica.
            </p>
          ) : (
            <ol className="space-y-1.5">
              {leaderboardTop.slice(0, 3).map((u) => (
                <li
                  key={u.id}
                  className="flex items-center gap-2 text-ds-body-sm"
                >
                  <span className="flex items-center justify-center w-6 h-6 rounded-lg bg-primary/15 text-primary font-bold text-ds-micro">
                    {u.rank}
                  </span>
                  <span className="text-fg truncate">{u.name || "Utente"}</span>
                </li>
              ))}
            </ol>
          )}
        </Link>
      </div>
    </section>
  );
}
