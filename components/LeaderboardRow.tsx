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
    if (rank === 1) return "bg-yellow-50 border-yellow-200";
    if (rank === 2) return "bg-gray-50 border-gray-200";
    if (rank === 3) return "bg-orange-50 border-orange-200";
    return "bg-white border-gray-200";
  };

  return (
    <div
      className={`p-4 rounded-lg border-2 transition-all hover:shadow-md ${
        isCurrentUser ? "ring-2 ring-blue-500" : ""
      } ${getRankColor()}`}
    >
      <div className="flex items-center gap-4">
        {/* Rank */}
        <div className="flex-shrink-0 w-12 text-center">
          <span className="text-2xl font-bold text-gray-700">
            {getRankDisplay()}
          </span>
        </div>

        {/* User Avatar & Name */}
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-lg font-bold flex-shrink-0">
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
              <Link
                href="/profile"
                className="block"
              >
                <h3 className="font-semibold text-gray-900 truncate hover:text-blue-600 transition-colors">
                  {user.name || user.email}
                  <span className="ml-2 text-xs text-blue-600 font-normal">
                    (Tu)
                  </span>
                </h3>
              </Link>
            ) : (
              <h3 className="font-semibold text-gray-900 truncate">
                {user.name || user.email}
              </h3>
            )}
            <p className="text-sm text-gray-500 truncate">{user.email}</p>
          </div>
        </div>

        {/* Stats */}
        <div className="hidden md:flex items-center gap-6 flex-shrink-0">
          {/* Accuracy */}
          <div className="text-center min-w-[80px]">
            <p className="text-xs text-gray-500 mb-1">Accuratezza</p>
            <p className="text-lg font-bold text-blue-600">
              {formatPercentage(accuracy)}
            </p>
            <p className="text-xs text-gray-400">
              {correctPredictions}/{totalPredictions}
            </p>
          </div>

          {/* ROI */}
          <div className="text-center min-w-[80px]">
            <p className="text-xs text-gray-500 mb-1">ROI</p>
            <p
              className={`text-lg font-bold ${
                roi >= 0 ? "text-green-600" : "text-red-600"
              }`}
            >
              {roi >= 0 ? "+" : ""}
              {formatPercentage(roi)}
            </p>
          </div>

          {/* Streak */}
          <div className="text-center min-w-[100px]">
            <p className="text-xs text-gray-500 mb-1">Streak</p>
            <StreakBadge streak={streak} size="sm" />
          </div>
        </div>

        {/* Mobile Stats - Collapsed */}
        <div className="md:hidden flex flex-col gap-2 text-sm">
          <div className="flex items-center gap-4">
            <span className="text-gray-600">Accuratezza:</span>
            <span className="font-semibold text-blue-600">
              {formatPercentage(accuracy)}
            </span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-gray-600">ROI:</span>
            <span
              className={`font-semibold ${
                roi >= 0 ? "text-green-600" : "text-red-600"
              }`}
            >
              {roi >= 0 ? "+" : ""}
              {formatPercentage(roi)}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-gray-600">Streak:</span>
            <StreakBadge streak={streak} size="sm" />
          </div>
        </div>
      </div>
    </div>
  );
}
