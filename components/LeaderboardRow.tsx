"use client";

import StreakBadge from "./StreakBadge";
import Link from "next/link";

interface LeaderboardRowProps {
  rank: number;
  user: {
    id: string;
    name: string | null;
    email: string;
    image: string | null;
  };
  accuracy: number;
  score: number;
  streak: number;
  totalPredictions: number;
  correctPredictions: number;
  isCurrentUser?: boolean;
}

export default function LeaderboardRow({
  rank,
  user,
  accuracy,
  score,
  streak,
  totalPredictions,
  correctPredictions,
  isCurrentUser = false,
}: LeaderboardRowProps) {
  const formatPercentage = (value: number) => {
    return `${Math.round(value * 100) / 100}%`;
  };

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat("it-IT").format(amount);
  };

  // Medal emojis for top 3
  const getRankDisplay = () => {
    if (rank === 1) return "🥇";
    if (rank === 2) return "🥈";
    if (rank === 3) return "🥉";
    return `#${rank}`;
  };

  const getRankColor = () => {
    if (rank === 1) return "bg-amber-500/15 border-amber-500/40 dark:border-amber-400/30";
    if (rank === 2) return "bg-surface/50 border-border dark:border-white/10";
    if (rank === 3) return "bg-orange-500/15 border-orange-500/40 dark:border-orange-400/30";
    return "glass border-border dark:border-white/10";
  };

  return (
    <div
      className={`p-4 rounded-2xl border transition-all ${getRankColor()} ${
        isCurrentUser ? "ring-2 ring-primary" : ""
      }`}
    >
      <div className="flex items-center gap-3 md:gap-4">
        <div className="flex-shrink-0 w-10 md:w-12 text-center">
          <span className="text-xl md:text-2xl font-bold text-fg-muted">
            {getRankDisplay()}
          </span>
        </div>

        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-gradient-to-br from-primary to-accent-700 flex items-center justify-center text-white text-lg font-bold flex-shrink-0">
            {user.image ? (
              <img
                src={user.image}
                alt={user.name || "User"}
                className="w-full h-full rounded-full object-cover"
              />
            ) : (
              (user.name || user.email)[0].toUpperCase()
            )}
          </div>
          <div className="min-w-0 flex-1">
            {isCurrentUser ? (
              <Link href="/profile" className="block">
                <h3 className="font-semibold text-fg truncate hover:text-primary transition-colors">
                  {user.name || user.email}
                  <span className="ml-2 text-xs text-primary font-normal">(Tu)</span>
                </h3>
              </Link>
            ) : (
              <Link href={`/profile/${user.id}`} className="block">
                <h3 className="font-semibold text-fg truncate hover:text-primary transition-colors">
                  {user.name || user.email}
                </h3>
              </Link>
            )}
            <p className="text-xs text-fg-muted truncate">{user.email}</p>
          </div>
        </div>

        <div className="hidden md:flex items-center gap-4 flex-shrink-0">
          <div className="text-center min-w-[70px]">
            <p className="text-[10px] text-fg-muted uppercase font-semibold mb-0.5">Accuratezza %</p>
            <p className="text-base font-bold text-primary">{formatPercentage(accuracy)}</p>
            <p className="text-[10px] text-fg-subtle">{correctPredictions}/{totalPredictions}</p>
          </div>
          <div className="text-center min-w-[80px]">
            <p className="text-[10px] text-fg-muted uppercase font-semibold mb-0.5">Serie</p>
            <StreakBadge streak={streak} size="sm" />
          </div>
          <div
            className="text-center min-w-[70px]"
            title="Punteggio basato su previsioni corrette e consistenza."
          >
            <p className="text-[10px] text-fg-muted uppercase font-semibold mb-0.5">Punteggio</p>
            <p className="text-base font-bold text-fg">{score.toFixed(1)}</p>
          </div>
        </div>

        <div className="md:hidden flex flex-wrap gap-x-4 gap-y-1 text-sm">
          <span className="font-semibold text-primary">{formatPercentage(accuracy)}</span>
          <StreakBadge streak={streak} size="sm" />
          <span className="font-semibold text-fg" title="Punteggio basato su previsioni corrette e consistenza.">
            {score.toFixed(1)}
          </span>
        </div>
      </div>
    </div>
  );
}
