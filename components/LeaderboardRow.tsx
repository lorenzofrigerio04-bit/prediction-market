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
  roi: number;
  streak: number;
  totalPredictions: number;
  correctPredictions: number;
  isCurrentUser?: boolean;
}

export default function LeaderboardRow({
  rank,
  user,
  accuracy,
  roi,
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
    if (rank === 1) return "bg-amber-50 border-amber-200";
    if (rank === 2) return "bg-slate-50 border-slate-200";
    if (rank === 3) return "bg-orange-50 border-orange-200";
    return "bg-slate-50/50 border-slate-100";
  };

  return (
    <div
      className={`p-4 rounded-2xl border-2 transition-all ${getRankColor()} ${
        isCurrentUser ? "ring-2 ring-accent-500" : ""
      }`}
    >
      <div className="flex items-center gap-3 md:gap-4">
        <div className="flex-shrink-0 w-10 md:w-12 text-center">
          <span className="text-xl md:text-2xl font-bold text-slate-700">
            {getRankDisplay()}
          </span>
        </div>

        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-gradient-to-br from-accent-500 to-violet-500 flex items-center justify-center text-white text-lg font-bold flex-shrink-0">
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
                <h3 className="font-semibold text-slate-900 truncate hover:text-accent-600 transition-colors">
                  {user.name || user.email}
                  <span className="ml-2 text-xs text-accent-600 font-normal">(Tu)</span>
                </h3>
              </Link>
            ) : (
              <h3 className="font-semibold text-slate-900 truncate">{user.name || user.email}</h3>
            )}
            <p className="text-xs text-slate-500 truncate">{user.email}</p>
          </div>
        </div>

        <div className="hidden md:flex items-center gap-4 flex-shrink-0">
          <div className="text-center min-w-[70px]">
            <p className="text-[10px] text-slate-500 uppercase font-semibold mb-0.5">Accur.</p>
            <p className="text-base font-bold text-accent-600">{formatPercentage(accuracy)}</p>
            <p className="text-[10px] text-slate-400">{correctPredictions}/{totalPredictions}</p>
          </div>
          <div className="text-center min-w-[70px]">
            <p className="text-[10px] text-slate-500 uppercase font-semibold mb-0.5">ROI</p>
            <p className={`text-base font-bold ${roi >= 0 ? "text-emerald-600" : "text-red-600"}`}>
              {roi >= 0 ? "+" : ""}{formatPercentage(roi)}
            </p>
          </div>
          <div className="text-center min-w-[80px]">
            <p className="text-[10px] text-slate-500 uppercase font-semibold mb-0.5">Streak</p>
            <StreakBadge streak={streak} size="sm" />
          </div>
        </div>

        <div className="md:hidden flex flex-wrap gap-x-4 gap-y-1 text-sm">
          <span className="font-semibold text-accent-600">{formatPercentage(accuracy)}</span>
          <span className={`font-semibold ${roi >= 0 ? "text-emerald-600" : "text-red-600"}`}>
            {roi >= 0 ? "+" : ""}{formatPercentage(roi)}
          </span>
          <StreakBadge streak={streak} size="sm" />
        </div>
      </div>
    </div>
  );
}
