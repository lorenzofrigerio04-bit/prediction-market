"use client";

import Link from "next/link";

const RARITY_BORDER: Record<string, string> = {
  COMMON: "border-slate-400/30 dark:border-slate-500/40",
  RARE: "border-primary/40 dark:border-primary/50",
  EPIC: "border-purple-400/40 dark:border-purple-400/50",
  LEGENDARY: "border-amber-400/50 dark:border-amber-400/60",
};

export interface LeaderboardBadgeItem {
  id: string;
  name: string;
  icon: string | null;
  rarity: string;
}

interface LeaderboardRowProps {
  rank: number;
  totalUsers: number;
  user: {
    id: string;
    name: string | null;
    email: string;
    image: string | null;
  };
  badges: LeaderboardBadgeItem[];
  correctPredictions: number;
  isCurrentUser?: boolean;
}

export default function LeaderboardRow({
  rank,
  user,
  badges,
  correctPredictions,
  isCurrentUser = false,
}: LeaderboardRowProps) {
  const getRankDisplay = () => {
    if (rank === 1) return "🥇";
    if (rank === 2) return "🥈";
    if (rank === 3) return "🥉";
    return `#${rank}`;
  };

  const baseBoxClass = "rounded-2xl border p-3 transition-all sm:p-4 border-black/10 dark:border-white/10 bg-white/5 dark:bg-white/5";
  const currentUserHighlightClass = isCurrentUser
    ? "ring-2 ring-primary bg-primary/10 dark:bg-primary/15 border-primary/30 dark:border-primary/40 shadow-[0_0_20px_-6px_rgba(var(--primary-glow),0.3)]"
    : "";

  const displayName = user.name || user.email || "Utente";

  return (
    <div className={`${baseBoxClass} ${currentUserHighlightClass}`}>
      <div className="flex flex-wrap items-center gap-2 sm:gap-3">
        {/* Posizione */}
        <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-black/10 dark:bg-white/10 text-lg font-bold text-fg sm:h-12 sm:w-12 sm:text-xl">
          {getRankDisplay()}
        </div>
        {/* Avatar in alto a sinistra (object-top per ritaglio) */}
        <div className="flex h-10 w-10 flex-shrink-0 overflow-hidden rounded-xl bg-gradient-to-br from-primary to-accent-700 text-white sm:h-12 sm:w-12">
          {user.image ? (
            <img
              src={user.image}
              alt={displayName}
              className="h-full w-full object-cover object-top"
            />
          ) : (
            <span className="flex h-full w-full items-center justify-center text-base font-bold sm:text-lg">
              {displayName[0].toUpperCase()}
            </span>
          )}
        </div>
        {/* Nome per intero + previsioni corrette */}
        <div className="min-w-0 flex-1">
          {isCurrentUser ? (
            <Link href="/profile" className="block">
              <span className="font-semibold text-fg break-words hover:text-primary transition-colors">
                {displayName}
              </span>
              <span className="ml-1.5 text-xs font-normal text-primary">(Tu)</span>
            </Link>
          ) : (
            <Link href={`/profile/${user.id}`} className="block">
              <span className="font-semibold text-fg break-words hover:text-primary transition-colors">
                {displayName}
              </span>
            </Link>
          )}
          <p className="mt-0.5 text-xs text-fg-muted sm:text-sm">
            {correctPredictions}{" "}
            {correctPredictions === 1 ? "previsione corretta" : "previsioni corrette"}
          </p>
        </div>
        {/* Badge in fila in alto a destra (stemmi) */}
        {badges.length > 0 && (
          <div className="flex flex-shrink-0 flex-wrap items-center justify-end gap-1.5">
            {badges.map((badge) => (
              <span
                key={badge.id}
                title={badge.name}
                className={`inline-flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg border bg-black/5 text-base dark:bg-white/10 sm:h-9 sm:w-9 sm:text-lg ${RARITY_BORDER[badge.rarity] ?? RARITY_BORDER.COMMON}`}
                aria-label={badge.name}
              >
                {badge.icon || "🏆"}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
